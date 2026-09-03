import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3002';

const STATUS = {
  pending:  { bg:'bg-amber-500/10',   border:'border-amber-400/20',  text:'text-amber-300',  dot:'bg-amber-400'   },
  resolved: { bg:'bg-emerald-500/10', border:'border-emerald-400/20',text:'text-emerald-300',dot:'bg-emerald-400' },
  approved: { bg:'bg-emerald-500/10', border:'border-emerald-400/20',text:'text-emerald-300',dot:'bg-emerald-400' },
  flagged:  { bg:'bg-red-500/10',     border:'border-red-400/20',    text:'text-red-300',    dot:'bg-red-400'     },
  rejected: { bg:'bg-red-500/10',     border:'border-red-400/20',    text:'text-red-300',    dot:'bg-red-400'     },
};

function StatusBadge({ status }) {
  const s = STATUS[status?.toLowerCase()] || { bg:'bg-[#1a1a1a]', border:'border-[#2a2a2a]', text:'text-[#6e6a65]', dot:'bg-[#6e6a65]' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function Spinner({ size = 'h-3.5 w-3.5' }) {
  return (
    <svg className={`animate-spin ${size}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}

/* ── Confirm modal ── */
function ConfirmModal({ message, actionLabel, actionColor, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
        <p className="text-[#f5efe7] text-sm font-medium text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 glass hover:bg-[#1a1a1a] text-[#b8b0a5] hover:text-[#f5efe7] py-2.5 rounded-xl text-sm font-medium transition-all duration-200">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 ${actionColor} py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg`}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast ── */
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`fade-in flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border pointer-events-auto
            ${t.type === 'success' ? 'bg-[#111111] border-emerald-500/25 text-emerald-300' : 'bg-[#111111] border-red-500/25 text-red-300'}`}>
          <span className="text-base">{t.type === 'success' ? '✓' : '✕'}</span>
          <p className="text-sm">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-[#6e6a65] hover:text-[#f5efe7] ml-1 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard({ account }) {
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError]           = useState('');
  const [toasts, setToasts]         = useState([]);
  const [confirm, setConfirm]       = useState(null);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const toastRef = { current: 0 };

  useEffect(() => { fetchFeedbacks(); }, []);

  const addToast = (message, type) => {
    const id = ++toastRef.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const fetchFeedbacks = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_URL}/feedback`);
      setFeedbacks(res.data.feedback || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch');
    } finally { setLoading(false); }
  };

  const requestUpdate = (feedbackId, status) => setConfirm({ feedbackId, status });

  const confirmUpdate = async () => {
    const { feedbackId, status } = confirm;
    setConfirm(null);
    setUpdatingId(feedbackId);
    try {
      await axios.post(`${API_URL}/update-status`, { feedbackId, status });
      setFeedbacks((prev) => prev.map((f) => f.id === String(feedbackId) ? { ...f, status } : f));
      addToast(`Feedback #${feedbackId} marked as ${status}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    } finally { setUpdatingId(null); }
  };

  const stats = [
    { label:'Total',    value: feedbacks.length,                                                                          gradient:'from-[#d6cbbf] to-[#c8a96a]',   icon:'◈', glow:'shadow-[#c8a96a]/10'    },
    { label:'Pending',  value: feedbacks.filter(f => f.status?.toLowerCase() === 'pending').length,                       gradient:'from-amber-400 to-amber-500',   icon:'◷', glow:'shadow-amber-500/10'   },
    { label:'Approved', value: feedbacks.filter(f => f.status?.toLowerCase() === 'approved').length,                      gradient:'from-emerald-400 to-emerald-500',icon:'◉', glow:'shadow-emerald-500/10' },
    { label:'Rejected', value: feedbacks.filter(f => f.status?.toLowerCase() === 'rejected').length,                      gradient:'from-red-400 to-red-500',       icon:'◌', glow:'shadow-red-500/10'     },
  ];

  // Apply filters
  const filtered = feedbacks.filter((f) => {
    const matchCourse = !filterCourse || f.courseId?.toLowerCase().includes(filterCourse.toLowerCase());
    const matchRating = filterRating === 'all' || (filterRating === '5-4' && f.rating >= 4) || (filterRating === '3' && f.rating === 3) || (filterRating === '2-1' && f.rating <= 2);
    const matchStatus = filterStatus === 'all' || f.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchCourse && matchRating && matchStatus;
  });

  return (
    <>
      <Toast toasts={toasts} remove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      {confirm && (
        <ConfirmModal
          message={`Mark feedback #${confirm.feedbackId} as "${confirm.status}"? This will be recorded on the blockchain.`}
          actionLabel={confirm.status === 'Resolved' ? 'Resolve' : 'Flag'}
          actionColor={confirm.status === 'Resolved' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-700 hover:bg-red-600 text-white'}
          onConfirm={confirmUpdate}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-[#f5efe7] tracking-tight">Admin Dashboard</h1>
              <span className="bg-[#1a1a1a] border border-[#c8a96a]/25 text-[#c8a96a] text-[11px] font-bold px-2.5 py-1 rounded-full">
                ⬡ Admin
              </span>
            </div>
            <p className="text-[#6e6a65] text-sm">Review and manage student feedback</p>
          </div>
          <button onClick={fetchFeedbacks}
            className="flex items-center gap-2 glass hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#c8a96a]/25 text-[#6e6a65] hover:text-[#b8b0a5] px-4 py-2 rounded-xl text-sm transition-all duration-200 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Wallet warning */}
        {!account && (
          <div className="flex items-center gap-3 bg-amber-500/[0.06] border border-amber-400/15 rounded-2xl px-5 py-4">
            <span className="text-amber-400 text-xl">⚠</span>
            <div>
              <p className="text-amber-300 text-sm font-medium">Admin wallet not connected</p>
              <p className="text-amber-400/50 text-xs mt-0.5">Connect your wallet to update feedback statuses</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`glass rounded-2xl p-4 hover:shadow-lg ${s.glow} transition-all duration-300 hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#6e6a65] text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                <span className="text-[#c8a96a] text-base font-light">{s.icon}</span>
              </div>
              <p className={`text-3xl font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/[0.06] border border-red-400/15 rounded-2xl px-5 py-4 text-red-300 text-sm">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-2xl p-4 space-y-4">
          <p className="text-sm font-semibold text-[#6e6a65] uppercase tracking-widest">Filters</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                placeholder="Search by Course ID..."
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-[#c8a96a]/40 text-[#f5efe7] placeholder-[#6e6a65] px-3 py-2 rounded-lg text-xs transition-all outline-none"
              />
            </div>
            <div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="bg-[#111111] text-[#b8b0a5] border border-[#2a2a2a] rounded-xl px-4 py-2 w-full text-xs outline-none focus:border-[#c8a96a]/40 transition-all"
              >
                <option value="all">All Ratings</option>
                <option value="5-4">4-5 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2-1">1-2 Stars</option>
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#111111] text-[#b8b0a5] border border-[#2a2a2a] rounded-xl px-4 py-2 w-full text-xs outline-none focus:border-[#c8a96a]/40 transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-[#6e6a65]">{filtered.length} of {feedbacks.length} feedback shown</p>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#2a2a2a] text-[11px] text-[#6e6a65] uppercase tracking-widest font-semibold bg-[#111111]/60">
            <span>ID</span>
            <span>Details · Course · Student</span>
            <span>Rating</span>
            <span>Status</span>
            <span>TX</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Spinner size="h-8 w-8" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-[#6e6a65] text-sm">{feedbacks.length === 0 ? 'No feedback submitted yet' : 'No feedback matches the current filters'}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]/60">
              {filtered.map((fb) => (
                <div key={fb.id}
                  className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto_auto_auto_auto] md:items-center gap-3 md:gap-4 px-5 py-4 hover:bg-[#111111]/60 transition-all duration-200">

                  {/* ID */}
                  <div className="flex md:block items-center gap-2">
                    <span className="text-[#6e6a65] text-xs font-mono">#{fb.id}</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-[#1a1a1a] border border-[#c8a96a]/20 text-[#c8a96a] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {fb.courseId}
                      </span>
                      {fb.facultyName && (
                        <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#b8b0a5] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {fb.facultyName}
                        </span>
                      )}
                      {fb.category && (
                        <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#b8b0a5] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {fb.category}
                        </span>
                      )}
                      {fb.studentId && (
                        <span className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#b8b0a5] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {fb.studentId}
                        </span>
                      )}
                      {fb.isAnonymous && (
                        <span className="bg-amber-500/8 border border-amber-400/15 text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          🔒
                        </span>
                      )}
                    </div>
                    <p className="text-[#6e6a65] text-xs font-mono truncate">{fb.student?.slice(0,12)}...{fb.student?.slice(-6)}</p>
                    <p className="text-[#6e6a65]/70 text-[11px] mt-0.5">{new Date(fb.timestamp).toLocaleString()}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {fb.rating > 0 ? (
                      <div className="text-sm">
                        <span className="text-amber-400">{'★'.repeat(fb.rating)}</span>
                        <span className="text-[#6e6a65] text-xs ml-1">({fb.rating})</span>
                      </div>
                    ) : (
                      <span className="text-[#6e6a65] text-xs">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={fb.status} />
                  </div>

                  {/* Transaction Hash */}
                  <div className="text-xs">
                    {fb.transactionHash && fb.transactionHash !== 'N/A' ? (
                      <a href={`https://etherscan.io/tx/${fb.transactionHash}`} target="_blank" rel="noopener noreferrer"
                        className="text-[#c8a96a]/70 hover:text-[#c8a96a] font-mono truncate block transition-colors"
                        title={fb.transactionHash}>
                        {fb.transactionHash?.slice(0, 10)}...
                      </a>
                    ) : (
                      <span className="text-[#6e6a65]">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => requestUpdate(fb.id, 'Approved')}
                      disabled={updatingId === fb.id || !account}
                      title="Approve feedback"
                      className="flex items-center gap-1.5 bg-emerald-500/8 hover:bg-emerald-500/15 border border-emerald-400/15 hover:border-emerald-400/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updatingId === fb.id ? <Spinner /> : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                      <span className="hidden sm:inline">✓</span>
                    </button>
                    <button
                      onClick={() => requestUpdate(fb.id, 'Rejected')}
                      disabled={updatingId === fb.id || !account}
                      title="Reject feedback"
                      className="flex items-center gap-1.5 bg-red-500/8 hover:bg-red-500/15 border border-red-400/15 hover:border-red-400/30 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updatingId === fb.id ? <Spinner /> : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      )}
                      <span className="hidden sm:inline">✕</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
