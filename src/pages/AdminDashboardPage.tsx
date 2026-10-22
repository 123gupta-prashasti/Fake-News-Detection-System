import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DashboardStats, ModelMetrics } from '../types';
import { ConfusionMatrixChart } from '../components/ConfusionMatrixChart';
import { Shield, Users, Sliders, Cpu, Save, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [thresholds, setThresholds] = useState<{ likely_real_max: number; likely_fake_min: number }>({
    likely_real_max: 0.35,
    likely_fake_min: 0.65,
  });

  const [loading, setLoading] = useState(true);
  const [savingThresholds, setSavingThresholds] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, modelRes] = await Promise.all([
        api.getDashboardStats('global'),
        api.getModelMetrics(),
      ]);

      setStats(dashRes.stats);
      setSystemInfo(dashRes.systemInfo);
      setMetrics(modelRes.metrics);
      if (modelRes.thresholds) {
        setThresholds({
          likely_real_max: modelRes.thresholds.likely_real_max,
          likely_fake_min: modelRes.thresholds.likely_fake_min,
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load administrative telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleUpdateThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (thresholds.likely_real_max >= thresholds.likely_fake_min) {
      showToast('Real threshold must be strictly lower than Fake threshold.', 'error');
      return;
    }

    setSavingThresholds(true);
    try {
      await api.updateThresholds(thresholds);
      showToast('Classification thresholds updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update thresholds.', 'error');
    } finally {
      setSavingThresholds(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400">
          This administration console is restricted to users with the <span className="text-amber-300 font-mono">admin</span> role.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
        >
          Return to User Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Root Administrator Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Platform Operations & ML Calibration</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            System-wide user audits, model performance metrics, and decision boundary tuning
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Global Telemetry KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">Total Registered Users</div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {systemInfo?.totalUsers ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">
            {systemInfo?.adminUsers ?? 0} root administrators
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">Global Analyses Volume</div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
            {stats?.totalAnalyses ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Across all platform users</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">Global Average Risk</div>
          <div className="text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
            {stats?.averageRiskScore ?? 0}/100
          </div>
          <div className="text-[11px] text-slate-500">Platform-wide average</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">Model Test Accuracy</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-500">On independent test split</div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Threshold Calibration & Users List (6 cols) */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Threshold Tuning Box */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Decision Threshold Tuning</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically adjust the Logistic Regression probability cutoffs that separate "Likely Real", "Suspicious", and "Likely Fake".
            </p>

            <form onSubmit={handleUpdateThresholds} className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-medium">Likely Real Upper Bound (P(Fake) &le; threshold)</label>
                  <span className="font-mono text-cyan-400 tabular-nums">{thresholds.likely_real_max}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.45"
                  step="0.01"
                  value={thresholds.likely_real_max}
                  onChange={(e) => setThresholds({ ...thresholds, likely_real_max: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
                <div className="text-[10px] text-slate-500">
                  Any probability below this cutoff is categorized as "Likely Real".
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-medium">Likely Fake Lower Bound (P(Fake) &ge; threshold)</label>
                  <span className="font-mono text-rose-400 tabular-nums">{thresholds.likely_fake_min}</span>
                </div>
                <input
                  type="range"
                  min="0.55"
                  max="0.90"
                  step="0.01"
                  value={thresholds.likely_fake_min}
                  onChange={(e) => setThresholds({ ...thresholds, likely_fake_min: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500"
                />
                <div className="text-[10px] text-slate-500">
                  Any probability above this cutoff is categorized as "Likely Fake". Between the bounds is "Suspicious".
                </div>
              </div>

              <button
                type="submit"
                disabled={savingThresholds}
                className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm shadow-sky-900/40"
              >
                <Save className="w-4 h-4" />
                <span>{savingThresholds ? 'Updating Thresholds...' : 'Save Decision Thresholds'}</span>
              </button>
            </form>
          </div>

          {/* User Account Registry */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Registered Accounts ({systemInfo?.totalUsers || 0})</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 font-medium">Name & Email</th>
                    <th className="py-2 font-medium">Role</th>
                    <th className="py-2 font-medium text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {(systemInfo?.usersList || []).map((u: any) => (
                    <tr key={u._id}>
                      <td className="py-2.5 pr-2">
                        <div className="font-medium text-slate-100">{u.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{u.email}</div>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Model Metrics & Confusion Matrix (6 cols) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Live ML Baseline Evaluation</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Test Partition</span>
            </div>

            {metrics ? (
              <ConfusionMatrixChart metrics={metrics} />
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">Loading evaluation metrics...</div>
            )}
          </div>

          {/* Model Weights Summary */}
          {metrics && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-white">Dominant Lexical Weights in Model Core</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold text-rose-300 mb-2">Highest Fake Coefficients (Beta &gt; 0)</div>
                  <div className="space-y-1">
                    {(metrics.top_fake_indicators || []).slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between p-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
                        <span className="text-slate-300">{item.word}</span>
                        <span className="text-rose-400 font-bold">+{item.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-cyan-300 mb-2">Highest Real Coefficients (Beta &lt; 0)</div>
                  <div className="space-y-1">
                    {(metrics.top_real_indicators || []).slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between p-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
                        <span className="text-slate-300">{item.word}</span>
                        <span className="text-cyan-400 font-bold">{item.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
