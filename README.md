# Allbuild

> We believe founders deserve a **crew**, not another chatbot.

Allbuild is an interactive demo landing page for an always-on AI crew that handles the busywork for founders — so they can do the work only they can do. Built for European founders at every stage: from the solo florist in Barcelona to the Series A SaaS team in Berlin to the hi-tech founder shipping AI infrastructure in London.

The page is structured as a **Simon Sinek Golden Circle** sales pitch (Why → Who → How → Flow → What), with real founder portraits, an interactive animated flow demo, a live crew activity dashboard, and pricing.

## ✨ What's inside

| Section | Tag | Purpose |
|---|---|---|
| **Hero** | — | Belief-first headline with a rotating word (crew → team → squad → staff every 2s) |
| **Stats bar** | — | Count-up proof points (3,238 hours reclaimed, 9,794 work items, etc.) |
| **The Why** | `#why` | The cause: "the work people love shouldn't come with a tax" |
| **The Who** | `#who` | 8 founder portraits from Barcelona, Milano, Berlin, London |
| **The How** | `#how` | 4 principles: Always warm, Always human-approved, Always capable, Always learning |
| **The Flow** | `#flow` | Interactive 5-step animated demo: Request → Coordinator → Crew works → Sign-off → Done |
| **The What** | `#what` | 8 service cards (Coordinator, People Memory, Knowledge at Hand, Always-On Crew, Tool Connections, Dashboard, Sign-Off Loop, Crew Members) |
| **Dashboard** | `#dashboard` | Live crew activity feed (updates every 3.5s) + roster + Today summary |
| **Founders** | `#founders` | 6 founder testimonials with portraits (Laia, Marco, Viktor, Hannah, Amara, Olivia) |
| **Pricing** | `#pricing` | Solo ($500/mo), Crew ($1500/mo, featured), Studio (custom) |
| **Final CTA** | — | "Tomorrow morning could feel a little lighter" |

## 🎨 Brand

- **Brand name:** Allbuild (logo: three ascending rounded blocks in brand gradient)
- **Palette:** Purple & Peach
  - `#FAE3E3` Pale Blush — background
  - `#FFBEBF` Saturated Blush — card fills
  - `#FF7E5D` Secondary Peach — soft fills
  - `#F33167` Primary Peach — highlights
  - `#8954AB` Primary Purple — accents
  - `#B464AD` Secondary Purple — depth
  - `#2D1B2E` Warm Plum Charcoal — text
- **Typography:** Fraunces (humanist serif, headlines) + Inter (sans, body)

## 🛠 Tech stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui component library
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Inter + Fraunces (via `next/font/google`)
- **Package manager:** [Bun](https://bun.sh/)
- **ORM:** Prisma (SQLite client, available if needed)

## 🚀 Run locally

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/) installed
- A GitHub clone of this repo

### Install & start

```bash
git clone https://github.com/EzeCaz/allbuild.git
cd allbuild
bun install        # or: npm install
bun run dev        # or: npm run dev
```

Open http://localhost:3000 in your browser.

### Other scripts

```bash
bun run lint       # ESLint
bun run build      # Production build (do not run in sandbox)
bun run db:push    # Push Prisma schema to SQLite (only if using the DB)
```

## 📦 Deploy on Vercel

This project deploys cleanly to Vercel. Two ways:

### Option A — One-click via Vercel dashboard

1. Go to https://vercel.com/new
2. Import the GitHub repo: `EzeCaz/allbuild`
3. Vercel auto-detects Next.js — keep the default settings
4. Click **Deploy**

### Option B — Via Vercel CLI

```bash
npm i -g vercel
vercel              # preview deploy
vercel --prod       # production deploy
```

A `vercel.json` is included in this repo with sensible defaults (framework = Next.js, no build cache for `.next/`).

After deploying, every push to `main` triggers a new production deploy automatically (once the Vercel × GitHub integration is connected).

## 🗂 Project structure

```
.
├── src/
│   ├── app/
│   │   ├── globals.css        # Tailwind + brand palette utilities + animations
│   │   ├── layout.tsx         # Root layout, fonts (Inter + Fraunces), metadata
│   │   └── page.tsx           # The entire single-page landing page (~1,200 lines)
│   ├── components/ui/         # shadcn/ui components
│   └── lib/                   # Utilities (db client, etc.)
├── public/                    # Static assets
├── prisma/                    # Prisma schema (if using DB)
├── vercel.json                # Vercel deployment config
└── .github/                   # Issue templates, PR template, CI workflow
```

## 🤝 Contributing

Pull requests welcome. Please read the [PR template](.github/PULL_REQUEST_TEMPLATE.md) and use the appropriate [issue template](.github/ISSUE_TEMPLATE/) when filing bugs or feature requests.

CI runs `bun run lint` on every push and PR — make sure your code passes `bun run lint` locally before opening a PR.

## 📝 License

Proprietary — © 2026 Allbuild. All rights reserved.

---

**A brand that shows up warm.** — *a warm start for the work ahead*
