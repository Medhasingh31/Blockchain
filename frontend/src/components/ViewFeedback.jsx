import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3002';

const STATUS = {
  pending:  { bg:'bg-amber-500/10',   border:'border-amber-400/20',  text:'text-amber-300',  dot:'bg-amber-400',   label:'Pending'  },
  resolved: { bg:'bg-emerald-500/10', border:'border-emerald-400/20',text:'text-emerald-300',dot:'bg-emerald-400', label:'Resolved' },
  approved: { bg:'bg-emerald-500/10', border:'border-emerald-400/20',text:'text-emerald-300',dot:'bg-emerald-400', label:'Approved' },
  flagged:  { bg:'bg-red-500/10',     border:'border-red-400/20',    text:'text-red-300',    dot:'bg-red-400',     label:'Flagged'  },
  rejected: { bg:'bg-red-500/10',     border:'border-red-400/20',    text:'text-red-300',    dot:'bg-red-400',     label:'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS[status?.toLowerCase()] || { bg:'bg-white/5', border:'border-white/10', text:'text-white/50', dot:'bg-white/30', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-16 bg-white/10 rounded-full" />
        <div className="h-5 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-white/[0.06] rounded" />
        <div className="h-3 w-3/4 bg-white/[0.06] rounded" />
      </div>
      <div className="h-8 w-full bg-white/[0.06] rounded-xl" />
    </div>
  );
}

export default function ViewFeedback() {
  const [feedbacks, setFeedbacks]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selected, setSelected]         = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_URL}/feedback`);
      setFeedbacks(res.data.feedback || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch');
    } finally { setLoading(false); }
  };

  const viewDetails = async (id) => {
    setSelected({}); setModalLoading(true);
    try {
      const res = await axios.get(`${API_URL}/feedback/${id}`);
      setSelected(res.data.feedback);
    } catch { setSelected(null); }
    finally { setModalLoading(false); }
  };

  const filtered = feedbacks.filter((f) => {
    const matchSearch = f.courseId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', ...new Set(feedbacks.map(f => f.status?.toLowerCase()).filter(Boolean))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div >
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">View Feedback</h1>
          <p className="text-white/40 text-sm mt-0.5">{feedbacks.length} total · {filtered.length} shown</p>
        </div>
        <button onClick={fetchFeedbacks}
          className="self-start sm:self-auto flex items-center gap-2 glass hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white px-4 py-2 rounded-xl text-sm transition-all duration-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Course ID..."
            className="input-glow w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200
                ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'glass text-white/40 hover:text-white hover:bg-white/[0.08]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/[0.08] border border-red-400/20 rounded-2xl px-5 py-4 text-red-300 text-sm">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white/40 font-medium">No feedback found</p>
          {search && <p className="text-white/25 text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((fb) => (
            <div key={fb.id}
              className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group">
              <div className="flex items-start justify-between gap-2">
                <span className="bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {fb.courseId}
                </span>
                <StatusBadge status={fb.status} />
              </div>
              <div className="space-y-1.5 text-xs text-white/35">
                <p>ID <span className="text-white/55">#{fb.id}</span></p>
                <p>Student ID <span className="text-violet-300 font-semibold">{fb.studentId || '—'}</span></p>
                <p>Wallet <span className="font-mono text-white/55">{fb.student?.slice(0,8)}...{fb.student?.slice(-4)}</span></p>
                <p>Date <span className="text-white/55">{new Date(fb.timestamp).toLocaleDateString()}</span></p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                <p className="text-[10px] text-white/25 mb-0.5">IPFS</p>
                <p className="text-blue-400/70 text-[10px] font-mono truncate">{fb.ipfsHash}</p>
              </div>
              <button onClick={() => viewDetails(fb.id)}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-indigo-600/20 border border-white/[0.08] hover:border-indigo-400/30 text-white/50 hover:text-indigo-300 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200">
                View Full Feedback
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-start pt-24 justify-center p-4 z-50 fade-in">
          <div className="bg-[#0a1628] border border-white/[0.08] rounded-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Feedback Details</h3>
              <button onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-all duration-200 text-lg leading-none">×</button>
            </div>
            {modalLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">{selected.courseId}</span>
                  <StatusBadge status={selected.status} />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-2">Feedback Content</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-white/75 text-sm whitespace-pre-wrap leading-relaxed">
                      {selected.feedbackContent || '⏳ Fetching from IPFS...'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-1">Student ID</p>
                    <p className="text-violet-300 text-sm font-semibold">{selected.studentId || '—'}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-1">Submitted</p>
                    <p className="text-white/60 text-xs">{selected.timestamp ? new Date(selected.timestamp).toLocaleString() : '—'}</p>
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-1">Wallet Address</p>
                  <p className="text-white/60 text-xs font-mono break-all">{selected.student}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-1">IPFS Link</p>
                  <a href={selected.ipfsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all underline underline-offset-2 transition-colors">
                    {selected.ipfsUrl}
                  </a>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-full glass hover:bg-white/[0.08] text-white/60 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-200">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
