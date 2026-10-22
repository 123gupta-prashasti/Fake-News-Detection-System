import React from 'react';
import { ModelMetrics } from '../types';

interface ConfusionMatrixChartProps {
  metrics: ModelMetrics;
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixChartProps> = ({ metrics }) => {
  const cm = metrics.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] ?? 0;
  const fp = cm[0]?.[1] ?? 0;
  const fn = cm[1]?.[0] ?? 0;
  const tp = cm[1]?.[1] ?? 0;

  const total = tn + fp + fn + tp || 1;

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400">
        Empirical Confusion Matrix on Independent Holdout Test Partition ($N = {total}$)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 border border-slate-800 bg-slate-900/40 text-slate-400"></th>
              <th className="p-2.5 border border-slate-800 bg-slate-900 text-slate-300 font-semibold" colSpan={2}>
                Predicted Condition
              </th>
            </tr>
            <tr>
              <th className="p-2 border border-slate-800 bg-slate-900 text-slate-300 font-semibold text-left">
                Actual Ground Truth
              </th>
              <th className="p-2.5 border border-slate-800 bg-slate-900/80 text-emerald-400 font-semibold">
                Predicted REAL (0)
              </th>
              <th className="p-2.5 border border-slate-800 bg-slate-900/80 text-rose-400 font-semibold">
                Predicted FAKE (1)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-slate-800 bg-slate-900/80 text-emerald-400 font-semibold text-left">
                Actual REAL (0)
              </td>
              <td className="p-4 border border-slate-800 bg-emerald-950/30 text-emerald-300">
                <div className="text-lg font-bold font-mono tabular-nums">{tn}</div>
                <div className="text-[11px] text-slate-400">True Negative (TN)</div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">{((tn / total) * 100).toFixed(1)}%</div>
              </td>
              <td className="p-4 border border-slate-800 bg-rose-950/20 text-rose-300">
                <div className="text-lg font-bold font-mono tabular-nums">{fp}</div>
                <div className="text-[11px] text-slate-400">False Positive (FP / Type I)</div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">{((fp / total) * 100).toFixed(1)}%</div>
              </td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-800 bg-slate-900/80 text-rose-400 font-semibold text-left">
                Actual FAKE (1)
              </td>
              <td className="p-4 border border-slate-800 bg-amber-950/20 text-amber-300">
                <div className="text-lg font-bold font-mono tabular-nums">{fn}</div>
                <div className="text-[11px] text-slate-400">False Negative (FN / Type II)</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">{((fn / total) * 100).toFixed(1)}%</div>
              </td>
              <td className="p-4 border border-slate-800 bg-rose-950/40 text-rose-200">
                <div className="text-lg font-bold font-mono tabular-nums">{tp}</div>
                <div className="text-[11px] text-slate-400">True Positive (TP)</div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">{((tp / total) * 100).toFixed(1)}%</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[11px]">Accuracy</div>
          <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[11px]">Precision</div>
          <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[11px]">Recall / Sensitivity</div>
          <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-slate-400 text-[11px]">F1-Score</div>
          <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};
