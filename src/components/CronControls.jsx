import { useState, useEffect } from 'react';
import { updateCron } from '../api';
import { MIc, SPRING, EASE } from '../constants';

const INTERVALS = [
  { id: 30, label: "30 min", sub: "Frequent" },
  { id: 60, label: "1 hour", sub: "Recommended" },
  { id: 180, label: "3 hours", sub: "Balanced" },
  { id: 360, label: "6 hours", sub: "Light" },
  { id: 1440, label: "Daily", sub: "Digest" }
];

export function CronHero({ enabled, nextRunAt, gmailConnected, telegramLinked, onUpdate, interval }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!nextRunAt || !enabled) {
      const timer = setTimeout(() => setTimeLeft(''), 0);
      return () => clearTimeout(timer);
    }
    let refreshed = false;
    const tick = () => {
      const diff = new Date(nextRunAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('scanning now...');
        if (!refreshed) {
          refreshed = true;
          setTimeout(() => onUpdate(), 3000);
        }
        return;
      }
      refreshed = false;
      
      const seconds = Math.floor(diff / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      const h = Math.floor(m / 60);
      const min = m % 60;

      if (h > 0) {
        setTimeLeft(`in ${h}h ${min}m`);
      } else if (min > 0) {
        setTimeLeft(`in ${min}m ${s}s`);
      } else {
        setTimeLeft(`in ${s}s`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRunAt, enabled, onUpdate]);

  const ready = gmailConnected && telegramLinked;

  const handleToggle = async (start) => {
    setLoading(true);
    setError('');
    try {
      await updateCron(start, interval || 60);
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
    setLoading(false);
  };

  const intervalLabel = INTERVALS.find((i) => i.id === interval)?.label || "—";
  const checkingText = intervalLabel === "Daily" ? "Checking daily" : `Checking every ${intervalLabel.toLowerCase()}`;

  const heroStyle = enabled ?
  { background: 'var(--color-card)', border: `1px solid var(--color-danger)`, boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(239, 68, 68, 0.25)` } :
  ready ?
  { background: 'var(--color-card)', border: `1px solid var(--color-accent)`, boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(10,10,10,0.1)` } :
  { background: 'var(--color-card)', border: `1px solid var(--color-border)`, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" };

  return (
    <div className="p-7 mb-9" style={{ ...heroStyle, borderRadius: 28, transition: EASE }}>
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            {enabled ?
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase whitespace-nowrap text-[var(--color-success)]" style={{ letterSpacing: "0.2em" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulseDot"></span> Live
              </span> :
            <span className="font-mono text-[10px] uppercase whitespace-nowrap text-[var(--color-muted)]" style={{ letterSpacing: "0.2em" }}>{ready ? "Ready" : "Not ready"}</span>}
          </div>
          <p className="font-semibold text-[18px] leading-snug text-[var(--color-heading)]" style={{ letterSpacing: "-0.02em" }}>
            {enabled ? `Watching your inbox` : ready ? `Start watching inbox` : "Finish setup to start"}
          </p>
          <p className="text-[12px] mt-1 text-[var(--color-muted)]">
            {enabled ?
            `${checkingText} · next scan ${timeLeft}` :
            ready ?
            `${intervalLabel} intervals · pings via Telegram` :
            !gmailConnected ? "Gmail not connected" :
            !telegramLinked ? "Telegram not linked" :
            "Ready"}
          </p>
        </div>

        {enabled ?
        <button onClick={() => handleToggle(false)} disabled={loading} className="inline-flex items-center gap-2 h-12 px-6 text-[14px] font-semibold active:scale-[0.97] bg-[var(--color-danger)] text-white disabled:opacity-70" style={{ borderRadius: 999, transition: SPRING, boxShadow: `0 4px 14px -4px rgba(239, 68, 68, 0.4)` }}>
            <MIc.stop className="w-3.5 h-3.5" /> Stop monitoring
          </button> :
        <button
          disabled={!ready || loading}
          onClick={() => handleToggle(true)}
          className="inline-flex items-center gap-2 h-12 px-6 text-[14px] font-semibold active:scale-[0.97] disabled:opacity-70"
          style={ready ?
          { background: 'var(--color-accent)', color: 'var(--color-accent-ink)', borderRadius: 999, transition: SPRING, boxShadow: `0 4px 14px -4px rgba(10,10,10,0.5)` } :
          { background: 'var(--color-raised)', color: 'var(--color-muted)', cursor: 'not-allowed', borderRadius: 999, transition: SPRING }}>
            <MIc.play className="w-3.5 h-3.5" /> Start monitoring
          </button>}
      </div>
      {error && <p className="text-[10px] text-[var(--color-danger)] mt-4">{error}</p>}
    </div>
  );
}

export function CronSettings({ enabled, interval, setInterval, gmailConnected, telegramLinked, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ready = gmailConnected && telegramLinked;

  const handleIntervalChange = async (val) => {
    setInterval(val);
    if (enabled) {
      setLoading(true);
      setError('');
      try {
        await updateCron(true, val);
        onUpdate();
      } catch (err) {
        setError(err.message || 'Failed to update interval');
      }
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3.5">
        <span className="font-mono text-[11px] text-[var(--color-muted)]">02</span>
        <h2 className="text-[15px] font-medium text-[var(--color-heading)]" style={{ letterSpacing: "-0.01em" }}>How often</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {INTERVALS.map((opt) => {
          const active = interval === opt.id;
          return (
            <button key={opt.id} onClick={() => handleIntervalChange(opt.id)} disabled={!ready || loading}
            className={`text-left p-3.5 active:scale-[0.97] disabled:opacity-70 ${!ready && 'cursor-not-allowed'}`}
            style={{
              ...(active ?
              { background: 'var(--color-accent-soft)', border: `1px solid var(--color-accent)` } :
              { background: 'var(--color-card)', border: `1px solid var(--color-border)` }),
              borderRadius: 18, transition: SPRING,
              boxShadow: active ? `0 1px 2px rgba(0,0,0,0.04), 0 8px 20px -8px rgba(10,10,10,0.15)` : "0 1px 2px rgba(0,0,0,0.03)"
            }}>
              <p className="text-[13px] font-medium text-[var(--color-heading)]" style={{ letterSpacing: "-0.01em" }}>{opt.label}</p>
              <p className="text-[10px] mt-0.5 text-[var(--color-muted)]">{opt.sub}</p>
            </button>);
        })}
      </div>
      {error && <p className="text-[10px] text-[var(--color-danger)] mt-4">{error}</p>}
    </section>
  );
}

export default function CronControls(props) {
  return (
    <>
      <CronHero {...props} />
      <CronSettings {...props} />
    </>
  );
}
