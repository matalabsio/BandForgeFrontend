# BandForge Web (frontend)

Next.js application for **MATA Labs** marketing and **BandForge** IELTS mock-test UI. Lives in the [`MATA-lab`](../README.md) monorepo as `frontend/` (planned split → `bandforge-web`).

| | |
|---|---|
| **Local URL** | http://localhost:3000 |
| **Backend API** | http://127.0.0.1:8000 — see [`../backend/README.md`](../backend/README.md) |
| **Integration** | UI only — **no API calls yet**; all BandForge screens use in-memory demo data |

---

## Status at a glance

| Area | State | Notes |
|------|--------|--------|
| MATA Labs landing `/` | **Shipped (static)** | Marketing site; do not remove or replace |
| Design system | **Built** | Tokens + shared UI primitives |
| Candidate dashboard | **UI prototype** | `/dashboard`, `/scores` |
| Test modules (4 skills) | **UI prototype** | `/test/*` — timers, nav, layouts |
| Admin panel | **UI prototype** | `/admin/*` shells |
| Supabase / auth | **Not started** | Phase 1 auth lives elsewhere per build manual |
| API wiring | **Not started** | Waiting on backend Day 2 (A1/A2) |
| PWA | **Not started** | Required for Android install later |

---

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm** (comes with Node)
- Optional: backend running on port `8000` for future integration (not required to view UI today)

---

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — you should see the **MATA Labs** landing page.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint (Next.js config) |

### Run with backend (optional)

Use two terminals when testing full stack later:

```bash
# Terminal 1 — API
cd ../backend && source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

Today the frontend does not call the API; this is for Postman/Swagger and future wiring.

---

## Tech stack

| Layer | Technology | Version (approx.) |
|-------|------------|-------------------|
| Framework | Next.js (App Router) | 16.x |
| UI library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Primitives | Radix Navigation Menu | 1.x |
| Utilities | `class-variance-authority`, `lib/utils.ts` (`cn`) | — |
| Fonts | DM Sans, DM Mono | via `next/font` |

---

## Routes

### Public — MATA Labs

| Path | Page |
|------|------|
| `/` | Marketing landing |

### BandForge — candidate (demo data)

| Path | Page |
|------|------|
| `/dashboard` | Home: stats, upcoming mocks, practice links |
| `/scores` | Band breakdown, trends, suggestions |

### BandForge — active test (demo data)

Exam-style UI: no site chrome, focused layout (`app/(test)/` route group).

| Path | Module |
|------|--------|
| `/test/reading` | 40 MCQs, question grid, section timer |
| `/test/listening` | Audio player + question flow |
| `/test/writing` | Tasks 1 & 2, word counter |
| `/test/speaking` | Parts 1–3 layout |

### BandForge — admin (demo data)

| Path | Page |
|------|------|
| `/admin` | System overview |
| `/admin/candidates` | Candidate management shell |
| `/admin/tests` | Mock test management shell |
| `/admin/questions` | Question bank shell |

---

## What’s implemented

### 1. MATA Labs landing

- Components: `components/landing/` (`mata-labs-landing`, `landing-header`, `landing-hero`, `hero-cta-button`)
- Hero background: `app/herobg.png`
- Brand: MATA orange `#fd5200`, neutral stone palette
- SEO: root metadata in `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts` (canonical `https://matalabs.io`)
- Icons: `favicon.ico`, `icon.png`, `apple-icon.png`

**Rule:** Keep `/` as MATA Labs. Add BandForge only under other paths.

### 2. Design system

**Tokens** — `lib/design-tokens.ts`

- Colors: navy, teal, success/warning/danger, ink, surface
- Typography scale (h1–meta), radius, 375px mobile baseline, 44px touch targets
- Timer: warning at 5 min, critical at 60s (`getTimerVariant`)
- Writing word targets + `getWordCountStatus`

**CSS** — `app/globals.css`

- Tailwind v4 `@theme inline` mirrors tokens for utility classes (`text-h1`, `bg-teal`, etc.)

