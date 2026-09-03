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
              ? 'bg-[#111111] border-emerald-500/25 text-emerald-300'
              : 'bg-[#111111] border-red-500/25 text-red-300'}`}
        >
          <span className="text-lg shrink-0">{t.type === 'success' ? '✓' : '✕'}</span>
          <p className="text-sm leading-snug flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-[#6e6a65] hover:text-[#f5efe7] text-lg leading-none shrink-0 ml-1">×</button>
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
  const [facultyName, setFacultyName]   = useState('');
  const [semester, setSemester]         = useState('');
  const [rating, setRating]             = useState(0);
  const [category, setCategory]         = useState('Teaching Quality');
  const [isAnonymous, setIsAnonymous]   = useState(false);
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
    if (!studentId.trim() && !isAnonymous) { addToast('Please enter your Student ID or submit anonymously', 'error'); return; }
    if (!courseId.trim())                { addToast('Please enter a Course ID', 'error'); return; }
    if (!facultyName.trim())             { addToast('Please enter Faculty Name', 'error'); return; }
    if (!semester.trim())                { addToast('Please enter Semester', 'error'); return; }
    if (rating === 0)                    { addToast('Please select a rating', 'error'); return; }
    if (!feedbackText.trim())            { addToast('Please enter your feedback', 'error'); return; }
    if (feedbackText.length > MAX_CHARS) { addToast(`Feedback must be under ${MAX_CHARS} characters`, 'error'); return; }

    setLoading(true);
    try {
      const payload = {
        feedbackText,
        courseId,
        studentId: isAnonymous ? 'Anonymous' : studentId,
        facultyName,
        semester,
        rating: parseInt(rating),
        category,
        isAnonymous,
        walletAddress: account,
        network: 'localhost', // or detect from provider
        timestamp: new Date().toISOString(),
        status: 'Pending'
      };

      const res = await axios.post(`${API_URL}/submit-feedback`, payload);
      addToast(`Submitted! TX: ${res.data.transactionHash?.slice(0, 18)}...`, 'success');
      
      // Reset form
      setStudentId('');
      setFeedbackText('');
      setCourseId('');
      setFacultyName('');
      setSemester('');
      setRating(0);
      setCategory('Teaching Quality');
      setIsAnonymous(false);
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const charPct  = Math.min((feedbackText.length / MAX_CHARS) * 100, 100);
  const charColor = charPct > 90 ? 'text-red-400' : charPct > 70 ? 'text-[#c8a96a]' : 'text-[#6e6a65]';

  return (
    <>
      <Toast toasts={toasts} remove={removeToast} />

      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Page header ── */}
        <div>
          <h1 className="font-display text-2xl font-bold text-[#f5efe7] tracking-tight">Submit Feedback</h1>
          <p className="text-[#6e6a65] text-sm mt-1">Stored on IPFS · Recorded on-chain · Immutable</p>
        </div>

        {/* ── Wallet warning ── */}
        {!account && (
          <div className="flex items-center gap-3 bg-amber-500/[0.06] border border-amber-400/15 rounded-2xl px-5 py-4 fade-in">
            <span className="text-amber-400 text-xl">⚠</span>
            <div>
              <p className="text-amber-300 text-sm font-medium">Wallet not connected</p>
              <p className="text-amber-400/50 text-xs mt-0.5">Connect MetaMask to submit feedback</p>
            </div>
          </div>
        )}

        {/* ── Form card ── */}
        <div className="glass rounded-2xl p-6 border-glow-anim shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Student ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"/>
                </svg>
                Student ID {isAnonymous && <span className="text-[#6e6a65] font-normal">(optional)</span>}
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={isAnonymous ? "Leave empty to stay anonymous" : "e.g., STU2024001"}
                disabled={loading || !account}
                className="input-glow w-full bg-[#111111] border border-[#2a2a2a] text-[#f5efe7] placeholder-[#6e6a65] px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Course ID */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
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
                className="input-glow w-full bg-[#111111] border border-[#2a2a2a] text-[#f5efe7] placeholder-[#6e6a65] px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Faculty Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Faculty Name
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="e.g., Dr. John Smith"
                disabled={loading || !account}
                className="input-glow w-full bg-[#111111] border border-[#2a2a2a] text-[#f5efe7] placeholder-[#6e6a65] px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Semester */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g., Fall 2024, Spring 2025"
                disabled={loading || !account}
                className="input-glow w-full bg-[#111111] border border-[#2a2a2a] text-[#f5efe7] placeholder-[#6e6a65] px-4 py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Rating - Star UI */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    disabled={loading || !account}
                    className={`w-full py-3 rounded-lg transition-all duration-200 text-2xl ${
                      star <= rating
                        ? 'bg-[#1a1a1a] border border-[#c8a96a]/40 text-[#c8a96a]'
                        : 'bg-[#111111] border border-[#2a2a2a] text-[#6e6a65] hover:text-[#c8a96a]/60'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-xs text-[#c8a96a]/70">{rating} out of 5 stars</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading || !account}
                className="bg-[#111111] text-[#b8b0a5] border border-[#2a2a2a] focus:border-[#c8a96a]/40 rounded-xl px-4 py-3 w-full text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed outline-none"
              >
                <option value="Teaching Quality">Teaching Quality</option>
                <option value="Course Content">Course Content</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Exams">Exams</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Feedback text */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6e6a65] uppercase tracking-widest">
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
                  className="input-glow w-full bg-[#111111] border border-[#2a2a2a] text-[#f5efe7] placeholder-[#6e6a65] px-4 py-3 rounded-xl text-sm transition-all duration-200 resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {/* Character counter */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(42,42,42,1)" strokeWidth="2"/>
                    <circle
                      cx="10" cy="10" r="8" fill="none"
                      stroke={charPct > 90 ? '#f87171' : charPct > 70 ? '#c8a96a' : '#c8a96a'}
                      strokeWidth="2"
                      strokeDasharray={`${(charPct / 100) * 50.27} 50.27`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`text-[10px] font-mono ${charColor}`}>{feedbackText.length}/{MAX_CHARS}</span>
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={loading || !account}
                className="w-4 h-4 accent-[#c8a96a] cursor-pointer disabled:opacity-40"
              />
              <label htmlFor="anonymous" className="flex-1 cursor-pointer">
                <p className="text-sm font-medium text-[#f5efe7]">Submit Anonymously</p>
                <p className="text-xs text-[#6e6a65]">Your Student ID will not be shared</p>
              </label>
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
            <div key={item.label} className="glass rounded-xl p-3.5 text-center hover:bg-[#1a1a1a] hover:border-[#c8a96a]/15 transition-all duration-200">
              <span className="text-xl">{item.icon}</span>
              <p className="text-[#f5efe7] text-xs font-semibold mt-1.5">{item.label}</p>
              <p className="text-[#6e6a65] text-[10px] mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
