import { useState, useEffect, useRef } from 'react';
import SubmitFeedback from './components/SubmitFeedback';
import ViewFeedback from './components/ViewFeedback';
import AdminDashboard from './components/AdminDashboard';

/* ── Inline SVG icons — no extra deps ── */
const Icons = {
  submit: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  view:   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z"/></svg>,
  admin:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  wallet: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  copy:   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
  logout: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  chain:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
  menu:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  network:<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>,
};

const navItems = [
  { id: 'submit', label: 'Submit Feedback', icon: Icons.submit },
  { id: 'view',   label: 'View Feedback',   icon: Icons.view   },
  { id: 'admin',  label: 'Admin Dashboard', icon: Icons.admin  },
];

/* ── Wallet dropdown component ── */
function WalletDropdown({ account, onDisconnect }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const short = `${account.slice(0,6)}...${account.slice(-4)}`;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger chip */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-400/40 px-3 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
      >
        {/* Avatar circle */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          {account.slice(2,4).toUpperCase()}
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot shrink-0" />
          <span className="text-emerald-300 text-xs font-mono font-medium">{short}</span>
        </div>
        {/* Chevron */}
        <svg className={`w-3 h-3 text-emerald-400/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="wallet-dropdown scale-in absolute right-0 top-full mt-2 w-64 glass-elevated rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-emerald-400 text-xs font-semibold">Connected</span>
            </div>
            <p className="text-white/50 text-[11px] font-mono break-all leading-relaxed">{account}</p>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button onClick={copyAddress}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-150">
              {Icons.copy}
              <span>{copied ? '✓ Copied!' : 'Copy Address'}</span>
            </button>
            <a href={`https://amoy.polygonscan.com/address/${account}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-150">
              {Icons.network}
              <span>View on Explorer</span>
            </a>
            <div className="border-t border-white/[0.06] mt-1 pt-1">
              <button onClick={() => { onDisconnect(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-150">
                {Icons.logout}
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [account, setAccount]         = useState(null);
  const [activePage, setActivePage]   = useState('submit');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkWallet();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accs) => setAccount(accs[0] || null));
    }
  }, []);

  const checkWallet = async () => {
    try {
      const accs = await window.ethereum?.request({ method: 'eth_accounts' });
      if (accs?.length) setAccount(accs[0]);
    } catch {}
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) { alert('Please install MetaMask!'); return; }
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accs[0]);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#04091a] bg-grid text-white font-sans overflow-x-hidden">

      {/* ── Ambient glow blobs (floating, animated) ── */}
      <div className="fixed top-[-160px] left-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-700/[0.07] blur-[120px] pointer-events-none blob-float" />
      <div className="fixed bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full bg-blue-700/[0.07] blur-[100px] pointer-events-none blob-float-slow" />
      <div className="fixed top-[40%] right-[20%] w-[200px] h-[200px] rounded-full bg-violet-700/[0.05] blur-[80px] pointer-events-none blob-float" />

      {/* ══════════════ NAVBAR ══════════════ */}
      <header className="glass border-b border-white/[0.05] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-5 h-[60px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile hamburger */}
            <button className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              {Icons.menu}
            </button>

            {/* Logo mark — hexagon-inspired gradient */}
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40" />
              <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                {Icons.chain}
              </div>
              {/* Subtle inner glow ring */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </div>

            {/* Brand name */}
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-[17px] tracking-tight gradient-text">FeedChain</span>
              <span className="hidden sm:block text-white/25 text-[10px] tracking-widest uppercase mt-0.5">Decentralized Feedback</span>
            </div>
          </div>

          {/* ── Center nav pills (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${activePage === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-white/45 hover:text-white hover:bg-white/[0.06]'}`}>
                <span className={activePage === item.id ? 'text-blue-200' : 'text-white/30'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* ── Wallet section ── */}
          <div className="flex items-center gap-2 shrink-0">
            {account ? (
              <WalletDropdown account={account} onDisconnect={() => setAccount(null)} />
            ) : (
              <button onClick={connectWallet}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                {Icons.wallet}
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════ LAYOUT ══════════════ */}
      <div className="max-w-[1400px] mx-auto flex gap-5 px-4 py-6">

        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden md:flex flex-col w-[210px] shrink-0 gap-3 sticky top-[76px] self-start" style={{maxHeight:'calc(100vh - 92px)'}}>

          {/* Nav card */}
          <nav className="glass rounded-2xl p-2 flex flex-col gap-0.5">
            <p className="text-white/20 text-[9px] uppercase tracking-[0.18em] font-bold px-3 pt-2.5 pb-1.5">Menu</p>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left overflow-hidden
                  ${activePage === item.id
                    ? 'bg-gradient-to-r from-blue-600/70 to-indigo-600/70 text-white shadow-md shadow-indigo-500/20'
                    : 'text-white/45 hover:text-white hover:bg-white/[0.05]'}`}>
                {/* Active left bar */}
                {activePage === item.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-300 to-indigo-400 rounded-r-full" />
                )}
                {/* Hover shimmer */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className={`shrink-0 transition-colors duration-200 ${activePage === item.id ? 'text-blue-200' : 'text-white/25 group-hover:text-white/55'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Wallet info card */}
          <div className="glass rounded-2xl p-4">
            <p className="text-white/20 text-[9px] uppercase tracking-[0.18em] font-bold mb-3">Wallet</p>
            {account ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                  <span className="text-emerald-400 text-xs font-semibold">Connected</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5">
                  <p className="text-white/50 text-[10px] font-mono break-all leading-relaxed">{account}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-2 text-white/20">
                  {Icons.wallet}
                </div>
                <p className="text-white/25 text-xs">No wallet connected</p>
              </div>
            )}
          </div>

          {/* Network card */}
          <div className="glass rounded-2xl p-4">
            <p className="text-white/20 text-[9px] uppercase tracking-[0.18em] font-bold mb-3">Network</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-violet-400 pulse-dot" />
              <span className="text-violet-300 text-xs font-semibold">Hardhat Local</span>
            </div>
            <p className="text-white/20 text-[10px] font-mono">Chain ID: 31337</p>
          </div>
        </aside>

        {/* ── Mobile drawer ── */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm fade-in-fast" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-[260px] glass-elevated border-r border-white/[0.07] p-4 flex flex-col gap-3 scale-in">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold gradient-text text-lg">FeedChain</span>
                <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-colors text-lg">×</button>
              </div>
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${activePage === item.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}>
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 pb-8 fade-in" key={activePage}>
          {activePage === 'submit' && <SubmitFeedback account={account} />}
          {activePage === 'view'   && <ViewFeedback />}
          {activePage === 'admin'  && <AdminDashboard account={account} />}
        </main>
      </div>
    </div>
  );
}

