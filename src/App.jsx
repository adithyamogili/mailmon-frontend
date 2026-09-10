import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { getMe, googleLogin, logout, deleteAccount } from './api';
import GoogleLogin from './components/GoogleLogin';
import GmailConnect from './components/GmailConnect';
import TelegramLink from './components/TelegramLink';
import { CronHero, CronSettings } from './components/CronControls';
import Modal from './components/Modal';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import './App.css';
import { MIc , SPRING} from './constants';

/* ---------- Icons ---------- */


export function Wordmark({ size = "text-xl" }) {
  return (
    <div className={`${size} font-semibold tracking-tight flex items-center gap-2.5 text-[var(--color-heading)]`} style={{ letterSpacing: "-0.02em" }}>
      <div className="w-8 h-8 flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-accent-ink)]" style={{ borderRadius: 10, boxShadow: "0 4px 14px -4px rgba(0,0,0,0.25)" }}>
        <MIc.mail className="w-4 h-4" />
      </div>
      <span>mailmon<span className="text-[var(--color-accent)]">.</span></span>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [stagedInterval, setStagedInterval] = useState(60);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const fetchUser = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data);
      if (data.cron_interval) {
        setStagedInterval(data.cron_interval);
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUser();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('gmail') === 'connected' || params.get('error')) {
      window.history.replaceState({}, '', '/');

      const timer = setTimeout(() => {
        fetchUser();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [fetchUser]);

  const handleGoogleLogin = useCallback(async (credential) => {
    setLoginError('');

    try {
      await googleLogin(credential);
      await fetchUser();
    } catch {
      setLoginError('Login failed. Please try again.');
    }
  }, [fetchUser]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      setUser(null);
      setIsDeleteModalOpen(false);
    } catch  {
      alert('Failed to delete account');
    }
  };

  if (loading) {
    return <div className="min-h-full flex items-center justify-center p-6 text-[var(--color-muted)]">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/" element={
        !user ? (
          <div className="min-h-full flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-[420px]">
              <div className="flex justify-center mb-12">
                <Wordmark size="text-2xl" />
              </div>
              <div className="p-8 bg-[var(--color-surface)] border border-[var(--color-border)]" style={{ borderRadius: 28, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 40px -12px rgba(0,0,0,0.10)" }}>
                <p className="font-mono text-[10px] uppercase mb-4 text-[var(--color-accent)]" style={{ letterSpacing: "0.2em" }}>Sign in</p>
                <h1 className="text-[26px] font-semibold leading-[1.15] text-[var(--color-heading)]" style={{ letterSpacing: "-0.025em" }}>
                  Watch your inbox<br />on autopilot.
                </h1>
                <p className="text-[14px] mt-3.5 leading-[1.55] text-[var(--color-muted)]" style={{ letterSpacing: "-0.01em" }}>
                  Mailmon monitors your Gmail for job emails, interview updates, and recruiter messages — and notifies you on Telegram at your preferred cadence.
                </p>

                <div className="mt-7">
                  <GoogleLogin onSuccess={handleGoogleLogin} isDark={isDark} />
                </div>
                {loginError && <div className="mt-4 text-[13px] text-[var(--color-danger)]">{loginError}</div>}

                <div className="mt-6 flex items-start gap-2 text-[12px] text-[var(--color-muted)]">
                  <MIc.shield className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-accent)]" />
                  <p className="leading-relaxed">OAuth 2.0, read-only Gmail scope. We never store your emails.</p>
                </div>
              </div>
              <p className="text-center text-[11px] mt-6 text-[var(--color-muted)]">
                By continuing you agree to the <Link to="/terms" className="underline decoration-[var(--color-border)] hover:text-[var(--color-heading)]">Terms</Link> &amp; <Link to="/privacy" className="underline decoration-[var(--color-border)] hover:text-[var(--color-heading)]">Privacy</Link>.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-full">
            <div className="max-w-[640px] mx-auto px-6 py-12">
              {/* Top */}
              <div className="flex items-center justify-between mb-12">
                <Wordmark />
                <div className="flex items-center gap-2.5">
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-medium leading-none text-[var(--color-heading)]">{user.name}</p>
                    <p className="text-[10px] mt-0.5 leading-none text-[var(--color-muted)]">{user.email}</p>
                  </div>
                  <button onClick={toggleTheme} title="Toggle Theme" className="w-9 h-9 flex items-center justify-center active:scale-[0.95] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-card)]" style={{ borderRadius: 999, transition: SPRING }}>
                    {isDark ? <MIc.sun className="w-4 h-4" /> : <MIc.moon className="w-4 h-4" />}
                  </button>
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-9 h-9 rounded-full" style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.2)" }} />
                  ) : (
                    <div className="w-9 h-9 text-[13px] font-semibold flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-accent-ink)]" style={{ borderRadius: 999, boxShadow: "0 2px 8px -2px rgba(0,0,0,0.2)" }}>
                      {user.name ? user.name[0].toUpperCase() : 'M'}
                    </div>
                  )}
                  <button onClick={handleLogout} title="Log out" className="w-9 h-9 flex items-center justify-center active:scale-[0.95] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-card)]" style={{ borderRadius: 999, transition: SPRING }}>
                    <MIc.logout className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} title="Delete Account" className="w-9 h-9 flex items-center justify-center active:scale-[0.95] text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-card)]" style={{ borderRadius: 999, transition: SPRING }}>
                    <svg fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>

              {/* Greeting */}
              <div className="mb-9">
                <p className="font-mono text-[10px] uppercase mb-2.5 text-[var(--color-accent)]" style={{ letterSpacing: "0.2em" }}>Monitor</p>
                <h1 className="text-[32px] font-semibold leading-[1.1] text-[var(--color-heading)]" style={{ letterSpacing: "-0.03em" }}>
                  Hey {user.name ? user.name.split(" ")[0] : 'there'}.
                </h1>
                <p className="text-[14px] mt-2 text-[var(--color-muted)]" style={{ letterSpacing: "-0.01em" }}>
                  Connect your accounts, choose your frequency, and start monitoring. <button onClick={() => setIsHowToModalOpen(true)} className="text-[var(--color-muted)] hover:text-[var(--color-heading)] underline decoration-[var(--color-border)] hover:decoration-[var(--color-muted)] underline-offset-4 transition-all">How it works</button>
                </p>
              </div>

              <CronHero
                enabled={user.cron_enabled}
                interval={stagedInterval}
                nextRunAt={user.next_run_at}
                gmailConnected={user.gmail_connected}
                telegramLinked={user.telegram_linked}
                onUpdate={fetchUser}
              />

              {/* Step 1 */}
              <section className="mb-7 mt-9">
                <div className="flex items-baseline justify-between mb-3.5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-[var(--color-muted)]">01</span>
                    <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ letterSpacing: "-0.01em" }}>Connect accounts</h2>
                  </div>
                  <span className="font-mono text-[11px] whitespace-nowrap text-[var(--color-muted)]">{(user.gmail_connected ? 1 : 0) + (user.telegram_linked ? 1 : 0)} / 2</span>
                </div>
                <div className="space-y-2.5">
                  <GmailConnect connected={user.gmail_connected} email={user.email} onUpdate={fetchUser} />
                  <TelegramLink linked={user.telegram_linked} onUpdate={fetchUser} />
                </div>
              </section>

              <CronSettings
                enabled={user.cron_enabled}
                interval={stagedInterval}
                setInterval={setStagedInterval}
                gmailConnected={user.gmail_connected}
                telegramLinked={user.telegram_linked}
                onUpdate={fetchUser}
              />

              <div className="mt-14 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-[var(--color-muted)]">
                  mailmon · v0.1
                </p>
                <div className="flex gap-6">
                  <Link to="/terms" className="text-[11px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors">Terms</Link>
                  <Link to="/privacy" className="text-[11px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors">Privacy</Link>
                </div>
              </div>

              <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete your account?"
                description="This will permanently remove your account and all associated data. This action cannot be undone."
                confirmText="Delete Account"
                isDanger={true}
              />

              <Modal
                isOpen={isHowToModalOpen}
                onClose={() => setIsHowToModalOpen(false)}
                title="How it works"
                description={
                  <div className="space-y-8 text-[14px]">
                    <div>
                      <p className="font-mono text-[10px] uppercase mb-4 text-[var(--color-accent)] opacity-60" style={{ letterSpacing: "0.15em" }}>Path 1: Automated Monitoring</p>
                      <div className="space-y-4">
                        {[
                          "Connect your Gmail (read-only).",
                          "Link your Telegram account.",
                          "Set your scanning frequency.",
                          "Hit \"Start monitoring\" to begin."
                        ].map((step, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--color-raised)] text-[var(--color-heading)] font-bold rounded-full text-[11px] border border-[var(--color-border)]">{i + 1}</span>
                            <p className="pt-0.5 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--color-border)]">
                      <p className="font-mono text-[10px] uppercase mb-4 text-[var(--color-accent)] opacity-60" style={{ letterSpacing: "0.15em" }}>Path 2: Instant Scan</p>
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--color-raised)] text-[var(--color-heading)] rounded-full border border-[var(--color-border)]">
                          <MIc.tg className="w-3 h-3" />
                        </div>
                        <p className="pt-0.5 leading-relaxed">
                          Simply send <span className="font-semibold text-[var(--color-heading)]">any message</span> to our Telegram bot. We'll instantly scan your last 1 hour of emails and ping you if we find anything relevant.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        )
      } />
    </Routes>
  );
}
