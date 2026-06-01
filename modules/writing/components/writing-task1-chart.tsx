"use client";

type ChartSeries = { mode: string; values: number[] };

export type WritingChartSpec = {
  type?: string;
  title?: string;
  source?: string;
  cities: string[];
  series: ChartSeries[];
};

const SERIES_COLORS = [
  "bg-[#1e3a5f]",
  "bg-teal",
  "bg-amber-500",
  "bg-gray-300",
];

type Props = {
  chart: WritingChartSpec;
};

/** Grouped bar chart for Task 1 when options.chart is present (no image_url yet). */
export function WritingTask1Chart({ chart }: Props) {
  const maxVal = Math.max(
    1,
    ...chart.series.flatMap((s) => s.values),
  );

  return (
    <figure className="mt-4 rounded-lg border border-border bg-white p-4">
      {chart.title ? (
        <figcaption className="text-center text-[12px] font-semibold text-navy">
          {chart.title}
        </figcaption>
      ) : null}
      <div className="mt-3 flex items-end justify-center gap-4 overflow-x-auto pb-2">
        {chart.cities.map((city, cityIdx) => (
          <div key={city} className="flex min-w-[4.5rem] flex-col items-center gap-1">
            <div className="flex h-36 w-full items-end justify-center gap-0.5">
              {chart.series.map((s, sIdx) => {
                const v = s.values[cityIdx] ?? 0;
                const h = `${Math.round((v / maxVal) * 100)}%`;
                return (
                  <div
                    key={s.mode}
                    title={`${s.mode}: ${v}%`}
                    className={`w-3 rounded-t-sm ${SERIES_COLORS[sIdx % SERIES_COLORS.length]}`}
                    style={{ height: h }}
                  />
                );
              })}
            </div>
            <span className="text-[10px] font-medium text-ink/70">{city}</span>
          </div>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-ink/65">
        {chart.series.map((s, i) => (
          <li key={s.mode} className="flex items-center gap-1">
            <span
              className={`inline-block size-2.5 rounded-sm ${SERIES_COLORS[i % SERIES_COLORS.length]}`}
            />
            {s.mode}
          </li>
        ))}
      </ul>
      {chart.source ? (
        <p className="mt-2 text-center text-[10px] text-ink/45">Source: {chart.source}</p>
      ) : null}
    </figure>
  );
}
