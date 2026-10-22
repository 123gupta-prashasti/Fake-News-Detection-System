import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { NewsAnalysis } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { Search, Trash2, ArrowRight, RefreshCw, Calendar, Globe, AlertTriangle, AlertCircle, X } from 'lucide-react';

interface HistoryPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [history, setHistory] = useState<NewsAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState<NewsAnalysis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory();
      setHistory(res.history);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch analysis history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Confirm single item deletion
  const confirmDeleteSingle = async () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete._id;
    setIsDeleting(true);

    try {
      await api.deleteAnalysis(targetId);
      // Immediately remove only the selected record from React state
      setHistory((prev) => prev.filter((item) => item._id !== targetId));
      showToast('Analysis record permanently deleted.', 'success');
      setItemToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete analysis record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm clear all history
  const confirmClearAll = async () => {
    setIsClearingAll(true);
    try {
      const res = await api.clearAllHistory();
      setHistory([]);
      showToast(res.message || 'All analysis records cleared.', 'success');
      setShowClearAllModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to clear history.', 'error');
    } finally {
      setIsClearingAll(false);
    }
  };

  // Filtered entries
  const filtered = history.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      (item.inputHeadline && item.inputHeadline.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.extractedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sourceDomain && item.sourceDomain.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesOutcome =
      selectedOutcome === 'all' || item.prediction === selectedOutcome;

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesOutcome && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Audit Archive</div>
          <h1 className="text-2xl font-bold text-white mt-1">Analysis History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable historical archive of your submitted articles, claims, and verified dossiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          )}

          <button
            onClick={fetchHistory}
            title="Refresh history"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search headline, text, or domain..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Outcomes</option>
            <option value="Likely Real">Likely Real</option>
            <option value="Suspicious / Needs Verification">Suspicious</option>
            <option value="Likely Fake">Likely Fake</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="politics">Politics</option>
            <option value="health">Health</option>
            <option value="science">Science</option>
            <option value="economy">Economy</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>
      </div>

      {/* History Items Grid / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading analysis records...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => onNavigate('details', { id: item._id })}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 max-w-3xl">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {item.category || 'general'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </span>
                  {item.sourceDomain && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-400">
                        <Globe className="w-3 h-3" />
                        <span>{item.sourceDomain}</span>
                      </span>
                    </>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">ID: {item._id}</span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {item.inputHeadline || item.extractedText.slice(0, 90)}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                  {item.extractedText.slice(0, 140)}...
                </p>
              </div>

              {/* Badges and Actions */}
              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <RiskBadge classification={item.prediction} score={item.overallRiskScore} />

                <div className="text-right font-mono text-xs hidden sm:block">
                  <div className="text-slate-400 text-[10px]">Confidence</div>
                  <div className="text-slate-200 font-bold tabular-nums">{item.modelConfidence}%</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item);
                    }}
                    title="Delete this record"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="p-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-xl bg-slate-900 border border-slate-800 text-center py-16 space-y-3">
            <div className="text-sm font-medium text-slate-300">No Historical Analyses Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedOutcome !== 'all' || selectedCategory !== 'all'
                ? 'No past analyses match your search and filter criteria.'
                : 'You have not submitted any articles for analysis yet.'}
            </p>
            <button
              onClick={() => onNavigate('analysis')}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors inline-block mt-2"
            >
              Start First Analysis
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog: Delete Single Record */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Confirm Record Deletion</span>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this analysis record? This operation will remove the dossier and cannot be undone.
            </p>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="font-semibold text-white truncate">
                {itemToDelete.inputHeadline || itemToDelete.extractedText.slice(0, 60)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">ID: {itemToDelete._id}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSingle}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Clear All History */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Clear Entire Analysis History</span>
              </div>
              <button
                onClick={() => setShowClearAllModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{history.length} analysis records</strong>? All your historical verification dossiers and metrics will be permanently erased.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                disabled={isClearingAll}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                disabled={isClearingAll}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingAll ? 'Clearing...' : 'Yes, Clear All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
