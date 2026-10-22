import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats, NewsAnalysis } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, BarChart2, PlusCircle, RefreshCw, Folder } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

interface DashboardPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardStats('user');
      setStats(res.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Analyst Workspace</div>
          <h1 className="text-2xl font-bold text-white mt-1">Intelligence Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry and risk distribution for <span className="text-slate-200 font-medium">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-sky-900/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">Total Analyzed Articles</div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {stats?.totalAnalyses ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Documented pipeline verifications</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Likely Real</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {stats?.likelyRealCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            {stats?.totalAnalyses ? `${Math.round(((stats.likelyRealCount) / stats.totalAnalyses) * 100)}% of total` : '0%'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Suspicious / Verify</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
            {stats?.suspiciousCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            {stats?.totalAnalyses ? `${Math.round(((stats.suspiciousCount) / stats.totalAnalyses) * 100)}% of total` : '0%'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Likely Fake</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400 tabular-nums">
            {stats?.likelyFakeCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            {stats?.totalAnalyses ? `${Math.round(((stats.likelyFakeCount) / stats.totalAnalyses) * 100)}% of total` : '0%'}
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Risk Score Distribution (0 - 100)</h3>
              <p className="text-xs text-slate-400">Distribution of calculated composite risk across all analyzed items</p>
            </div>
            <div className="text-xs font-mono text-cyan-400 tabular-nums">
              Mean Risk: {stats?.averageRiskScore ?? 0}/100
            </div>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.riskDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="bucket" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs shadow-xl">
                          <div className="font-semibold text-slate-200">Risk Range: {item.bucket}</div>
                          <div className="text-cyan-400 font-mono">Count: {item.count} articles</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#0284c7">
                  {(stats?.riskDistribution || []).map((entry, index) => {
                    const color = entry.bucket.startsWith('81') || entry.bucket.startsWith('61')
                      ? '#f43f5e'
                      : entry.bucket.startsWith('41')
                      ? '#f59e0b'
                      : '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Category Distribution</h3>
            <p className="text-xs text-slate-400">Analyses segmented by domain subject</p>
          </div>

          <div className="space-y-3 pt-2">
            {(stats?.categoryDistribution || []).length > 0 ? (
              (stats?.categoryDistribution || []).map((cat, idx) => {
                const total = stats?.totalAnalyses || 1;
                const pct = Math.round((cat.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize text-slate-300 font-medium">{cat.category}</span>
                      <span className="text-slate-400 font-mono tabular-nums">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                No category data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Analyses</h3>
            <p className="text-xs text-slate-400">Latest news entries processed by the platform</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-medium">Headline / Excerpt</th>
                <th className="py-2.5 px-3 font-medium">Outcome</th>
                <th className="py-2.5 px-3 font-medium text-right">Risk Score</th>
                <th className="py-2.5 px-3 font-medium text-right">Confidence</th>
                <th className="py-2.5 px-3 font-medium text-right">Date</th>
                <th className="py-2.5 px-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {(stats?.recentAnalyses || []).length > 0 ? (
                (stats?.recentAnalyses || []).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 max-w-md">
                      <div className="font-medium text-white truncate">
                        {item.inputHeadline || item.extractedText.slice(0, 70)}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate mt-0.5">
                        {item.sourceDomain ? `Domain: ${item.sourceDomain}` : 'Pasted Text'}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <RiskBadge classification={item.prediction} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                      <span className={item.overallRiskScore > 65 ? 'text-rose-400' : item.overallRiskScore > 35 ? 'text-amber-300' : 'text-emerald-400'}>
                        {item.overallRiskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                      {item.modelConfidence}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('details', { id: item._id })}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No articles analyzed yet. Start your first analysis above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
