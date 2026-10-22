import React from 'react';
import { FeatureContribution } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface FeatureWeightChartProps {
  contributions: FeatureContribution[];
}

export const FeatureWeightChart: React.FC<FeatureWeightChartProps> = ({ contributions }) => {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800">
        No vocabulary terms from the baseline classifier matched in the provided text.
      </div>
    );
  }

  // Format chart data: sort by absolute weight
  const data = contributions
    .slice(0, 10)
    .map((c) => ({
      token: c.token,
      weight: c.weight,
      absWeight: Math.abs(c.weight),
      direction: c.direction,
      impact: c.impact,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Lexical Feature Attribution (Beta_i · x_i)</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span>Signals Misinformation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
            <span>Signals Verified Journalism</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              dataKey="token"
              type="category"
              tick={{ fill: '#cbd5e1', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-md shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-slate-100">Token: "{item.token}"</div>
                      <div className="text-slate-300">
                        Attribution Weight: <span className="font-mono text-cyan-300">{item.weight > 0 ? `+${item.weight}` : item.weight}</span>
                      </div>
                      <div className="text-slate-400">
                        Classification Direction: <span className={item.direction === 'fake' ? 'text-rose-400 font-medium' : 'text-cyan-400 font-medium'}>
                          {item.direction === 'fake' ? 'Pushes toward Fake' : 'Pushes toward Real'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="weight" radius={[2, 2, 2, 2]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.weight >= 0 ? '#f43f5e' : '#06b6d4'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
          <div className="font-semibold text-rose-300 mb-1.5">Top Misinformation Signals</div>
          <div className="flex flex-wrap gap-1.5">
            {contributions.filter(c => c.direction === 'fake').length > 0 ? (
              contributions.filter(c => c.direction === 'fake').slice(0, 6).map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-200 font-mono text-[11px]">
                  {c.token} <span className="opacity-70">(+{c.weight})</span>
                </span>
              ))
            ) : (
              <span className="text-slate-500">None detected</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/30">
          <div className="font-semibold text-cyan-300 mb-1.5">Top Factual / Journalistic Signals</div>
          <div className="flex flex-wrap gap-1.5">
            {contributions.filter(c => c.direction === 'real').length > 0 ? (
              contributions.filter(c => c.direction === 'real').slice(0, 6).map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-200 font-mono text-[11px]">
                  {c.token} <span className="opacity-70">({c.weight})</span>
                </span>
              ))
            ) : (
              <span className="text-slate-500">None detected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
