import Link from "next/link";

/** Shown when Vercel is live but NEXT_PUBLIC_AUTH_ENABLED was not set at build time. */
export function ProductionAuthConfigError() {
  const authFlag = process.env.NEXT_PUBLIC_AUTH_ENABLED ?? "(not set)";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
    ? "set"
    : "(not set)";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">
          Production auth not configured
        </h1>
        <p className="text-meta text-ink/70">
          This deploy was built without auth. Add the variables below in
          Vercel → <strong>Settings → Environment Variables → Production</strong>,
          then <strong>Redeploy</strong> (required —{" "}
          <code className="text-sm">NEXT_PUBLIC_*</code> is baked at build time).
        </p>
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-left text-sm text-ink/80">
          <p className="font-medium text-ink">Required (Production + Preview on Vercel)</p>
          <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
            <li>NEXT_PUBLIC_AUTH_ENABLED=true</li>
            <li>
              NEXT_PUBLIC_API_URL=https://adequate-surprise-production-0f84.up.railway.app
            </li>
            <li>NEXT_PUBLIC_OAUTH_SITE_URL=https://bandforge-web.vercel.app</li>
            <li>NEXT_PUBLIC_PHONE_OTP_ENABLED=false</li>
            <li>ADMIN_ALLOWED_EMAIL=product@matalabs.io</li>
          </ul>
          <p className="mt-3 text-meta text-ink/60">
            After redeploy: <code className="text-xs">/api/health</code> should report{" "}
            <code className="text-xs">backend: ok</code>.
          </p>
          <p className="mt-3 text-meta text-ink/60">
            This build: AUTH_ENABLED={authFlag}, API_URL={apiUrl}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-cyan hover:underline"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
