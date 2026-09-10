import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-20 animate-fadeIn min-h-full bg-[var(--color-surface)]">
      <Link to="/" className="text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors mb-12 inline-block">
        ← Back
      </Link>

      <article className="prose prose-zinc dark:prose-invert max-w-none">
        <h1 className="text-[28px] font-semibold text-[var(--color-heading)] mb-8 tracking-tight">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-[14px] leading-relaxed text-[var(--color-muted)]">
          <section>
            <h2 className="text-[16px] font-semibold text-[var(--color-heading)] mb-2">1. Information We Collect</h2>
            <p>We collect your Google email address, name, and profile picture through Google authentication. If you connect Telegram, we store your Telegram chat ID to deliver notifications.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[var(--color-heading)] mb-2">2. Gmail Data</h2>
            <p>We use read-only Gmail access to inspect message metadata and a limited preview of message content for job-related classification. Email content is processed transiently and is not stored as an email record in our application database.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-[var(--color-heading)] mb-2">3. Retention</h2>
            <p>Data is stored only while your account is active. Deleting your account from the dashboard permanently purges all data.</p>
          </section>
        </div>
      </article>

      <footer className="mt-16 pt-8 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-muted)] opacity-50">Last updated: May 2026</p>
      </footer>
    </div>
  );
}
