export function BfSectionSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={className ?? "bf-section border-t border-border/70 bg-white"}
      aria-hidden
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-navy/8" />
        <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-navy/6" />
        <div className="mt-3 h-4 w-2/3 max-w-md animate-pulse rounded bg-navy/6" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border/60 bg-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
