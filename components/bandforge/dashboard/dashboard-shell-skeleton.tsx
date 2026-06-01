/** Loading placeholder for dashboard and profile RSC routes. */
export function DashboardContentSkeleton() {
  return (
    <div className="bf-dash-enter mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[#0F172A]/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-[20px] bg-[#0F172A]/[0.06]"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[20px] bg-[#0F172A]/[0.06]" />
      <div className="h-40 animate-pulse rounded-[20px] bg-[#0F172A]/[0.06]" />
    </div>
  );
}
