# BandForge Web — Complete Frontend Guide

Next.js **16** (App Router) + **React 19** + **Tailwind CSS 4** for **BandForge** — an AI-first IELTS preparation product by **MATA Labs**. This app is the student-facing website: marketing, Google auth, dashboard, and the **live Listening exam** (`/test/listening`).

| | |
|---|---|
| **Local URL** | http://localhost:3000 |
| **Backend (proxy target)** | http://127.0.0.1:8000 — see [`../backend/README.md`](../backend/README.md) |
| **Monorepo root** | [`../README.md`](../README.md) · progress: [`../done.md`](../done.md) · tasks: [`../todo.md`](../todo.md) |

**Deploy:** Host must use **`frontend`** as the project root (not the repo root). Build: `npm install && npm run build`. Start: `npm run start`.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router (`app/`) |
| UI | React 19, client + server components |
| Styling | Tailwind v4 (`@import "tailwindcss"`), design tokens in `app/globals.css` |
| Fonts | Inter, DM Sans, DM Mono (`app/layout.tsx`) |
| Forms | `react-hook-form` + `zod` (`lib/validators.ts`) |
| Radix | `@radix-ui/react-navigation-menu` (site nav) |

There is **no** separate state library. The Listening exam uses a lightweight React reducer in `modules/listening/store/listening-store.ts`.

---

## Architecture at a glance

```text
Browser
  │
  ├─ Marketing / auth pages ──► BfConversionShell (modals, nav)
  │
  ├─ App pages (/dashboard, /test, /mock) ──► direct layout, no marketing shell
  │
  └─ fetch("/api/...")  same-origin
         │
         ▼
  Next.js Route Handlers  app/api/**/route.ts
         │  proxyToBackend() — forwards Cookie + Bearer
         ▼
  FastAPI  :8000  (/auth, /api/listening, /api/dashboard, …)
         │
         ▼
  Supabase + Cloudflare R2 (audio)
```

**Why BFF proxies?** JWT cookies (`bf_access`, `bf_refresh`) stay on the **site origin**. The browser never calls `localhost:8000` directly for authenticated APIs, so you avoid CORS pain and keep refresh logic on one host.

---

## Directory structure

```text
frontend/
├── app/                          # Routes (App Router)
│   ├── layout.tsx                # Root layout, fonts, metadata, AppRoot
│   ├── globals.css               # Tailwind theme + BandForge tokens
│   ├── page.tsx                  # Marketing home (/)
│   ├── (auth)/                   # Login, signup, verify, reset password
│   ├── (test)/                   # Exam shell layout — /test/*
│   │   └── test/
│   │       ├── listening/        # LIVE exam + results
│   │       ├── reading/          # Demo UI only (not API-backed)
│   │       ├── writing/          # Demo UI only
│   │       └── speaking/         # Demo UI only
│   ├── mock/[mockTestId]/        # Dev/alternate mocks (reading, listening)
│   ├── dashboard/                # Live dashboard (API-backed)
│   ├── workspace/, profile/, settings/
│   ├── scores/                   # Demo analytics (hardcoded)
│   ├── admin/                    # Placeholder admin UI
│   ├── auth/bootstrap/           # Post-OAuth session restore → redirect
│   └── api/                      # BFF proxies → FastAPI
│       ├── auth/[...path]/
│       ├── auth/google/ + callback/
│       ├── listening/[...slug]/
│       ├── dashboard/[...slug]/
│       ├── tests/[...slug]/
│       └── attempts/[...slug]/
│
├── components/
│   ├── bandforge/                # Marketing + dashboard UI
│   ├── listening/                # Exam chrome (shells, results page wrapper)
│   ├── scores/                   # Skill bars, question review (A4)
│   ├── test/                     # Shared test chrome (timer, nav, demo views)
│   ├── auth/                     # Session provider
│   ├── layout/                   # Site navigation
│   └── ui/                       # Primitives (button, card, badge, …)
│
├── modules/listening/            # Listening exam feature module
│   ├── components/               # ListeningPage, audio, form completion
│   ├── hooks/                    # Timer, audio play-once, localStorage recovery
│   ├── services/listening-api.ts # Client API calls → /api/listening
│   ├── store/listening-store.ts  # Attempt state machine
│   └── types.ts
│
├── lib/                          # Shared utilities
│   ├── api.ts, api-proxy.ts      # API URL, BFF proxy helper
│   ├── auth.ts, session.ts       # Client + server auth
│   ├── dashboard-server.ts       # Server-side dashboard fetch
│   ├── listening-test.ts         # Greenfield test IDs + route helpers
│   └── flags.ts                  # NEXT_PUBLIC_* feature flags
│
├── middleware.ts                 # Protects /dashboard, /test, /mock, …
└── package.json
```

