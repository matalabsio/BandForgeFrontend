function Pulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-ink/[0.06] ${className}`}
    />
  );
}

export function ScoresContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading performance">
      <div className="space-y-2">
        <Pulse className="h-4 w-24" />
        <Pulse className="h-8 w-64" />
        <Pulse className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Pulse key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Pulse className="h-64 w-full" />
        <Pulse className="h-64 w-full" />
      </div>
      <Pulse className="h-48 w-full" />
      <Pulse className="h-40 w-full" />
    </div>
  );
}
