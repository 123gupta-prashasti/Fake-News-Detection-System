import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { StandaloneClaimVerification } from '../types';
import { Search, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Loader2, BookOpen, Layers, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface ClaimVerificationPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const BENCHMARK_CLAIMS = [
  {
    label: "A. Apollo 11 Mars Claim",
    text: "The Apollo 11 mission landed humans on Mars in 1969.",
    expected: "Contradicted"
  },
  {
    label: "B. India Independence",
    text: "India became independent on 15 August 1947.",
    expected: "Supported"
  },
  {
    label: "C. Earth Largest Planet",
    text: "The Earth is the largest planet in the Solar System.",
    expected: "Contradicted"
  },
  {
    label: "D. Moon Is a Star",
    text: "The Moon is a star that produces its own light.",
    expected: "Contradicted"
  },
  {
    label: "E. BlueNova Technologies",
    text: "A company named BlueNova Technologies will launch a new smartphone on 18 December 2026.",
    expected: "Insufficient Evidence"
  }
];

export const ClaimVerificationPage: React.FC<ClaimVerificationPageProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [inputClaim, setInputClaim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<StandaloneClaimVerification[]>([]);

  const handleVerify = async (textToVerify: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in or use a demo account to verify claims.', 'info');
      onNavigate('login');
      return;
    }

    if (!textToVerify || textToVerify.trim().length < 5) {
      showToast('Please enter a factual claim to verify.', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.verifyClaim(textToVerify.trim());
      setResults((prev) => [res.result, ...prev.filter((item) => item.claimText !== res.result.claimText)]);
      showToast(`Verification completed: ${res.result.verdict}`, res.result.verdict === 'Supported' ? 'success' : res.result.verdict === 'Contradicted' ? 'error' : 'info');
    } catch (err: any) {
      showToast(err.message || 'Evidence retrieval or verification failed.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadBenchmark = (claimText: string) => {
    setInputClaim(claimText);
    handleVerify(claimText);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Authoritative Fact-Checking</div>
          <h1 className="text-2xl font-bold text-white mt-1">Claim-Level Verification Pipeline</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-references assertions against authoritative scientific, institutional, and encyclopedic consensus records
          </p>
        </div>
      </div>

      {/* Input Form & Benchmark Suite */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Submit Factual Claim for Verification</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputClaim}
              onChange={(e) => setInputClaim(e.target.value)}
              placeholder="e.g. The Apollo 11 mission landed humans on Mars in 1969..."
              className="flex-1 px-3.5 py-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={() => handleVerify(inputClaim)}
              disabled={isVerifying || !inputClaim.trim()}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm shadow-sky-900/40"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Retrieving Evidence...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Claim</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Benchmark Test Suite Strip */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Benchmark Verification Cases (Click to Test Real Pipeline):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BENCHMARK_CLAIMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => loadBenchmark(item.text)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs transition-colors text-left flex items-center gap-2 group"
              >
                <span className="font-semibold text-slate-200 group-hover:text-cyan-300">{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  item.expected === 'Supported'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : item.expected === 'Contradicted'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                }`}>
                  {item.expected}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="font-semibold text-slate-200">Verified Evidence & Comparative Audit Reports</div>
          <span>Verdicts: Supported · Contradicted · Insufficient Evidence</span>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((res, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    {res.verdict === 'Supported' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Supported</span>
                      </span>
                    )}
                    {res.verdict === 'Contradicted' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        <XCircle className="w-4 h-4" />
                        <span>Contradicted</span>
                      </span>
                    )}
                    {res.verdict === 'Insufficient Evidence' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Insufficient Evidence</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-mono">
                      Calibrated Confidence: <strong className="text-slate-200">{res.confidence}%</strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Evidence Protocol: Authoritative Consensus Verification
                  </span>
                </div>

                {/* The Claim Text */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-sm font-semibold text-slate-100 font-mono leading-relaxed">
                  "{res.claimText}"
                </div>

                {/* Conflicting details alert banner if contradicted */}
                {res.conflictingDetails && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-rose-200">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Factual Contradiction Detected:</span>
                    </div>
                    <p className="leading-relaxed">{res.conflictingDetails}</p>
                  </div>
                )}

                {/* Explanation */}
                <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 leading-relaxed">
                  <strong className="text-cyan-400">Verification Synthesis: </strong>
                  {res.explanation}
                </div>

                {/* Evidence Card */}
                {res.evidence && (
                  <div className="p-4 rounded-lg bg-slate-950 border border-cyan-900/40 text-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span>{res.evidence.source}</span>
                      </div>
                      {res.evidence.url && (
                        <a
                          href={res.evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>View Authoritative Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-slate-300 italic leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80 font-serif">
                      "{res.evidence.snippet}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Publisher: {res.evidence.publisher || 'Verified Reference'}</span>
                      <span className="text-emerald-400/90 font-medium">{res.evidence.credibilityRating}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">No Claims Evaluated Yet</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Click any of the benchmark cases above or type a custom assertion to query real authoritative encyclopedic records and evaluate semantic support or contradiction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
