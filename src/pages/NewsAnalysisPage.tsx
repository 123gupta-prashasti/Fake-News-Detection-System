import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { NewsAnalysis } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { Globe, FileText, Sparkles, AlertCircle, ArrowRight, Loader2, CheckCircle2, Shield, Search } from 'lucide-react';

interface NewsAnalysisPageProps {
  initialParams?: Record<string, string>;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'Medical Cure Hoax',
    category: 'health',
    headline: 'Drinking Boiled Lemon Water Cures All Cancer Stages',
    text: 'BREAKING: Scientists confirm drinking boiled lemon water cure all stages of cancer in 48 hours without chemotherapy doctors hate this!'
  },
  {
    name: 'Government Payroll Report',
    category: 'economy',
    headline: 'Bureau of Labor Statistics December Jobs Report',
    text: 'The Department of Labor reported that nonfarm payroll employment rose by 216,000 in December, with unemployment holding steady at 3.7 percent according to official statistics.'
  },
  {
    name: 'Space Research Breakthrough',
    category: 'science',
    headline: 'JWST Detects Water Vapor in Exoplanet Atmosphere',
    text: "NASA's James Webb Space Telescope observed the atmospheric composition of exoplanet WASP-96b, detecting definitive signatures of water vapor and cloud haze according to researchers at the space agency."
  },
  {
    name: 'Sensational Celebrity Hoax',
    category: 'entertainment',
    headline: 'Famous Pop Star Replaced by Synthetic Android Robot',
    text: 'CONFIDENTIAL LEAK: Leaked audio from sound engineering crew proves famous pop singer was replaced by an underground android robot designed to mind control stadium crowds!'
  }
];

