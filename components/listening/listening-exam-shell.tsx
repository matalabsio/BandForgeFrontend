import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Minimal exam chrome — no marketing copy, focus on the test paper. */
export function ListeningExamShell({ children }: Props) {
  const r2Origin = process.env.NEXT_PUBLIC_R2_ENDPOINT_URL ?? null;

  return (
    <div className="min-h-dvh bg-[#f4f4f5] text-[#18181b]">
      {r2Origin ? (
        <>
          <link rel="preconnect" href={r2Origin} />
          <link rel="dns-prefetch" href={r2Origin} />
        </>
      ) : null}
      <header className="sticky top-0 z-20 border-b border-[#e4e4e7] bg-white">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
              IELTS
            </span>
            <span className="h-3 w-px bg-[#e4e4e7]" aria-hidden />
            <span className="text-[13px] font-medium text-[#18181b]">Listening</span>
          </div>
          <Link
            href="/dashboard"
            className="cursor-pointer text-[12px] font-medium text-[#52525b] transition-colors hover:text-[#18181b]"
          >
            Exit
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
