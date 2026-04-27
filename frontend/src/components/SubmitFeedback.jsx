import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3002';
const MAX_CHARS = 1000;

/* ── Toast notification ── */
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`fade-in flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border pointer-events-auto max-w-sm
            ${t.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/95 border-red-500/30 text-red-200'}`}
        >
          <span className="text-lg shrink-0">{t.type === 'success' ? '✓' : '✕'}</span>
          <p className="text-sm leading-snug flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white text-lg leading-none shrink-0 ml-1">×</button>
        </div>
      ))}
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}

export default function SubmitFeedback({ account }) {
  const [studentId, setStudentId]       = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [courseId, setCourseId]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [toasts, setToasts]             = useState([]);
  const toastId = useRef(0);

  const addToast = (message, type) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account)                        { addToast('Connect your wallet first', 'error'); return; }
    if (!studentId.trim())               { addToast('Please enter your Student ID', 'error'); return; }
    if (!courseId.trim())                { addToast('Please enter a Course ID', 'error'); return; }
    if (!feedbackText.trim())            { addToast('Please enter your feedback', 'error'); return; }
    if (feedbackText.length > MAX_CHARS) { addToast(`Feedback must be under ${MAX_CHARS} characters`, 'error'); return; }

    setLoading(true);
    try {
      // Include studentId in the payload — backend stores it with IPFS content
      const res = await axios.post(`${API_URL}/submit-feedback`, { feedbackText, courseId, studentId });
      addToast(`Submitted! TX: ${res.data.transactionHash?.slice(0, 18)}...`, 'success');
      setStudentId('');
      setFeedbackText('');
      setCourseId('');
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const charPct  = Math.min((feedbackText.length / MAX_CHARS) * 100, 100);
  const charColor = charPct > 90 ? 'text-red-400' : charPct > 70 ? 'text-yellow-400' : 'text-white/30';

  return (
    <>
      <Toast toasts={toasts} remove={removeToast} />

      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Page header ── */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Submit Feedback</h1>
          <p className="text-white/40 text-sm mt-1">Stored on IPFS · Recorded on-chain · Immutable</p>
        </div>

        {/* ── Wallet warning ── */}
        {!account && (
          <div className="flex items-center gap-3 bg-amber-500/[0.08] border border-amber-400/20 rounded-2xl px-5 py-4 fade-in">
            <span className="text-amber-400 text-xl">⚠</span>
            <div>
              <p className="text-amber-300 text-sm font-medium">Wallet not connected</p>
              <p className="text-amber-400/60 text-xs mt-0.5">Connect MetaMask to submit feedback</p>
            </div>
          </div>
        )}

        {/* ── Form card ── */}
        <div className="glass rounded-2xl p-6 border-glow-anim shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Student ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"/>
                </svg>
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., STU2024001"
                disabled={loading || !account}
                className="input-glow w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Course ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                Course ID
              </label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="e.g., CS101, MATH201"
                disabled={loading || !account}
                className="input-glow w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Feedback text */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Your Feedback
              </label>
              <div className="relative">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your honest thoughts about the course — quality, content, instructor, improvements..."
                  rows="6"
                  disabled={loading || !account}
                  className="input-glow w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3 rounded-xl text-sm transition-all duration-200 resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {/* Character counter */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {/* Progress arc */}
                  <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>
                    <circle
                      cx="10" cy="10" r="8" fill="none"
                      stroke={charPct > 90 ? '#f87171' : charPct > 70 ? '#fbbf24' : '#6366f1'}
                      strokeWidth="2"
                      strokeDasharray={`${(charPct / 100) * 50.27} 50.27`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`text-[10px] font-mono ${charColor}`}>{feedbackText.length}/{MAX_CHARS}</span>
                </div>
              </div>
            </div>

            {/* Submit button — uses btn-primary class for consistent glow + hover lift */}
            <button
              type="submit"
              disabled={loading || !account}
              className="btn-primary w-full py-3.5 px-6 text-sm flex items-center justify-center gap-2.5 group"
            >
              {/* Shimmer sweep on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:shimmer-sweep pointer-events-none" />
              {loading ? (
                <><Spinner /> Uploading to IPFS &amp; Blockchain...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Info strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '⛓', label: 'On-Chain',      sub: 'Polygon / Hardhat' },
            { icon: '📌', label: 'IPFS Pinned',   sub: 'via Pinata' },
            { icon: '🔒', label: 'Immutable',     sub: 'Tamper-proof' },
          ].map((item) => (
            <div key={item.label} className="glass rounded-xl p-3.5 text-center hover:bg-white/[0.07] transition-all duration-200">
              <span className="text-xl">{item.icon}</span>
              <p className="text-white text-xs font-semibold mt-1.5">{item.label}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
