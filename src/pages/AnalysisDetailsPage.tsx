import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { NewsAnalysis } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { FeatureWeightChart } from '../components/FeatureWeightChart';
import {
  ArrowLeft, Shield, AlertTriangle, ShieldCheck, ShieldAlert,
  ExternalLink, FileText, CheckCircle2, XCircle, HelpCircle,
  Cpu, BookOpen, AlertCircle, Calendar, User, Globe
} from 'lucide-react';

interface AnalysisDetailsPageProps {
  id?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AnalysisDetailsPage: React.FC<AnalysisDetailsPageProps> = ({ id, onNavigate }) => {
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      showToast('No analysis ID provided.', 'error');
      onNavigate('history');
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalysisById(id);
        setAnalysis(res.analysis);
      } catch (err: any) {
        showToast(err.message || 'Failed to fetch analysis dossier.', 'error');
        onNavigate('history');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading analysis dossier #{id}...
      </div>
    );
  }

  const { linguisticIndicators, sourceAssessment, claims, featureContributions } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={() => onNavigate('history')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis History</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-400">Dossier ID: {analysis._id}</span>
          <span>·</span>
          <span>{new Date(analysis.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Hero Overview Box */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {analysis.category || 'General News'}
              </span>
              {analysis.sourceDomain && (
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{analysis.sourceDomain}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {analysis.inputHeadline || 'Untitled Analysis Entry'}
            </h1>

            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              Composite synthesis of the statistical Logistic Regression baseline, semantic manipulation indicators, claim-level knowledge base cross-referencing, and publisher provenance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shrink-0 min-w-[240px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Outcome Verdict</span>
              <RiskBadge classification={analysis.prediction} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Misinformation Risk</span>
                <span className="font-mono font-bold text-white tabular-nums">{analysis.overallRiskScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    analysis.overallRiskScore > 65
                      ? 'bg-rose-500'
                      : analysis.overallRiskScore > 35
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${analysis.overallRiskScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-900 text-slate-400 font-mono">
              <span>Model Confidence:</span>
              <span className="text-cyan-300 font-semibold">{analysis.modelConfidence}%</span>
            </div>
          </div>
        </div>

        {/* Primary Justification Bullets */}
        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-300">Explainable Decision Reasons</div>
          <ul className="space-y-1 text-xs text-slate-300">
            {analysis.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Feature Weights & Rhetorical Manipulation (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Feature Attribution Chart */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Statistical Feature Attribution</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">TF-IDF Vector Weights</span>
            </div>
            <p className="text-xs text-slate-400">
              Feature-based explanations showing lexical tokens that mathematically impacted the Logistic Regression logit:
            </p>
            <FeatureWeightChart contributions={featureContributions || []} />
          </div>

          {/* 2. Rhetorical Manipulation Breakdown */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Linguistic Manipulation Indicators</h3>
              </div>
              <span className="text-xs font-mono text-amber-400">
                Score: {linguisticIndicators?.compositeManipulationScore ?? 0}/100
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {linguisticIndicators?.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Sensationalism Meter</span>
                  <span className="font-mono text-amber-400">{linguisticIndicators?.sensationalismScore ?? 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${linguisticIndicators?.sensationalismScore ?? 0}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Clickbait Phrasing</span>
                  <span className="font-mono text-amber-400">{linguisticIndicators?.clickbaitScore ?? 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${linguisticIndicators?.clickbaitScore ?? 0}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Excessive Capitalization</span>
                  <span className="font-mono text-slate-200">{linguisticIndicators?.capsRatio ?? 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${linguisticIndicators?.excessiveCapsScore ?? 0}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Punctuation Exclamations</span>
                  <span className="font-mono text-slate-200">{linguisticIndicators?.exclamationCount ?? 0}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${linguisticIndicators?.punctuationScore ?? 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Disclaimer pill note */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 italic">
              <strong>Academic Disclaimer:</strong> {linguisticIndicators?.disclaimer || 'Linguistic manipulation indicator, not proof of fake news.'}
            </div>
          </div>

          {/* 3. Original Extracted Text Viewer */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Full Processed Article Body</h3>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 max-h-64 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {analysis.extractedText}
            </div>
          </div>
        </div>

        {/* Right Column: Source Credibility & Claims (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* 1. Source Credibility Assessment */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Source Credibility Audit</h3>
              </div>
              <span className="text-xs font-semibold text-cyan-300">
                {sourceAssessment?.verdict}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {sourceAssessment?.summary}
            </p>

            <div className="space-y-2 text-xs">
              {(sourceAssessment?.factors || []).map((factor, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{factor.factor}</span>
                    <span className={`text-[11px] capitalize ${
                      factor.status === 'positive'
                        ? 'text-emerald-400'
                        : factor.status === 'negative'
                        ? 'text-rose-400'
                        : factor.status === 'unverified'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}>
                      {factor.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{factor.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Extracted Factual Claims */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Extracted Factual Claims ({claims.length})</h3>
              </div>
              <span className="text-xs text-slate-500">Wikipedia Cross-Ref</span>
            </div>

            <div className="space-y-3">
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <div key={claim.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      {claim.verificationStatus === 'Supported' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Supported</span>
                        </span>
                      )}
                      {claim.verificationStatus === 'Contradicted' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Contradicted</span>
                        </span>
                      )}
                      {(claim.verificationStatus === 'Insufficient Evidence' || (claim as any).verificationStatus === 'Unverified') && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Insufficient Evidence</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        Confidence: {claim.factualityConfidence}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 font-medium leading-relaxed">
                      "{claim.claimText}"
                    </div>

                    {claim.conflictingDetails && (
                      <div className="p-2 rounded bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-300 font-mono">
                        {claim.conflictingDetails}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded leading-relaxed">
                      {claim.explanation}
                    </div>

                    {claim.evidence && (
                      <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-900">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-semibold truncate max-w-[200px]">
                            {claim.evidence.source}
                          </span>
                          {claim.evidence.url && (
                            <a
                              href={claim.evidence.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                            >
                              <span>View Reference</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No discrete factual assertions met the factuality confidence threshold.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
