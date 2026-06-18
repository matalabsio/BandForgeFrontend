import { BfEmptyState } from "@/components/bandforge/ui";
import type { ActivityDay } from "@/components/bandforge/dashboard/types";
import { cn } from "@/lib/utils";

const LEVELS = [
  "bg-ink/[0.06]",
  "bg-cyan/30",
  "bg-cyan/55",
  "bg-cyan/80",
  "bg-cyan",
] as const;

const ROW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function level(count: number): (typeof LEVELS)[number] {
  if (count <= 0) return LEVELS[0];
  if (count === 1) return LEVELS[1];
  if (count === 2) return LEVELS[2];
  if (count === 3) return LEVELS[3];
  return LEVELS[4];
}

function parseDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** GitHub-style grid: each column is a week, each row is Sun–Sat. */
export function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  if (days.length === 0) {
    return (
      <BfEmptyState
        variant="no-tests"
        title="No activity yet"
        description="Complete a mock to start your activity streak."
        actionLabel="Take a mock"
        actionHref="/test"
        className="border-0 bg-transparent p-4 shadow-none"
      />
    );
  }

  const byDate = new Map(days.map((d) => [d.date, d.count]));
  const start = parseDay(days[0].date);
  const end = parseDay(days[days.length - 1].date);

  const startSunday = new Date(start);
  startSunday.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const weeks: { date: string; count: number }[][] = [];
  const cursor = new Date(startSunday);

  while (cursor <= end) {
    const week: { date: string; count: number }[] = [];
    for (let row = 0; row < 7; row++) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      week.push({
        date: key,
        count: cursor >= start && cursor <= end ? byDate.get(key) ?? 0 : 0,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels: string[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstInRange = week.find(
      (cell) => cell.date && parseDay(cell.date) >= start,
    );
    if (!firstInRange) return;
    const m = parseDay(firstInRange.date).getUTCMonth();
    if (m !== lastMonth) {
      monthLabels[wi] = parseDay(firstInRange.date).toLocaleString("en-GB", {
        month: "short",
        timeZone: "UTC",
      });
      lastMonth = m;
    }
  });

  return (
    <div className="w-full overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
      <div className="inline-flex min-w-0 flex-col gap-2">
        <div className="flex gap-[3px] pl-9">
          {weeks.map((_, wi) => (
            <span
              key={`m-${wi}`}
              className="w-[12px] shrink-0 text-[9px] font-medium leading-none text-ink/35"
            >
              {monthLabels[wi] ?? ""}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex w-7 flex-col justify-between py-[2px] text-[9px] font-medium leading-none text-ink/35">
            {ROW_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, ri) => {
                  const inRange =
                    parseDay(cell.date) >= start &&
                    parseDay(cell.date) <= end;
                  return (
                    <div
                      key={`${wi}-${ri}`}
                      title={
                        inRange && cell.count > 0
                          ? `${cell.date}: ${cell.count} completed mock${cell.count === 1 ? "" : "s"}`
                          : inRange
                            ? `${cell.date}: no activity`
                            : undefined
                      }
                      className={cn(
                        "h-[12px] w-[12px] rounded-[2px]",
                        inRange ? level(cell.count) : "bg-transparent",
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-ink/40">
          <span>Less</span>
          {LEVELS.map((c, i) => (
            <div key={i} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
