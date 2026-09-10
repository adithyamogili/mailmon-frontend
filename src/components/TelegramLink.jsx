import { useState, useEffect, useRef } from 'react';
import { getTelegramLinkCode } from '../api';
import { MIc, SPRING, EASE } from '../constants';

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'MailmonBot'; // using MailmonBot as fallback placeholder

export default function TelegramLink({ linked, onUpdate }) {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (linked && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [linked]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    const textToCopy = `/link ${code}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetCode = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTelegramLinkCode();
      setCode(data.code);
      pollRef.current = setInterval(() => onUpdate(), 3000);
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, 10 * 60 * 1000);
    } catch  {
      setError('Failed to generate link code');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 flex items-center gap-4 bg-[var(--color-card)] border border-[var(--color-border)]" style={{ borderRadius: 18, transition: EASE, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div className="w-11 h-11 flex items-center justify-center shrink-0 bg-[var(--color-raised)]" style={{ borderRadius: 14 }}>
        <MIc.tg className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-[14px] text-[var(--color-heading)]" style={{ letterSpacing: "-0.01em" }}>Telegram</h3>
          {linked ?
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap bg-[var(--color-accent-soft)] text-[var(--color-accent)]" style={{ borderRadius: 999 }}>
              <MIc.check className="w-2.5 h-2.5" /> Connected
            </span> :
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium whitespace-nowrap border border-[var(--color-border)] text-[var(--color-muted)]" style={{ borderRadius: 999 }}>
              Not connected
            </span>}
        </div>
        {linked ? (
           <p className="text-[12px] mt-0.5 truncate text-[var(--color-muted)]">Linked to bot</p>
        ) : code ? (
           <div className="flex items-center gap-2 mt-0.5">
             <p className="text-[12px] truncate text-[var(--color-muted)]">
               Send <code 
                 onClick={handleCopy}
                 title="Click to copy command"
                 className="font-mono bg-[var(--color-raised)] px-1.5 py-0.5 rounded text-[var(--color-heading)] cursor-pointer hover:bg-[var(--color-accent-soft)] transition-colors border border-transparent hover:border-[var(--color-accent)]"
               >
                 /link {code}
               </code> to <a href={`https://t.me/${BOT_USERNAME}`} target="_blank" rel="noreferrer" className="underline hover:text-[var(--color-heading)]">@{BOT_USERNAME}</a>
             </p>
             {copied && <span className="text-[10px] font-medium text-[var(--color-success)] animate-fadeIn">Copied!</span>}
           </div>
        ) : (
           <p className="text-[12px] mt-0.5 truncate text-[var(--color-muted)]">Where pings are sent</p>
        )}
        {error && <p className="text-[10px] text-[var(--color-danger)] mt-1">{error}</p>}
      </div>
      
      {!linked && !code && (
        <button onClick={handleGetCode} disabled={loading} className="inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium active:scale-[0.97] bg-[var(--color-btn-primary)] text-[var(--color-btn-primary-ink)] disabled:opacity-70" style={{ borderRadius: 999, transition: SPRING, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
          {loading ? '...' : 'Connect'} <MIc.arrow className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
