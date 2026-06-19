import Link from "next/link";

/** Shown when Vercel is live but NEXT_PUBLIC_AUTH_ENABLED was not set at build time. */
export function ProductionAuthConfigError() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">
          Production auth not configured
        </h1>
        <p className="text-meta text-ink/70">
          Set{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            NEXT_PUBLIC_AUTH_ENABLED=true
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          on Vercel (Production), then redeploy. See{" "}
          <code className="text-sm">docs/vercel-production.md</code> in the repo.
        </p>
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
