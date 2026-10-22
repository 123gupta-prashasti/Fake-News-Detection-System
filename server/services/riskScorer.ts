import { PredictionResult } from '../ml/inference.js';
import { LinguisticIndicators } from './manipulationAnalyzer.js';
import { SourceCredibilityAssessment } from './sourceCredibility.js';
import { ExtractedClaim } from './claimExtractor.js';

export interface CompositeRiskAssessment {
  overallRiskScore: number; // 0 - 100
  classification: 'Likely Real' | 'Suspicious / Needs Verification' | 'Likely Fake';
  modelConfidence: number;  // 0 - 100
  mlProbabilityFake: number; // 0 - 1
  scoreBreakdown: {
    mlContribution: number;
    linguisticContribution: number;
    sourceRiskContribution: number;
    claimContradictionContribution: number;
  };
  primaryRiskDrivers: string[];
  reasons: string[];
}

export function computeCompositeRisk(
  mlResult: PredictionResult,
  linguistic: LinguisticIndicators,
  source: SourceCredibilityAssessment,
  claims: ExtractedClaim[]
): CompositeRiskAssessment {
  // 1. ML component (45%)
  const mlScore = mlResult.probabilityFake * 100;
  const mlContribution = mlScore * 0.45;

  // 2. Linguistic Manipulation component (25%)
  const linguisticScore = linguistic.compositeManipulationScore;
  const linguisticContribution = linguisticScore * 0.25;

  // 3. Source Risk component (15%)
  // High source credibility reduces risk; low source credibility increases risk
  const sourceRiskScore = 100 - source.credibilityScore;
  const sourceRiskContribution = sourceRiskScore * 0.15;

  // 4. Claim verification outcomes component (15%)
  let claimRiskScore = 50; // Neutral baseline when no claims or all unverified
  if (claims.length > 0) {
    const contradictedCount = claims.filter(c => c.verificationStatus === 'Contradicted').length;
    const supportedCount = claims.filter(c => c.verificationStatus === 'Supported').length;

    if (contradictedCount > 0) {
      // Contradicted factual claims drastically elevate risk
      claimRiskScore = Math.min(100, 70 + contradictedCount * 15 - supportedCount * 10);
    } else if (supportedCount > 0) {
      // Supported factual claims lower risk
      claimRiskScore = Math.max(10, 40 - supportedCount * 10);
    }
  }
  const claimContradictionContribution = claimRiskScore * 0.15;

  // Total calibrated risk score (0 - 100)
  let rawRisk = mlContribution + linguisticContribution + sourceRiskContribution + claimContradictionContribution;

  // Factual Contradiction Override: If any claim is directly contradicted by verified records,
  // the article contains demonstrable falsehood and cannot be classified as "Likely Real".
  const contradictedCount = claims.filter(c => c.verificationStatus === 'Contradicted').length;
  if (contradictedCount > 0) {
    rawRisk = Math.max(rawRisk, 72 + Math.min(25, contradictedCount * 8));
  }

  const overallRiskScore = Math.max(0, Math.min(100, Math.round(rawRisk)));

  // Three-level decision threshold
  let classification: 'Likely Real' | 'Suspicious / Needs Verification' | 'Likely Fake';
  if (overallRiskScore < 35 && contradictedCount === 0) {
    classification = 'Likely Real';
  } else if (overallRiskScore > 65 || contradictedCount > 0) {
    classification = 'Likely Fake';
  } else {
    classification = 'Suspicious / Needs Verification';
  }

  // Calculate calibrated confidence based on alignment between modules
  let calibratedConfidence = mlResult.modelConfidence;
  if (contradictedCount > 0) {
    calibratedConfidence = Math.max(calibratedConfidence, 92);
  } else if (claims.some(c => c.verificationStatus === 'Supported')) {
    calibratedConfidence = Math.max(calibratedConfidence, 88);
  } else if (claims.every(c => c.verificationStatus === 'Insufficient Evidence')) {
    calibratedConfidence = Math.min(calibratedConfidence, 60);
  }

  // Generate explainable reasons
  const reasons: string[] = [];
  const primaryRiskDrivers: string[] = [];

  // ML reasons
  if (mlResult.probabilityFake > 0.65) {
    primaryRiskDrivers.push('Statistical lexical patterns aligned with disinformation corpora');
    reasons.push(`The baseline TF-IDF Logistic Regression classifier flagged strong lexical markers of unverified content (P(Fake) = ${(mlResult.probabilityFake * 100).toFixed(1)}%).`);
  } else if (mlResult.probabilityFake < 0.35) {
    reasons.push(`The statistical classifier recognized formal journalistic phrasing characteristic of wire services and institutional statements (P(Real) = ${(mlResult.probabilityReal * 100).toFixed(1)}%).`);
  }

  // Linguistic reasons
  if (linguistic.compositeManipulationScore >= 50) {
    primaryRiskDrivers.push('Sensational or manipulative rhetoric');
    reasons.push(`Elevated linguistic manipulation score (${linguistic.compositeManipulationScore}/100), with detected markers including sensationalism and clickbait framing.`);
  }

  // Source reasons
  if (source.verdict === 'Low Credibility') {
    primaryRiskDrivers.push('Weak or anonymous publisher attribution');
    reasons.push('Source metadata lacks standard institutional authorship, byline accountability, or recognized editorial registry.');
  } else if (source.verdict === 'High Credibility') {
    reasons.push(`Source demonstrates transparent provenance (${source.domain || source.publisher || 'Verified entity'}) with explicit citations.`);
  }

  // Claims reasons
  const contradicted = claims.filter(c => c.verificationStatus === 'Contradicted');
  if (contradicted.length > 0) {
    primaryRiskDrivers.push('Contradicted factual assertions');
    reasons.push(`${contradicted.length} factual claim(s) directly contradicted by open knowledge base references.`);
  }

  if (reasons.length === 0) {
    reasons.push('Assessment synthesizes balanced textual signals without extreme risk triggers.');
  }

  return {
    overallRiskScore,
    classification,
    modelConfidence: calibratedConfidence,
    mlProbabilityFake: mlResult.probabilityFake,
    scoreBreakdown: {
      mlContribution: parseFloat(mlContribution.toFixed(1)),
      linguisticContribution: parseFloat(linguisticContribution.toFixed(1)),
      sourceRiskContribution: parseFloat(sourceRiskContribution.toFixed(1)),
      claimContradictionContribution: parseFloat(claimContradictionContribution.toFixed(1))
    },
    primaryRiskDrivers,
    reasons
  };
}
