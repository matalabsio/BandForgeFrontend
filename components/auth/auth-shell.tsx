import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-ink">
      <header className="border-b border-border bg-white px-4 py-4 sm:px-6">
        <BandForgeLogoLink size="md" />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <p className="text-meta font-semibold uppercase tracking-wider text-teal">
          AI-first products for learning
        </p>
        <h1 className="mt-2 font-display text-h2 text-navy">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-body text-ink/65">{subtitle}</p>
        ) : null}
        <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
          {children}
        </div>
      </main>
    </div>
  );
}
