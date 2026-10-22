import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ModelMetrics } from '../types';
import { ConfusionMatrixChart } from '../components/ConfusionMatrixChart';
import { BookOpen, Cpu, Layers, ShieldCheck, Database, Award, Code, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getModelMetrics();
        setMetrics(res.metrics);
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center sm:text-left pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/60">
          <Award className="w-3.5 h-3.5" />
          <span>Final Year B.Tech Computer Science Engineering Thesis</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          NewsVerify: Explainable Multi-Signal Misinformation Architecture
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          An explainable machine learning and factual verification platform combining natural language processing, statistical feature attribution, open knowledge cross-referencing, and SSRF-hardened web extraction.
        </p>
      </div>

      {/* 1. Problem Statement */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>1. Problem Statement & Motivation</span>
        </h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            The velocity of digital misinformation presents profound threats to civic health, public health compliance, and financial stability. Traditional automated fake news detection approaches suffer from critical flaws:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>Black-Box Incomprehensibility:</strong> Deep learning models deliver opaque probability scores without elucidating the linguistic or factual basis for the decision.</li>
            <li><strong>Single-Point Vulnerability:</strong> Models relying solely on lexical patterns frequently mistake satirical or emotional real news for disinformation, while well-written fake news evades detection.</li>
            <li><strong>Lack of Real-World Corroboration:</strong> Predicting a text as "real" does not guarantee its specific factual assertions are true without external knowledge grounding.</li>
          </ul>
          <p>
            NewsVerify addresses these limitations by introducing a decoupled, 4-pillar verification architecture that exposes transparent feature contributions, linguistic manipulation metrics, and empirical claim references.
          </p>
        </div>
      </section>

      {/* 2. System Architecture Diagram */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <span>2. System Architecture & Information Pipeline</span>
        </h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="text-xs text-slate-400">
            End-to-end data pipeline from user input to explainable risk synthesis:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-cyan-400">Layer 1: Input & SSRF Guard</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Accepts raw text or URL. URL scraper validates DNS and rejects private ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, AWS metadata 169.254.169.254).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-sky-400">Layer 2: ML Statistical Engine</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Executes native Node.js TF-IDF vectorization with sublinear scaling and L2 regularization. Generates class probability P(Fake) and feature weights.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-emerald-400">Layer 3: Claims & Factuality</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Applies sentence segmentation and entity heuristics to extract factual assertions. Cross-references against live Wikipedia encyclopedic search APIs.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-amber-400">Layer 4: Risk Synthesis</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Weights ML ($45\%$), linguistic manipulation ($25\%$), source provenance ($15\%$), and claim outcomes ($15\%$) to compute a calibrated 0-100 score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mathematical Formulation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-400" />
          <span>3. Mathematical Methodology & Formulation</span>
        </h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-4 leading-relaxed font-mono">
          <div className="space-y-1">
            <div className="text-cyan-400 font-bold font-sans text-sm">TF-IDF Feature Representation</div>
            <p className="text-slate-400 font-sans text-xs">
              To dampen the dominance of high-frequency words, we apply sublinear TF scaling:
            </p>
            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-200">
              TF(t, d) = 1 + ln(count(t, d)) &nbsp; [for count &gt; 0]<br />
              IDF(t, D) = ln((1 + |D|) / (1 + DF(t))) + 1<br />
              x_norm = x / ||x||_2
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <div className="text-cyan-400 font-bold font-sans text-sm">Logistic Regression & Feature Contribution</div>
            <p className="text-slate-400 font-sans text-xs">
              Linear combination of normalized features transformed by standard sigmoid:
            </p>
            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-200">
              z = β_0 + Σ (β_i · x_i)<br />
              P(Fake | x) = σ(z) = 1 / (1 + e^(-z))<br />
              Attribution(token_i) = β_i · x_i
            </div>
          </div>
        </div>
      </section>

      {/* 4. Model Evaluation & Confusion Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>4. Empirical Model Evaluation</span>
        </h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          {metrics ? (
            <ConfusionMatrixChart metrics={metrics} />
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">
              Loading model evaluation metrics...
            </div>
          )}
        </div>
      </section>

      {/* 5. Project Team & Tech Stack */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <span>5. Technology Implementation Stack</span>
        </h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-500 text-[11px]">Frontend Engine</div>
            <div className="font-semibold text-slate-200 mt-1">React 19 & Vite 8</div>
            <div className="text-slate-400 text-[11px]">Tailwind CSS & Recharts</div>
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Backend Server</div>
            <div className="font-semibold text-slate-200 mt-1">Node.js Express</div>
            <div className="text-slate-400 text-[11px]">ES Modules & TypeScript</div>
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Database Layer</div>
            <div className="font-semibold text-slate-200 mt-1">MongoDB & Mongoose</div>
            <div className="text-slate-400 text-[11px]">Resilient Local Fallback</div>
          </div>
          <div>
            <div className="text-slate-500 text-[11px]">Security & Testing</div>
            <div className="font-semibold text-slate-200 mt-1">JWT & Vitest</div>
            <div className="text-slate-400 text-[11px]">SSRF IP Verification</div>
          </div>
        </div>
      </section>
    </div>
  );
};
