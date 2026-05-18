# bandforge-web (frontend)

Next.js app for **MATA Labs** (marketing) and **BandForge** (IELTS mock-test UI). This folder maps to the future `bandforge-web` repo in the monorepo [`MATA-lab`](../README.md).

**Backend (API):** [`../backend`](../backend/README.md) — FastAPI on port `8000`. The frontend is **not wired to it yet**; screens use local demo data.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Components | Radix Navigation Menu, custom UI primitives |
| Fonts | DM Sans + DM Mono (Google Fonts) |

---

## Quick start

```bash
cd frontend
npm install
npm run dev    # http://localhost:3000
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

**Requirements:** Node.js 20+ recommended.

---

## What’s done

### MATA Labs landing (`/`)

Production-style marketing page — **do not replace** when extending BandForge.

- Sticky navbar (desktop + mobile `<details>` menu)
- Hero with background image, CTAs, “Launching soon”
- About, product cards, contact (`hello@matalabs.io`), footer
- Brand accent `#fd5200`, stone/neutral palette
- SEO: metadata, Open Graph, `robots.ts`, `sitemap.ts` → `https://matalabs.io`
- Favicons: `favicon.ico`, `icon.png`, `apple-icon.png`

**Key files:** `app/page.tsx`, `components/landing/*`

### BandForge design system

Shared tokens and UI primitives for dashboard, admin, and test flows.

- **Tokens:** `lib/design-tokens.ts` — navy/teal palette, typography scale, timer thresholds, writing word targets
- **UI:** `components/ui/` — `Button`, `Card`, `Badge`, `PageHeader`, `StatCard`, `ProgressBar`, `ScoreBandChart`, `EmptyState`, `Skeleton`, navigation menu

### Candidate dashboard (demo)

| Route | Description |
|-------|-------------|
| `/dashboard` | Mock stats, upcoming mocks, links to practice modules |
| `/scores` | Score report layout with band chart and improvement copy |

Uses `DashboardShell` + `CandidateNav` — expressive layout, separate from the clinical test UI.

### Active test UI (demo / prototype)

IELTS-style screens with **hardcoded content** (no API, no auth).

| Route | Module |
|-------|--------|
| `/test/reading` | 40 questions, countdown timer, question grid nav, MCQ options |
| `/test/listening` | Audio player shell + question flow |
| `/test/writing` | Task UI + word counter (targets from design tokens) |
| `/test/speaking` | Parts 1–3 layout shell |

**Shared test kit** (`components/test/`): `TestShell`, `TestHeader`, `TestTimer`, `QuestionNav`, `TestProgress`, `TestAudioPlayer`, `WordCounter`, module-specific views.

**Hook:** `hooks/use-countdown.ts` for section timers.

Test routes use `app/(test)/layout.tsx` — no marketing chrome (per build manual §4.3).

### Admin UI (demo)

| Route | Description |
|-------|-------------|
| `/admin` | System overview stat cards |
| `/admin/candidates` | Candidate list shell |
| `/admin/tests` | Mock test management shell |
| `/admin/questions` | Question bank shell |

Uses `AdminShell` — data-dense layout; copy notes connection to `bandforge-api` when live.

### Repo hygiene (earlier pass)

- Removed legacy waitlist, Supabase client, shadcn experiments, and unused deps from the old root app
- Trimmed dependency tree (~285 packages removed); core stack only

---

## What’s not done yet

| Area | Status |
|------|--------|
| API integration | No `fetch` to `http://127.0.0.1:8000` — connect after Day 2 routes (A1/A2) |
| Auth | No `/login`, Supabase session, or protected routes |
| Real test data | Questions, attempts, answers from database |
| PWA | No manifest or service worker |
| Payments / SMS | Out of scope (Phase 1 elsewhere) |
| Writing / speaking evaluation UI | Scoring flows pending backend (B/C phases) |
| E2E tests | No Playwright/Vitest suite in this package |

---

## Routes map

```
/                          MATA Labs landing (keep)
/dashboard                 Candidate home (demo)
/scores                    Score report (demo)
/test/reading              Reading mock (demo)
/test/listening            Listening mock (demo)
/test/writing              Writing mock (demo)
/test/speaking             Speaking mock (demo)
/admin                     Admin overview (demo)
/admin/candidates
/admin/tests
/admin/questions
```

---

## Project structure

```
frontend/
├── app/
│   ├── page.tsx              # /
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── globals.css           # Tailwind v4
│   ├── (test)/               # Test route group (no marketing chrome)
│   │   └── test/{reading,listening,writing,speaking}/
│   ├── dashboard/
│   ├── scores/
│   └── admin/
├── components/
│   ├── landing/              # MATA Labs only
│   ├── dashboard/
│   ├── admin/
│   ├── test/                 # IELTS test UI kit
│   ├── scores/
│   ├── layout/
│   └── ui/                   # Design system primitives
├── hooks/
├── lib/
│   ├── design-tokens.ts
│   └── utils.ts
├── setup.md                  # BandForge build manual (orientation)
└── package.json
```

---

## Environment

Create `.env.local` in this folder when integrating (gitignored). Typical future variables:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Until then, no env file is required to run the landing and demo pages.

---

## Conventions

1. **`/` stays MATA Labs** — BandForge features live under `/dashboard`, `/test/*`, `/admin/*`, etc.
2. **Two visual modes** — Dashboard/admin (expressive) vs active test (minimal, exam-like).
3. **Mobile-first** — Baseline width 375px, 44px touch targets (`design-tokens.ts`).
4. **Backend** — All business logic, scoring, and storage live in `../backend`, not in Next.js API routes.

---

## Related docs

| Document | Contents |
|----------|----------|
| [`setup.md`](./setup.md) | Full BandForge build manual excerpt (scope, stack, repo rules) |
| [`../backend/README.md`](../backend/README.md) | API setup, Postman, `db-check`, `r2-check` |
| [`../README.md`](../README.md) | Monorepo overview |

---

## Deploy

Point Vercel (or similar) at this **`frontend/`** directory as the project root, not the monorepo root.

---

## Next steps (frontend)

1. Add `NEXT_PUBLIC_API_URL` and a small API client module.
2. Wire `/dashboard` “Start mock test” to real `POST` attempt + `GET` questions (Day 2).
3. Replace demo state in test views with server-driven props.
4. Add auth gate when Supabase phone OTP is integrated.
5. PWA manifest + service worker when required for Android install.