---

## What is live vs demo

| Area | Status | Notes |
|------|--------|--------|
| **Listening exam** | **Live** | `/test/listening` → R2 audio → submit → band + results |
| **Listening results** | **Live** | `/test/listening/results/[attemptId]` — skills, question review, practice tip |
| **Dashboard** | **Live** (auth on) | Mock list, stats, continue card, recent attempts |
| **Google sign-in** | **Live** | Primary auth path |
| **Reading mock** | **Partial** | `/mock/.../reading` uses real APIs; **no scoring** yet |
| **20-Q listening mock** | **Dev** | `/mock/c0000000-.../listening` (per-question audio) |
| **`/test/reading`, writing, speaking** | **Demo** | Timer + UI only; no backend submit |
| **`/scores`** | **Live** | Real dashboard summary via `scores-experience.tsx` |
| **`/admin/*`** | **Placeholder** | No CRUD wired |
| Email/password, phone OTP | **UI only** | Backend returns 503 in Google-only phase |

Published listening test ID (canonical):

```ts
// lib/listening-test.ts
d0000000-0000-4000-8000-000000000001  // Greenfield Part 1, 10 form-completion Qs
```

---

## Routes reference

### Marketing & conversion (public)

| Path | Purpose |
|------|---------|
| `/` | Main landing (`BandForgeLanding`) |
| `/features`, `/how-it-works`, `/why`, `/stories`, `/mobile` | Product pages |
| `/ai-feedback`, `/demo` | AI / product previews |
| `/contact` | Contact form |
| `/privacy-policy`, `/terms` | Legal |

These routes wrap content in `BfConversionShell` (header, footer, signup modals) via `AppRoot`.

### Auth

| Path | Purpose |
|------|---------|
| `/login` | Google OAuth + disabled email/phone hints |
| `/signup`, `/check-email`, `/verify-email` | Email flow (backend often 503) |
| `/verify-phone` | OTP UI (off unless flag enabled) |
| `/forgot-password`, `/reset-password` | Password reset UI |
| `/auth/bootstrap` | After OAuth: refresh session → `?next=` redirect |

### Protected app (middleware when `NEXT_PUBLIC_AUTH_ENABLED=true`)

| Path | Purpose |
|------|---------|
| `/dashboard` | Stats, mock grid, continue in-progress, recent bands |
| `/profile` | User profile (BandForge shell) |

### Exams — production path

| Path | Purpose |
|------|---------|
| `/test/listening` | **Live** IELTS listening (Greenfield, exam `variant`) |
| `/test/listening/results/[attemptId]` | Score report (server-fetches `score-report` API) |

### Exams — dev / alternate mocks

| Path | Purpose |
|------|---------|
| `/mock/[mockTestId]/listening` | Redirects Greenfield id → `/test/listening`; else 20-Q mock |
| `/mock/[mockTestId]/listening/results/[attemptId]` | Results for non-canonical mocks |
| `/mock/[mockTestId]/reading` | Real start/questions/submit; no band yet |

### Other

