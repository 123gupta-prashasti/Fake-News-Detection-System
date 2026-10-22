import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  classification: 'Likely Real' | 'Suspicious / Needs Verification' | 'Likely Fake' | string;
  score?: number;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ classification, score, showIcon = true }) => {
  if (classification === 'Likely Real') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 whitespace-nowrap">
        {showIcon && <ShieldCheck className="w-3.5 h-3.5 shrink-0" />}
        <span>Likely Real</span>
        {score !== undefined && <span className="text-emerald-500/80 tabular-nums">({score})</span>}
      </span>
    );
  }

  if (classification === 'Likely Fake') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-rose-950/60 text-rose-400 border border-rose-800/60 whitespace-nowrap">
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
        <span>Likely Fake</span>
        {score !== undefined && <span className="text-rose-500/80 tabular-nums">({score})</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 whitespace-nowrap">
      {showIcon && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
      <span>Suspicious / Needs Verification</span>
      {score !== undefined && <span className="text-amber-500/80 tabular-nums">({score})</span>}
    </span>
  );
};
