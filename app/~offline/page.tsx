"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <p className="bf-eyebrow text-teal">BandForge</p>
      <h1 className="bf-section-title mt-3 text-navy">You&apos;re offline</h1>
      <p className="bf-copy mt-4 max-w-md text-ink/70">
        Reconnect to continue your IELTS practice. Exam sessions and scores need
        an internet connection.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-navy/20 px-6 py-3 font-display text-sm font-semibold text-navy transition-colors hover:bg-surface"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