| Path | Purpose |
|------|---------|
| `/scores` | Demo score analytics (not user data) |
| `/admin`, `/admin/tests`, … | Placeholder admin |

---

## Listening exam flow (end-to-end)

This is the only fully wired module.

```text
1. User opens /test/listening (server checks session → else /auth/bootstrap)
2. ListeningPage (client)
     POST /api/listening/{testId}/start        → attempt_id, 30 min timer
     GET  /api/listening/{testId}/questions    → parts, signed R2 audio URLs
3. Greenfield Part 1 UI (form-completion-part.tsx)
     - One audio per part (play-once, autoplay attempt in exam mode)
     - Autosave → POST .../attempts/{id}/autosave
     - localStorage recovery (answers + played state)
4. Submit or timer expiry → POST .../attempts/{id}/submit
     → band, raw_score, skill_breakdown
5. Redirect → /test/listening/results/{attemptId}
     GET .../score-report → questions[], practice_tip, skill bars
```

**Key files**

| File | Role |
|------|------|
| `modules/listening/components/listening-page.tsx` | Orchestrates start, timer, submit, navigation |
| `modules/listening/components/form-completion-part.tsx` | Registration form UI (Q1–10) |
| `modules/listening/components/question-audio.tsx` | Play-once player + autoplay fallback |
| `modules/listening/hooks/use-listening-timer.ts` | Server-anchored countdown + auto-submit |
| `modules/listening/hooks/use-attempt-recovery.ts` | `localStorage` snapshot |
| `modules/listening/services/listening-api.ts` | Typed fetch wrappers |
| `components/listening/listening-results-view.tsx` | Results layout |
| `components/scores/skill-bar.tsx`, `question-review-list.tsx` | A4 score report widgets |

**Question type:** Form completion (short text), not MCQ A/B/C/D — scoring is still objective string match on the backend.

---

## BFF API proxies

All proxies use `lib/api-proxy.ts` → `proxyToBackend(req, backendPath)`.

| Next.js route | Backend |
|---------------|---------|
| `app/api/auth/[...path]/route.ts` | `/auth/*` |
| `app/api/auth/google/route.ts` | Starts Google OAuth |
| `app/api/auth/google/callback/route.ts` | Code exchange + Set-Cookie |
| `app/api/listening/[...slug]/route.ts` | `/api/listening/*` |
| `app/api/dashboard/[...slug]/route.ts` | `/api/dashboard/*` |
| `app/api/tests/[...slug]/route.ts` | `/api/tests/*` |
| `app/api/attempts/[...slug]/route.ts` | `/api/attempts/*` |

Client code should call **`/api/...`** (same origin), not `NEXT_PUBLIC_API_URL` directly, except server components that use `dashboard-server.ts` (server-side fetch to backend with cookie header).

---

## Auth

| Concern | Implementation |
|---------|----------------|
| Source of truth | FastAPI `/auth/*` (not Supabase Auth in the browser) |
| Cookies | `bf_access`, `bf_refresh` (httpOnly, set by BFF on login/refresh) |
| Client access token | In-memory via `lib/session.ts` (`persistAuthTokens`) |
| Middleware | `middleware.ts` — requires refresh cookie on protected prefixes |
| Server user | `getServerUser(cookieHeader)` in `lib/auth.ts` for RSC pages |
| Google OAuth | `/api/auth/google` → backend authorize URL → callback sets cookies |
| Guest mode | `NEXT_PUBLIC_AUTH_ENABLED=false` → middleware off, dashboard API skipped |

**Protected prefixes:** `/dashboard`, `/scores`, `/profile`, `/mock`, `/test`.

**AppRoot** (`components/bandforge/app-root.tsx`) skips marketing conversion shell on app routes so dashboard/exam pages do not load duplicate auth modals.

---

## Environment variables

Create `frontend/.env.local` (or `.env`):

