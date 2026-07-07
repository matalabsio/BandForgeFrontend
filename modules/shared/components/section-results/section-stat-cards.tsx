type Stat = {
  value: string;
  label: string;
};

type Props = {
  stats: Stat[];
};

export function SectionStatCards({ stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <div
      className={`grid w-full gap-3.5 sm:gap-4 ${
        stats.length === 1 ? "max-w-xs" : "grid-cols-2"
      }`}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[14px] border border-border bg-[rgb(13_31_60/0.04)] px-4 py-4 text-center sm:rounded-2xl sm:px-5 sm:py-5"
        >
          <div className="font-mono text-[28px] font-medium leading-none text-navy sm:text-[32px] lg:text-4xl">
            {stat.value}
          </div>
          <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#7689A0] sm:text-[11px]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
