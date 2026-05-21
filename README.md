# BandForge Web (frontend)

Next.js **App Router** site for **BandForge** — AI-first IELTS preparation by **MATA Labs** — plus legal/contact pages.

| | |
|---|---|
| **Local URL** | http://localhost:3000 |
| **API (proxy target)** | http://localhost:8000 |

---

## Routes

| Path | Page |
|------|------|
| `/` | BandForge marketing landing |
| `/login`, `/signup` | Email/password auth |
| `/check-email` | Post-signup “check your inbox” |
| `/verify-phone` | Phone OTP (disabled unless `NEXT_PUBLIC_PHONE_OTP_ENABLED=true`) |
| `/verify-email` | Email verification link (Resend) → logs you in |
| `/forgot-password`, `/reset-password` | Password reset flow |
| `/dashboard`, `/workspace`, `/settings` | Protected (refresh cookie required) |
| `/contact` | Contact form |
| `/privacy-policy`, `/terms` | Legal |

---

## Auth architecture

- **All auth logic lives in the FastAPI backend** (`/auth/*`).
- The frontend calls **`/api/auth/*`** — Next.js **BFF proxy** forwards to the API and re-sets `bf_access` / `bf_refresh` httpOnly cookies on the site origin.
- **Access token** is also kept in memory (`lib/session.ts`) for client refresh; **refresh token** is never exposed to JS.
- **Middleware** guards `/dashboard`, `/workspace`, `/settings` when `NEXT_PUBLIC_AUTH_ENABLED=true` (requires `bf_refresh` cookie). Off by default for local mock UI work.

### Key files

```
lib/auth.ts          # Client auth API (login, OTP, logout, …)
lib/api.ts           # API URL + error helpers
lib/session.ts       # Cookie names + in-memory access token
lib/validators.ts    # Zod schemas (react-hook-form)
lib/auth-proxy.ts    # BFF proxy for /api/auth/[...path]
app/(auth)/          # Login, signup, verify-phone, …
app/api/auth/[...path]/route.ts
middleware.ts
```

---

## Environment

Copy `.env.local.example` → `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
# Auth off by default — Start mock goes straight to /dashboard
NEXT_PUBLIC_AUTH_ENABLED=false
```

Run the **backend** on port 8000 before testing auth.

---

## Email-first flow (default)

1. **Continue with Google** (instant) or **Continue with email** (verification link).
2. **Start free mock test** opens the signup modal with both options.
3. Email path: Resend verification → `/check-email` → `/verify-email` → dashboard.
4. **Login** requires verified email for password accounts (Google accounts are pre-verified).

**Dev without Resend:** set `AUTH_SKIP_EMAIL_VERIFY=1` in `backend/.env` (auto-verify on register).

---

## Phone OTP (later)

Disabled by default. Set `PHONE_OTP_ENABLED=true` (backend) and `NEXT_PUBLIC_PHONE_OTP_ENABLED=true` (frontend) when MSG91 is ready.

---

## Commands

```bash
cd frontend && npm install && npm run dev
npm run build
npm run lint
```

---

## Deploy

**Root Directory must be `frontend`** (Vercel, Render, etc.). Build command: `npm install && npm run build`. Start command: `npm run start`.

Set `NEXT_PUBLIC_API_URL` to your production API URL. Ensure API CORS allows your web origin with `credentials`.

Commit `frontend/package.json` and `frontend/package-lock.json` together after adding UI deps (e.g. `@radix-ui/react-navigation-menu`).
