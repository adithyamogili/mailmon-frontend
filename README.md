# MailMon

> Monitor your Gmail inbox for important job-related updates and receive notifications through Telegram.

MailMon is a full-stack inbox monitoring application built to reduce the need for repeatedly checking email during an active job search.

Users connect their Gmail account through OAuth 2.0, configure a monitoring interval, and link a Telegram account. MailMon periodically scans incoming messages, identifies relevant job-related emails, classifies them, and sends useful updates through Telegram.

## Features

- **Google Authentication** — Sign in securely using Google OAuth 2.0.
- **Read-only Gmail Access** — Connect Gmail without granting permission to modify or send emails.
- **Keyword Filtering** — Narrow down the inbox to relevant job-search messages before classification.
- **AI Classification** — Categorize relevant messages such as interview invitations, assessments, offers, rejections, and next-round updates.
- **Telegram Notifications** — Receive important updates directly through Telegram.
- **Configurable Monitoring** — Choose a monitoring interval from 30 minutes to daily.
- **Scheduled Background Jobs** — Monitoring continues automatically without requiring the dashboard to remain open.
- **Live Monitoring Status** — The dashboard displays the monitoring state and upcoming scan.
- **Duplicate Prevention** — Prevent repeated notifications for the same email event.
- **Dark Mode** — Responsive dashboard with light and dark themes.
- **Account Management** — Disconnect Gmail, unlink Telegram, or delete the MailMon account.

## How It Works

```text
Google Login
     │
     ▼
Connect Gmail ────────► Gmail API
     │
     ▼
Configure monitoring interval
     │
     ▼
Background scheduler
     │
     ▼
Fetch recent Gmail messages
     │
     ▼
Keyword filtering
     │
     ▼
AI classification
     │
     ▼
Relevant job update
     │
     ▼
Telegram notification