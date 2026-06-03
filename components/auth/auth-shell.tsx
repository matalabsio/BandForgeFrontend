import Link from "next/link";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-dvh bg-surface text-ink lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="hidden lg:block">
        <AuthBrandPanel />
      </div>

      <div className="flex min-h-dvh flex-col bf-page-shell">
        <div className="relative overflow-hidden bg-navy px-4 py-8 text-white sm:px-6 lg:hidden">
          <div
            className="pointer-events-none absolute inset-0 bf-grid-bg opacity-30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-10 -right-8 h-40 w-40 rounded-full bg-teal/30 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10">
            <div className="inline-flex rounded-2xl bg-white px-3.5 py-2 shadow-[0_16px_40px_-24px_rgb(0_0_0_/_0.45)]">
              <BandForgeLogoLink size="md" priority />
            </div>
            <p className="mt-4 font-bitter text-2xl font-extrabold tracking-[-0.03em]">
              Prepare smarter for IELTS
            </p>
            <p className="mt-2 max-w-sm font-lora text-sm leading-relaxed text-white/72">
              Realistic mocks, instant scores, and AI feedback across all four
              modules.
            </p>
          </div>
        </div>

        <header className="flex items-center justify-end border-b border-border/80 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:justify-between lg:border-none lg:bg-transparent lg:px-10 lg:py-4 lg:pt-10">
          <BandForgeLogoLink size="md" className="hidden lg:inline-flex" />
          <Link
            href="/"
            prefetch
            className="hidden cursor-pointer text-meta font-semibold text-ink/55 transition-colors duration-200 hover:text-teal lg:inline-flex"
          >
            ← Back to home
          </Link>
          <Link
            href="/features"
            prefetch
            className="cursor-pointer text-meta font-semibold text-teal transition-colors duration-200 hover:text-teal-light"
          >
            Explore features
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:max-w-md lg:px-10 lg:py-12">
          <div className="bf-fade-up lg:mt-0">
            <h1 className="font-bitter text-3xl font-extrabold tracking-[-0.03em] text-navy sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2.5 font-lora text-body leading-relaxed text-ink/68 sm:text-[0.9375rem]">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="bf-fade-up bf-delay-1 mt-8 rounded-3xl border border-border/80 bg-white/90 p-6 shadow-[0_18px_60px_-36px_rgb(13_31_60_/_0.35)] backdrop-blur-sm sm:p-7">
            {children}
          </div>
        </main>

        <footer className="border-t border-border/70 px-4 py-5 text-center sm:px-6 lg:px-10">
          <p className="text-meta text-ink/50">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              prefetch
              className="cursor-pointer font-semibold text-ink/70 underline-offset-2 transition-colors duration-200 hover:text-teal hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              prefetch
              className="cursor-pointer font-semibold text-ink/70 underline-offset-2 transition-colors duration-200 hover:text-teal hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