**UI kit** — `components/ui/`

`Button`, `Card`, `Badge`, `PageHeader`, `StatCard`, `ProgressBar`, `ScoreBandChart`, `EmptyState`, `Skeleton`, `NavigationMenu` (+ barrel export in `index.ts`)

### 3. Test UI kit

`components/test/` — shared across all four modules:

| Component | Role |
|-----------|------|
| `TestShell` | Full-screen exam chrome |
| `TestHeader` | Top bar + timer slot |
| `TestTimer` | Countdown display (token-driven variants) |
| `QuestionNav` | Question number grid |
| `TestProgress` | Section progress |
| `TestAudioPlayer` | Listening audio controls |
| `WordCounter` | Writing word count + status |
| `TestReadingView` / `Listening` / `Writing` / `Speaking` | Module screens |

**Hook:** `hooks/use-countdown.ts` — section countdown state.

### 4. Dashboard & admin shells

- `components/dashboard/` — `DashboardShell`, `CandidateNav`
- `components/admin/` — `AdminShell`
- `components/scores/` — `ScoreReportView`
- `components/layout/` — `site-navigation` (where used)

---

## Project structure

```
frontend/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── (test)/                    # Route group — no marketing layout
│   │   ├── layout.tsx
│   │   └── test/{reading,listening,writing,speaking}/page.tsx
│   ├── dashboard/page.tsx
│   ├── scores/page.tsx
│   └── admin/{page,candidates,tests,questions}/page.tsx
├── components/
│   ├── landing/                   # MATA Labs only
│   ├── dashboard/
│   ├── admin/
│   ├── test/
│   ├── scores/
│   ├── layout/
│   └── ui/
├── hooks/
│   └── use-countdown.ts
├── lib/
│   ├── design-tokens.ts
│   └── utils.ts
├── setup.md                       # BandForge build manual (orientation)
├── .gitignore                     # Next.js / env ignores (use when you init git)
├── package.json
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

---

## Environment variables

Not required for current demo UI. When integrating, add **`.env.local`** (gitignored):

```bash
# API (Day 2+)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Supabase (when auth is wired)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never commit secrets. See `.gitignore` for ignored paths (`node_modules/`, `.next/`, `.env*`, etc.).

---

## Conventions

1. **`/` = MATA Labs** — BandForge under `/dashboard`, `/test/*`, `/admin/*`.
2. **Two UX modes** — Expressive dashboard/admin vs minimal clinical test UI.
3. **Mobile-first** — Design for 375px width; respect `touchTargetPx` in tokens.
4. **No business logic in Next.js** — Scoring, DB, R2, evaluation live in `../backend`.
5. **Small PRs** — One feature per change; see `setup.md` for full product scope.

---

## Out of scope (not built here)

- Mock test generator, marketing copy beyond landing
- Razorpay, MSG91, phone OTP (Phase 1 / founder)
- Real question bank, attempts, auto-scoring, speaking upload
- Automated E2E / unit test suite in this package
- `app/api/*` BFF routes (prefer FastAPI)

---

## Related documentation

| File | Purpose |
|------|---------|
| [`setup.md`](./setup.md) | BandForge build manual — scope, stack, repo rules |
| [`../backend/README.md`](../backend/README.md) | FastAPI, Supabase migrations, Postman, health checks |
| [`../README.md`](../README.md) | Monorepo overview |

---

## Deploy

Configure the host (e.g. **Vercel**) with **Root Directory = `frontend`**, not the monorepo root.

Build command: `npm run build`  
Output: Next.js default (`.next` handled by platform)

---

## Roadmap (frontend)

1. **`lib/api.ts`** — client for `NEXT_PUBLIC_API_URL`
2. **Day 2** — load questions + start attempt from backend (A1/A2)
3. **Auth middleware** — protect `/dashboard`, `/test/*` when Supabase OTP is ready
4. **Replace demo state** — server components or React Query for attempts/answers
5. **PWA** — `manifest.json` + service worker for installable Android build