```bash
# Backend URL — used by BFF proxies and server-side dashboard fetch
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# true = middleware + real session + dashboard/listening APIs require login
NEXT_PUBLIC_AUTH_ENABLED=true

# Phone OTP UI (backend must also enable MSG91)
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
```

| Variable | Default | Effect |
|----------|---------|--------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Proxy + server fetch target |
| `NEXT_PUBLIC_AUTH_ENABLED` | `false` in docs | Gate protected routes |
| `NEXT_PUBLIC_PHONE_OTP_ENABLED` | `false` | Show phone OTP on login |

Run the **backend** on port 8000 before testing auth or exams.

---

## Design system

Tokens live in `app/globals.css` under `@theme inline`:

- **Colors:** `navy`, `teal`, `ink`, `surface`, `border`, `success`, `warning`, `danger`
- **Type scale:** `text-h1` … `text-meta`, `text-question`
- **Touch:** `--spacing-touch` (44px-friendly targets)

Use Tailwind classes like `text-navy`, `bg-teal`, `rounded-card`, `shadow-elevated`. Exam listening uses a stricter monochrome palette in `variant="exam"` components.

---

## Commands

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (eslint-config-next)
```

---

## Local development workflow

1. Start API:
   ```bash
   cd ../backend && source .venv/bin/activate
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
2. Set `frontend/.env.local` with `NEXT_PUBLIC_AUTH_ENABLED=true` and API URL.
3. Start frontend: `npm run dev`.
4. Sign in with Google → `/dashboard` → start **Listening** mock.
5. Smoke: complete `/test/listening` → confirm results page shows band + question review.

**Without auth:** set `NEXT_PUBLIC_AUTH_ENABLED=false` to browse marketing and demo test UIs; dashboard will not load live API data.

---

## Deploy (Vercel, Render, etc.)

1. **Root directory:** `frontend` (critical — not monorepo root).
2. **Build:** `npm install && npm run build`
3. **Start:** `npm run start`
4. **Env:**
   - `NEXT_PUBLIC_API_URL` → production API (HTTPS)
   - `NEXT_PUBLIC_AUTH_ENABLED=true`
5. **Backend:** Add frontend origin to CORS with `credentials: true`.
6. **Google OAuth:** Register production callback URL for `/api/auth/google/callback`.

---

## Adding a new feature (conventions)

1. **New API surface** — add `app/api/<module>/[...slug]/route.ts` that calls `proxyToBackend`.
2. **New protected page** — add route under `app/`, add prefix to `middleware.ts` and `AppRoot` if it should skip marketing shell.
3. **New exam module** — prefer `modules/<name>/` (components, hooks, services, types) like `modules/listening/`.
4. **Server data on load** — use `cookies()` + `getServerUser` / `fetchWithTimeout` pattern from `dashboard/page.tsx` or `test/listening/page.tsx`.
5. **Never expose** `correct_answer` in client question payloads; only show after submit via score-report API.

---

## Related documentation

| Doc | Content |
|-----|---------|
| [`../done.md`](../done.md) | What’s built, mock IDs, flows |
| [`../todo.md`](../todo.md) | Phase A v1 scope + backlog |
| [`../ielts-architecture.md`](../ielts-architecture.md) | IELTS module data model |
| [`setup.md`](../setup.md) | Founder build manual (A1–A5) |

---

## Quick troubleshooting

| Problem | Check |
|---------|--------|
| 503 from `/api/*` | Backend running? `NEXT_PUBLIC_API_URL` correct? |
| Redirect loop on `/test/listening` | `NEXT_PUBLIC_AUTH_ENABLED` + Google OAuth env on API |
| Audio won’t play | R2 object uploaded? Do not set `crossOrigin` on `<audio>` for presigned URLs |
| Dashboard empty | Auth enabled + logged in? Only published listening mock is listed |
| `Cannot find module 'next/server'` | Run `npm install` inside `frontend/` |

---

*Last updated: May 2026 — aligns with Phase A v1 (single Greenfield listening test).*
