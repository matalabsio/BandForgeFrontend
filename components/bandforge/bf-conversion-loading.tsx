export function BfConversionLoading() {
  return (
    <output
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 backdrop-blur-sm"
      aria-live="polite"
      aria-label="Loading sign in"
    >
      <div className="rounded-2xl border border-border bg-white px-8 py-6 shadow-[var(--shadow-elevated)]">
        <p className="text-body font-semibold text-navy">Opening sign in…</p>
        <p className="mt-2 text-meta text-ink/55">This may take a moment on first load.</p>
      </div>
    </output>
  );
}
