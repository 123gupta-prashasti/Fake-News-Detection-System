import React, { useState } from 'react';
import { Shield, Sparkles, CheckCircle2, ArrowRight, BookOpen, Layers, Search, Cpu, FileCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/RiskBadge';

interface LandingPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const PRESET_SAMPLES = [
  {
    title: 'Medical Miracle Cure Hoax',
    category: 'health',
    text: 'BREAKING: Scientists confirm drinking boiled lemon water cure all stages of cancer in 48 hours without chemotherapy doctors hate this!',
    expected: 'Likely Fake'
  },
  {
    title: 'Department of Labor Economic Release',
    category: 'economy',
    text: 'The Department of Labor reported that nonfarm payroll employment rose by 216,000 in December, with unemployment holding steady at 3.7 percent according to official statistics.',
    expected: 'Likely Real'
  },
  {
    title: 'Underground Bunker Conspiracy',
    category: 'technology',
    text: 'SCANDALOUS COVER-UP: Tech billionaires purchased underground bunker compounds in New Zealand because an asteroid will collide with Earth in 60 days!',
    expected: 'Likely Fake'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, quickLoginAsDemo } = useAuth();
  const [selectedSample, setSelectedSample] = useState(PRESET_SAMPLES[0]);

  const handleRunSample = (sample: typeof PRESET_SAMPLES[0]) => {
    onNavigate('analysis', { sampleText: sample.text, sampleTitle: sample.title, category: sample.category });
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-3 py-1 rounded-full">
            <Cpu className="w-3.5 h-3.5" />
            <span>Academic B.Tech Computer Science Capstone System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
            Multi-Layer Misinformation Detection & Real-Time Claim Verification
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            NewsVerify combines statistical machine learning (TF-IDF + Logistic Regression), linguistic manipulation auditing, open knowledge-base claim cross-referencing, and explainable AI feature attribution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('analysis')}
              className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-900/30 flex items-center gap-2"
            >
              <span>Analyze News Article</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('claims')}
              className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Verify Single Claim</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => quickLoginAsDemo('analyst')}
                className="px-4 py-3 rounded-lg bg-cyan-950/40 border border-cyan-800/80 text-cyan-300 font-medium text-sm hover:bg-cyan-900/50 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Instant Demo Access</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Interactive Benchmark Teaser */}
        <div className="mt-14 max-w-4xl mx-auto rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Interactive Classifier Preview</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a benchmark dataset sample to inspect how the multi-signal engine scores it
              </p>
            </div>
            <div className="flex items-center gap-2">
              {PRESET_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSample(sample)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedSample.title === sample.title
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Sample {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 text-sm leading-relaxed font-mono">
              "{selectedSample.text}"
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Domain Category: <strong className="text-slate-200 capitalize">{selectedSample.category}</strong></span>
                <span>·</span>
                <span>Expected Ground Truth:</span>
                <RiskBadge classification={selectedSample.expected} />
              </div>

              <button
                onClick={() => handleRunSample(selectedSample)}
                className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Run Full Multi-Layer Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">System Architecture & Verification Layers</h2>
          <p className="text-sm text-slate-400 mt-2">
            No single signal is sufficient. NewsVerify synthesizes 4 decoupled audit modules to form a calibrated risk score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950/70 border border-sky-800/80 flex items-center justify-center text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">1. Baseline ML Classifier</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained on curated LIAR and FakeNewsNet benchmark corpora using sublinear TF-IDF and L2-regularized Logistic Regression ($C=1.5$).
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">2. Explainable AI (XAI)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates exact token feature contributions (Beta_i · x_i), visually highlighting specific words driving towards fake or real.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">3. Claim Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts discrete factual assertions with sentence segmentation and queries open encyclopedic consensus via Wikipedia endpoints.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/70 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">4. Linguistic & Source Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes rhetorical manipulation (sensationalism, clickbait, excessive ALL-CAPS) and evaluates publisher provenance without assuming HTTPS guarantees honesty.
            </p>
          </div>
        </div>
      </section>

      {/* Decision Thresholds Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-8">
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-white">Calibrated 3-Level Outcome Framework</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Distinguishing statistical model confidence from composite misinformation risk score:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400 text-sm">Likely Real</span>
                <span className="text-xs font-mono text-emerald-500 tabular-nums">&lt; 35 Risk Score</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strong journalistic attribution, objective rhetoric, high lexical alignment with wire services, and no contradicted factual assertions.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300 text-sm">Suspicious / Needs Verification</span>
                <span className="text-xs font-mono text-amber-400 tabular-nums">35 – 65 Risk Score</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ambiguous signals, unverified factual claims, partial author metadata, or moderate stylistic framing requiring independent reader scrutiny.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-400 text-sm">Likely Fake</span>
                <span className="text-xs font-mono text-rose-500 tabular-nums">&gt; 65 Risk Score</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                High statistical alignment with disinformation lexicons, heavy clickbait/sensationalism, anonymous attribution, or debunked factual claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-xl font-bold text-white">Full B.Tech Computer Science Project Documentation</h3>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto">
            Review the mathematical proofs, scikit-learn training pipeline scripts, confusion matrix evaluation, and API schemas.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('about')}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Project Thesis & Docs</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