export const NewsAnalysisPage: React.FC<NewsAnalysisPageProps> = ({ initialParams, onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'text' | 'url'>('text');
  const [headline, setHeadline] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('general');

  // URL extraction preview state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<{
    title: string;
    domain: string;
    author: string | null;
    publishDate: string | null;
    text: string;
    wordCount: number;
  } | null>(null);

  // Analysis running state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NewsAnalysis | null>(null);

  // Handle incoming parameters from Landing Page or elsewhere
  useEffect(() => {
    if (initialParams?.sampleText) {
      setText(initialParams.sampleText);
    }
    if (initialParams?.sampleTitle) {
      setHeadline(initialParams.sampleTitle);
    }
    if (initialParams?.category) {
      setCategory(initialParams.category);
    }
  }, [initialParams]);

  const loadSample = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    setMode('text');
    setHeadline(sample.headline);
    setText(sample.text);
    setCategory(sample.category);
    setExtractedPreview(null);
    setAnalysisResult(null);
    showToast(`Loaded "${sample.name}" template`, 'info');
  };

  const handleExtractUrlPreview = async () => {
    if (!url || !url.trim()) {
      showToast('Please enter an article URL.', 'error');
      return;
    }
    setIsExtracting(true);
    setExtractedPreview(null);
    try {
      const res = await api.extractAndPreviewUrl(url.trim());
      setExtractedPreview(res.extractedArticle);
      setHeadline(res.extractedArticle.title || '');
      showToast('Article content extracted with SSRF verification.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to extract article content from URL.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in or use a demo account to execute news analyses.', 'info');
      onNavigate('login');
      return;
    }

    if (mode === 'url' && !extractedPreview && (!url || !url.trim())) {
      showToast('Please enter a valid article URL.', 'error');
      return;
    }

    const payloadText = mode === 'url' && extractedPreview ? extractedPreview.text : text;

    if (!payloadText || payloadText.trim().length < 20) {
      showToast('Please provide at least 20 characters of article text or claims.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      if (mode === 'url' && !extractedPreview) {
        // Direct URL analysis
        const res = await api.analyzeUrl(url.trim());
        setAnalysisResult(res.analysis);
        showToast('Analysis completed successfully!', 'success');
      } else {
        // Text analysis (or pre-extracted URL text)
        const res = await api.analyzeText({
          text: payloadText,
          headline: headline.trim() || undefined,
          category,
          sourceUrl: mode === 'url' ? url.trim() : undefined,
        });
        setAnalysisResult(res.analysis);
        showToast('Analysis completed successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Analysis failed.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Multi-Signal Verification</div>
          <h1 className="text-2xl font-bold text-white mt-1">News Article Analysis</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit text or a verified URL to run ML classification, rhetorical manipulation analysis, and claim audits
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Benchmarks:</span>
          {SAMPLE_TEMPLATES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(sample)}
              className="px-2.5 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            {/* Input Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 max-w-xs">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'text' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text / Headline</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'url' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Article URL</span>
              </button>
            </div>

            {/* Mode: URL input */}
            {mode === 'url' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Target Article URL</span>
                    <span className="text-[11px] text-cyan-400/90 font-mono">SSRF & DNS rebinding protected</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://apnews.com/article/example-story"
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={isExtracting || !url}
                      onClick={handleExtractUrlPreview}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 disabled:opacity-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Extract & Preview</span>
                    </button>
                  </div>
                </div>

                {/* Preview Box if Extracted */}
                {extractedPreview && (
                  <div className="p-4 rounded-lg bg-slate-950 border border-cyan-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-300">Extracted Article Content</span>
                      <span className="text-slate-400 font-mono tabular-nums">{extractedPreview.wordCount} words</span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">{extractedPreview.title}</div>
                    <div className="text-[11px] text-slate-400 max-h-32 overflow-y-auto p-2 bg-slate-900/50 rounded border border-slate-800/80 leading-relaxed font-mono">
                      {extractedPreview.text.slice(0, 500)}...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode: Text & Headline Input */}
            {mode === 'text' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Article Headline (Optional)</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Health Ministry Issues Advisory on Viral Respiratory Outbreak"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-slate-300">News Text or Statement Body</label>
                    <span className="text-slate-500 font-mono tabular-nums">{text.length} chars</span>
                  </div>
                  <textarea
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the full article text, statement, or viral claim here..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Subject Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="general">General News</option>
                      <option value="politics">Politics & Governance</option>
                      <option value="health">Health & Medicine</option>
                      <option value="science">Science & Technology</option>
                      <option value="economy">Economy & Finance</option>
                      <option value="entertainment">Entertainment & Culture</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Run Analysis Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleRunAnalysis}
                className="w-full py-3 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-900/40"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing 4-Layer Verification Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Run Multi-Layer Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview / Result Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {analysisResult ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-cyan-800/60 shadow-xl space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="text-xs font-semibold text-slate-300">Analysis Completed</div>
                <RiskBadge classification={analysisResult.prediction} score={analysisResult.overallRiskScore} />
              </div>

              {/* Composite Score Meter */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Misinformation Risk Score</span>
                  <span className="font-mono font-bold text-base text-white tabular-nums">
                    {analysisResult.overallRiskScore}/100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      analysisResult.overallRiskScore > 65
                        ? 'bg-rose-500'
                        : analysisResult.overallRiskScore > 35
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${analysisResult.overallRiskScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Likely Real)</span>
                  <span>35 (Threshold)</span>
                  <span>65 (Threshold)</span>
                  <span>100 (Likely Fake)</span>
                </div>
              </div>

              {/* Sub-signals Snapshot */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">ML Confidence</div>
                  <div className="text-base font-mono font-bold text-cyan-300 mt-1 tabular-nums">
                    {analysisResult.modelConfidence}%
                  </div>
                  <div className="text-[10px] text-slate-500">TF-IDF Logit: {analysisResult.mlProbabilityFake.toFixed(2)} P(Fake)</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Manipulation</div>
                  <div className="text-base font-mono font-bold text-amber-300 mt-1 tabular-nums">
                    {analysisResult.linguisticIndicators.compositeManipulationScore}/100
                  </div>
                  <div className="text-[10px] text-slate-500">Stylistic rhetoric</div>
                </div>
              </div>

              {/* Primary reasons summary */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Decision Reasons</div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {analysisResult.reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Details Action Button */}
              <button
                onClick={() => onNavigate('details', { id: analysisResult._id })}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>View Full Explainable AI Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4 py-16">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <div className="text-sm font-semibold text-slate-200">No Active Analysis</div>
                <p className="text-xs text-slate-400">
                  Input news text or an article URL on the left and run analysis to inspect explainable feature weights and claims.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
