import { useState } from 'react';
import { getGmailConnectURL, disconnectGmail } from '../api';
import { MIc, SPRING, EASE } from '../constants';

export default function GmailConnect({ connected, email, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGmailConnectURL();
      window.location.href = data.url;
    } catch  {
      setError('Failed to start Gmail connection');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError('');
    try {
      await disconnectGmail();
      onUpdate();
    } catch  {
      setError('Failed to disconnect Gmail');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 flex items-center gap-4 bg-[var(--color-card)] border border-[var(--color-border)]" style={{ borderRadius: 18, transition: EASE, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div className="w-11 h-11 flex items-center justify-center shrink-0 bg-[var(--color-raised)]" style={{ borderRadius: 14 }}>
        <MIc.google className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-[14px] text-[var(--color-heading)]" style={{ letterSpacing: "-0.01em" }}>Gmail</h3>
          {connected ?
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap bg-[var(--color-accent-soft)] text-[var(--color-accent)]" style={{ borderRadius: 999 }}>
              <MIc.check className="w-2.5 h-2.5" /> Connected
            </span> :
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium whitespace-nowrap border border-[var(--color-border)] text-[var(--color-muted)]" style={{ borderRadius: 999 }}>
              Not connected
            </span>}
        </div>
        <p className="text-[12px] mt-0.5 truncate text-[var(--color-muted)]">{connected ? email : "Read-only inbox access"}</p>
        {error && <p className="text-[10px] text-[var(--color-danger)] mt-1">{error}</p>}
      </div>
      {connected ?
      <button onClick={handleDisconnect} disabled={loading} className="text-[12px] font-medium px-3 py-1.5 active:scale-[0.97] text-[var(--color-muted)] hover:text-[var(--color-heading)] hover:bg-[var(--color-raised)] disabled:opacity-50" style={{ borderRadius: 999, transition: SPRING }}>
          {loading ? '...' : 'Disconnect'}
        </button> :
      <button onClick={handleConnect} disabled={loading} className="inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium active:scale-[0.97] bg-[var(--color-btn-primary)] text-[var(--color-btn-primary-ink)] disabled:opacity-70" style={{ borderRadius: 999, transition: SPRING, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
          {loading ? '...' : 'Connect'} <MIc.arrow className="w-3.5 h-3.5" />
        </button>}
    </div>
  );
}
