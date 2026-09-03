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
  const s = STATUS[status?.toLowerCase()] || { bg:'bg-[#1a1a1a]', border:'border-[#2a2a2a]', text:'text-[#6e6a65]', dot:'bg-[#6e6a65]', label: status };
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
        <div className="h-5 w-16 bg-[#2a2a2a] rounded-full" />
        <div className="h-5 w-20 bg-[#2a2a2a] rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-[#1a1a1a] rounded" />
        <div className="h-3 w-3/4 bg-[#1a1a1a] rounded" />
      </div>
      <div className="h-8 w-full bg-[#1a1a1a] rounded-xl" />
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
          <h1 className="font-display text-2xl font-bold text-[#f5efe7] tracking-tight">View Feedback</h1>
          <p className="text-[#6e6a65] text-sm mt-0.5">{feedbacks.length} total · {filtered.length} shown</p>
        </div>
        <button onClick={fetchFeedbacks}
          className="self-start sm:self-auto flex items-center gap-2 glass hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#c8a96a]/25 text-[#6e6a65] hover:text-[#b8b0a5] px-4 py-2 rounded-xl text-sm transition-all duration-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6a65]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Course ID..."
            className="input-glow w-full bg-[#111111] border border-[#2a2a2a] text-[#f5efe7] placeholder-[#6e6a65] pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200
                ${statusFilter === s
                  ? 'bg-[#1a1a1a] border border-[#c8a96a]/35 text-[#c8a96a]'
                  : 'glass text-[#6e6a65] hover:text-[#b8b0a5] hover:bg-[#1a1a1a]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/[0.06] border border-red-400/15 rounded-2xl px-5 py-4 text-red-300 text-sm">
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
          <p className="text-[#6e6a65] font-medium">No feedback found</p>
          {search && <p className="text-[#6e6a65]/60 text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((fb) => (
            <div key={fb.id}
              className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 group">
              <div className="flex items-start justify-between gap-2">
                <span className="bg-[#1a1a1a] border border-[#c8a96a]/20 text-[#c8a96a] text-xs font-bold px-2.5 py-1 rounded-full">
                  {fb.courseId}
                </span>
                <StatusBadge status={fb.status} />
              </div>
              
              {/* Rating display */}
              {fb.rating > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[#c8a96a]">{'★'.repeat(fb.rating)}</span>
                  <span className="text-[#6e6a65] text-xs">({fb.rating}/5)</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-[#6e6a65]">
                <p>ID <span className="text-[#b8b0a5]">#{fb.id}</span></p>
                {fb.facultyName && (
                  <p>Faculty <span className="text-[#b8b0a5]">{fb.facultyName}</span></p>
                )}
                {fb.semester && (
                  <p>Semester <span className="text-[#b8b0a5]">{fb.semester}</span></p>
                )}
                {fb.category && (
                  <p>Category <span className="text-[#b8b0a5]">{fb.category}</span></p>
                )}
                {fb.studentId && (
                  <p>Student ID <span className="text-[#c8a96a] font-semibold">{fb.studentId}</span></p>
                )}
                {fb.isAnonymous && (
                  <p><span className="bg-amber-500/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-semibold">Anonymous</span></p>
                )}
                <p>Wallet <span className="font-mono text-[#b8b0a5]">{fb.student?.slice(0,8)}...{fb.student?.slice(-4)}</span></p>
                <p>Date <span className="text-[#b8b0a5]">{new Date(fb.timestamp).toLocaleDateString()}</span></p>
              </div>
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#6e6a65] mb-0.5">IPFS</p>
                <p className="text-[#c8a96a]/60 text-[10px] font-mono truncate">{fb.ipfsHash}</p>
              </div>
              <button onClick={() => viewDetails(fb.id)}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#c8a96a]/25 text-[#6e6a65] hover:text-[#c8a96a] py-2.5 rounded-xl text-xs font-semibold transition-all duration-200">
                View Full Details
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start pt-24 justify-center p-4 z-50 fade-in">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h3 className="text-base font-bold text-[#f5efe7]">Feedback Details</h3>
              <button onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#6e6a65] hover:text-[#f5efe7] flex items-center justify-center transition-all duration-200 text-lg leading-none">×</button>
            </div>
            {modalLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8a96a]" />
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="flex gap-2 flex-wrap items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-[#1a1a1a] border border-[#c8a96a]/20 text-[#c8a96a] text-xs font-bold px-3 py-1 rounded-full">{selected.courseId}</span>
                    <StatusBadge status={selected.status} />
                    {selected.isAnonymous && (
                      <span className="bg-amber-500/10 border border-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">🔒 Anonymous</span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-[#c8a96a] bg-[#1a1a1a] border border-[#c8a96a]/20 px-2.5 py-1 rounded-full">⛓ On Blockchain</span>
                </div>

                {/* Rating */}
                {selected.rating > 0 && (
                  <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3">
                    <p className="text-[#6e6a65] text-[10px] uppercase tracking-widest font-semibold mb-2">Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-[#c8a96a]">{'★'.repeat(selected.rating)}</span>
                      <span className="text-[#b8b0a5] text-sm">{selected.rating} out of 5</span>
                    </div>
                  </div>
                )}

                {/* Feedback Content */}
                <div>
                  <p className="text-[#6e6a65] text-[10px] uppercase tracking-widest font-semibold mb-2">Feedback</p>
                  <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-[#b8b0a5] text-sm whitespace-pre-wrap leading-relaxed">
                      {selected.feedbackText || '⏳ Fetching from IPFS...'}
                    </p>
                  </div>
                </div>

                {/* Academic Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Faculty',    value: selected.facultyName || '—', color: 'text-[#b8b0a5]' },
                    { label: 'Semester',   value: selected.semester || '—',    color: 'text-[#b8b0a5]' },
                    { label: 'Category',   value: selected.category || '—',    color: 'text-[#b8b0a5]' },
                    { label: 'Student ID', value: selected.studentId || '—',   color: 'text-[#c8a96a] font-semibold' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3">
                      <p className="text-[#6e6a65] text-[10px] uppercase tracking-widest font-semibold mb-1">{item.label}</p>
                      <p className={`text-sm ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Timestamp */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3">
                  <p className="text-[#6e6a65] text-[10px] uppercase tracking-widest font-semibold mb-1">Submitted At</p>
                  <p className="text-[#b8b0a5] text-xs">{selected.timestamp ? new Date(selected.timestamp).toLocaleString() : '—'}</p>
                </div>

                {/* Wallet Address */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3">
                  <p className="text-[#6e6a65] text-[10px] uppercase tracking-widest font-semibold mb-1">Wallet Address</p>
                  <p className="text-[#b8b0a5] text-xs font-mono break-all">{selected.student}</p>
                </div>

                {/* Blockchain Proof Section */}
                <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
                  <p className="text-[#6e6a65] text-[10px] uppercase tracking-widest font-semibold">⛓ Blockchain Proof</p>
                  
                  {/* IPFS Hash */}
                  <div className="bg-[#111111] border border-[#c8a96a]/15 rounded-xl p-3">
                    <p className="text-[#c8a96a]/60 text-[10px] uppercase tracking-widest font-semibold mb-1">IPFS Hash</p>
                    <a href={selected.ipfsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[#c8a96a]/80 hover:text-[#c8a96a] text-xs font-mono break-all underline underline-offset-2 transition-colors block mb-2">
                      {selected.ipfsHash}
                    </a>
                    <a href={selected.ipfsUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#c8a96a]/70 hover:text-[#c8a96a] text-xs font-semibold transition-colors">
                      View on IPFS <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  </div>

                  {/* Transaction Hash */}
                  {selected.transactionHash && selected.transactionHash !== 'N/A' && (
                    <div className="bg-[#111111] border border-emerald-500/15 rounded-xl p-3">
                      <p className="text-emerald-400/60 text-[10px] uppercase tracking-widest font-semibold mb-1">Transaction Hash</p>
                      <p className="text-emerald-400/80 text-xs font-mono break-all mb-2">{selected.transactionHash}</p>
                      <a href={`https://etherscan.io/tx/${selected.transactionHash}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 text-xs font-semibold transition-colors">
                        View on Block Explorer <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                    </div>
                  )}


                </div>

                <button onClick={() => setSelected(null)}
                  className="w-full glass hover:bg-[#1a1a1a] text-[#b8b0a5] hover:text-[#f5efe7] py-2.5 rounded-xl text-sm font-medium transition-all duration-200">
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
