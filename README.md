<p align="center">
  <img src="public/logo.png" alt="Backlog AI logo" width="96" height="96" />
</p>

<h1 align="center">Backlog AI</h1>

<p align="center">A job application pipeline tracker with AI-assisted extraction, contact discovery, and resume tailoring.</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black.svg" />
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/deployed%20on-Vercel-black.svg" />
</p>

---

## About

Backlog AI keeps job applications organized in one pipeline: stage tracking, contact and outreach notes, custom project entries, and activity history per application. It uses an LLM to extract job details from a posting URL and to generate a tailored resume, and can surface relevant contacts to reach out to at a company.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Postgres via Neon](https://neon.tech)
- [Groq](https://groq.com) for AI extraction and resume generation
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS

## Use it

**Hosted:** go to [backlog-ai-one.vercel.app](https://backlog-ai-one.vercel.app), sign up with any email, and start tracking applications — no setup required, runs on the maintainer's backend.

**Self-host:** clone the repo and bring your own Groq/Serper/Neon keys — each deployment's data is fully isolated per account, so this also works as a multi-user instance if you host it yourself.

## Pricing

Free plan includes unlimited applications/contacts and 20 AI calls/day (job extraction, contact discovery, resume tailoring). Pro ($12/mo) raises that to 200/day, sold through [Dodo Payments](https://dodopayments.com). Billing is optional — self-hosted instances run fine without Dodo keys set, everyone just stays on the free plan.

## Getting started

```bash
git clone https://github.com/ishm6m/backlog-ai.git
cd backlog-ai
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your own values:

- `DATABASE_URL` — Postgres connection string (Neon)
- `GROQ_API_KEY` — Groq API key
- `SERPER_API_KEY` — Serper API key (search)
- `NEON_AUTH_BASE_URL` — Neon Auth base URL
- `NEON_AUTH_COOKIE_SECRET` — Neon Auth cookie secret
- `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PRO_PRODUCT_ID` — optional, only needed to sell the Pro plan

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT — see [LICENSE](LICENSE).
