import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { predictNews } from '../ml/inference.js';
import { analyzeLinguisticManipulation } from '../services/manipulationAnalyzer.js';
import { assessSourceCredibility } from '../services/sourceCredibility.js';
import { extractFactualClaims } from '../services/claimExtractor.js';
import { verifyAllClaims, verifySingleClaimStandalone } from '../services/evidenceRetriever.js';
import { computeCompositeRisk } from '../services/riskScorer.js';
import { extractArticleFromUrl } from '../services/urlExtractor.js';
import { AnalysisRepo } from '../db/store.js';

const router = Router();

// POST /api/news/analyze-url
// Allows either extracting text preview or extracting and analyzing immediately
router.post('/analyze-url', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url, extractOnly } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'Target URL is required.' });
      return;
    }

    // SSRF-protected extraction
    const extracted = await extractArticleFromUrl(url.trim());

    // If caller requested text preview before full analysis:
    if (extractOnly) {
      res.json({
        success: true,
        extractedArticle: extracted
      });
      return;
    }

    // Full analysis of extracted text
    const fullText = `${extracted.title ? extracted.title + '.\n\n' : ''}${extracted.text}`;
    const mlResult = predictNews(fullText);
    const linguistic = analyzeLinguisticManipulation(fullText);
    const sourceAssessment = assessSourceCredibility({
      url: extracted.url,
      domain: extracted.domain,
      publisher: extracted.publisher,
      author: extracted.author,
      publishDate: extracted.publishDate,
      text: extracted.text
    });
    const rawClaims = extractFactualClaims(extracted.text);
    const verifiedClaims = await verifyAllClaims(rawClaims);
    const composite = computeCompositeRisk(mlResult, linguistic, sourceAssessment, verifiedClaims);

    const savedAnalysis = await AnalysisRepo.create({
      userId: req.user!.id,
      userEmail: req.user!.email,
      inputHeadline: extracted.title,
      rawInputText: extracted.url,
      extractedText: extracted.text.slice(0, 15000),
      inputType: 'url',
      sourceUrl: extracted.url,
      sourceDomain: extracted.domain,
      prediction: composite.classification,
      overallRiskScore: composite.overallRiskScore,
      modelConfidence: composite.modelConfidence,
      mlProbabilityFake: composite.mlProbabilityFake,
      category: 'news',
      featureContributions: mlResult.featureContributions.slice(0, 20),
      linguisticIndicators: linguistic,
      sourceAssessment,
      claims: verifiedClaims,
      reasons: composite.reasons
    });

    res.status(201).json({
      success: true,
      analysis: savedAnalysis,
      composite,
      mlResult,
      linguistic,
      sourceAssessment,
      claims: verifiedClaims,
      extractedArticle: extracted
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'URL processing failed.'
    });
  }
});

// POST /api/news/analyze
router.post('/analyze', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, headline, category, sourceUrl } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      res.status(400).json({
        success: false,
        error: 'Please provide at least 20 characters of article text or claims to analyze.'
      });
      return;
    }

    const fullText = headline ? `${headline}.\n\n${text}` : text;
    const mlResult = predictNews(fullText);
    const linguistic = analyzeLinguisticManipulation(fullText);
    const sourceAssessment = assessSourceCredibility({
      url: sourceUrl || null,
      text: fullText
    });
    const rawClaims = extractFactualClaims(fullText);
    const verifiedClaims = await verifyAllClaims(rawClaims);
    const composite = computeCompositeRisk(mlResult, linguistic, sourceAssessment, verifiedClaims);

    const savedAnalysis = await AnalysisRepo.create({
      userId: req.user!.id,
      userEmail: req.user!.email,
      inputHeadline: headline || null,
      rawInputText: text,
      extractedText: fullText.slice(0, 15000),
      inputType: 'text',
      sourceUrl: sourceUrl || null,
      prediction: composite.classification,
      overallRiskScore: composite.overallRiskScore,
      modelConfidence: composite.modelConfidence,
      mlProbabilityFake: composite.mlProbabilityFake,
      category: category || 'general',
      featureContributions: mlResult.featureContributions.slice(0, 20),
      linguisticIndicators: linguistic,
      sourceAssessment,
      claims: verifiedClaims,
      reasons: composite.reasons
    });

    res.status(201).json({
      success: true,
      analysis: savedAnalysis,
      composite,
      mlResult,
      linguistic,
      sourceAssessment,
      claims: verifiedClaims
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Analysis pipeline failed.'
    });
  }
});

// GET /api/news/history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await AnalysisRepo.findByUserId(req.user!.id);
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch history.' });
  }
});

// GET /api/news/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const analysis = await AnalysisRepo.findById(id);

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Analysis record not found.' });
      return;
    }

    // Role-based or ownership check: users can only see their own analyses, admins can see all
    if (analysis.userId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden. You do not have permission to view this record.' });
      return;
    }

    res.json({
      success: true,
      analysis
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch analysis details.' });
  }
});

// POST /api/news/verify-claim
// Dedicated factual claim verification endpoint against authoritative knowledge bases
router.post('/verify-claim', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string' || claim.trim().length < 5) {
      res.status(400).json({ success: false, error: 'Please provide a valid factual claim to verify.' });
      return;
    }

    const result = await verifySingleClaimStandalone(claim.trim());
    res.json({
      success: true,
      result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Claim verification failed.' });
  }
});

// DELETE /api/news/history/clear
router.delete('/history/clear', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const deletedCount = await AnalysisRepo.clearAll(req.user!.id, isAdmin);
    res.json({
      success: true,
      message: `Successfully cleared ${deletedCount} analysis record(s).`,
      count: deletedCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to clear history.' });
  }
});

// DELETE /api/news/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.role === 'admin';
    const deleted = await AnalysisRepo.deleteById(id, req.user!.id, isAdmin);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Analysis record not found or unauthorized.' });
      return;
    }

    res.json({
      success: true,
      message: 'Analysis record deleted successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete record.' });
  }
});

export default router;
