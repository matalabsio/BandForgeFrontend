"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type StreakActivityDay = { date: string; count: number };

const LEVELS = [
  "bg-ink/[0.07]",
  "bg-teal/25",
  "bg-teal/50",
  "bg-teal/75",
  "bg-teal",
] as const;

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalIso(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00`);
}

function todayLocal(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

/** 0 = Sunday, 1 = Monday — follows the user's locale calendar when possible. */
function localeWeekStartsOn(): 0 | 1 {
  try {
    const info = (
      new Intl.Locale(navigator.language) as Intl.Locale & {
        weekInfo?: { firstDay?: number };
      }
    ).weekInfo;
    if (info?.firstDay === 7) return 0;
    if (info?.firstDay === 1) return 1;
  } catch {
    /* ignore */
  }
  return 1;
}

function startOfWeek(d: Date, weekStartsOn: 0 | 1): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? 6 : day - 1) : day;
  x.setDate(x.getDate() - diff);
  return x;
}

function intensity(count: number): (typeof LEVELS)[number] {
  if (count <= 0) return LEVELS[0];
  if (count === 1) return LEVELS[1];
  if (count === 2) return LEVELS[2];
  if (count <= 4) return LEVELS[3];
  return LEVELS[4];
}

function formatLong(iso: string): string {
  return parseLocalIso(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShort(iso: string): string {
  return parseLocalIso(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

type Cell = {
  date: string;
  count: number;
  inRange: boolean;
  isToday: boolean;
  isExam: boolean;
  future: boolean;
};

type Props = {
  days: StreakActivityDay[];
  currentStreak?: number;
  prepStart?: string | null;
  examDate?: string | null;
};

export function StreakContributionCalendar({
  days,
  currentStreak = 0,
  prepStart = null,
  examDate = null,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setWeekStartsOn(localeWeekStartsOn());
  }, []);

  const todayIso = isoLocal(todayLocal());
  const examIso = examDate?.slice(0, 10) ?? null;
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of days) map.set(d.date.slice(0, 10), d.count || 0);
    return map;
  }, [days]);

  const { weeks, monthLabels, rowLabels, activeDays, cellClass, rowH, colW } =
    useMemo(() => {
      const today = todayLocal();
      const exam = examIso ? parseLocalIso(examIso) : today;
      const fromApi = days[0]?.date?.slice(0, 10);
      const toApi = days[days.length - 1]?.date?.slice(0, 10);
      const prep = parseLocalIso(
        (fromApi || prepStart?.slice(0, 10) || isoLocal(addDays(today, -55))),
      );
      const end = parseLocalIso(toApi || examIso || todayIso);
      const rangeStart = prep <= end ? prep : end;
      const rangeEnd = end;

      const firstStart = startOfWeek(rangeStart, weekStartsOn);
      const lastStart = startOfWeek(rangeEnd, weekStartsOn);
      const weekCount = Math.max(
        1,
        Math.round(
          (lastStart.getTime() - firstStart.getTime()) / (7 * 86_400_000),
        ) + 1,
      );

      const nextWeeks: Cell[][] = [];
      const cursor = new Date(firstStart);
      for (let w = 0; w < weekCount; w++) {
        const week: Cell[] = [];
        for (let r = 0; r < 7; r++) {
          const iso = isoLocal(cursor);
          const inRange = cursor >= rangeStart && cursor <= rangeEnd;
          week.push({
            date: iso,
            count: inRange ? (counts.get(iso) ?? 0) : 0,
            inRange,
            isToday: iso === todayIso,
            isExam: Boolean(examIso && iso === examIso),
            future: cursor > today,
          });
          cursor.setDate(cursor.getDate() + 1);
        }
        nextWeeks.push(week);
      }

      const labels: { week: number; name: string }[] = [];
      let lastMonth = -1;
      let lastLabelWeek = -3;
      nextWeeks.forEach((week, wi) => {
        const first = week.find((c) => c.inRange);
        if (!first) return;
        const month = parseLocalIso(first.date).getMonth();
        if (month !== lastMonth && wi - lastLabelWeek >= 2) {
          labels.push({
            week: wi,
            name: parseLocalIso(first.date).toLocaleDateString(undefined, {
              month: "short",
            }),
          });
          lastMonth = month;
          lastLabelWeek = wi;
        }
      });

      const names = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2024, 0, weekStartsOn === 1 ? 1 + i : i);
        return d.toLocaleDateString(undefined, { weekday: "short" });
      });

      const active = nextWeeks
        .flat()
        .filter((c) => c.inRange && !c.future && c.count > 0).length;

      const compact = weekCount > 16;
      return {
        weeks: nextWeeks,
        monthLabels: labels,
        rowLabels: names,
        activeDays: active,
        cellClass: compact
          ? "size-[12px] sm:size-[13px]"
          : "size-[15px] sm:size-4",
        rowH: compact ? "h-[12px] sm:h-[13px]" : "h-[15px] sm:h-4",
        colW: compact ? "w-[12px] sm:w-[13px]" : "w-[15px] sm:w-4",
      };
    }, [counts, days, examIso, prepStart, todayIso, weekStartsOn]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayCol = el.querySelector<HTMLElement>('[data-today-col="1"]');
    if (todayCol) {
      todayCol.scrollIntoView({ inline: "center", block: "nearest" });
      return;
    }
    el.scrollLeft = el.scrollWidth;
  }, [weeks]);

  const selectedCell =
    weeks.flat().find((c) => c.date === selected && c.inRange) ??
    weeks.flat().find((c) => c.isToday && c.inRange) ??
    null;

  return (
    <div className="min-w-0">
      <div
        ref={scrollRef}
        className="w-full max-w-full overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
      >
        <div className="inline-flex min-w-max flex-col gap-1.5 pr-1">
          <div className="flex gap-[3px] pl-8 sm:pl-9">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.week === wi);
              return (
                <span
                  key={`m-${wi}`}
                  className={cn("relative h-3 shrink-0", colW)}
                >
                  {label ? (
                    <span className="absolute left-0 top-0 whitespace-nowrap text-[9px] font-medium leading-none text-muted-light sm:text-[10px]">
                      {label.name}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <div
              className="flex w-7 shrink-0 flex-col gap-[3px] text-[9px] font-medium leading-none text-muted-light sm:w-8 sm:text-[10px]"
              aria-hidden
            >
              {rowLabels.map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    "flex items-center",
                    rowH,
                    i % 2 === 1 && "invisible",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="flex gap-[3px]"
              role="grid"
              aria-label={
                examIso
                  ? `Prep activity through exam on ${formatLong(examIso)}`
                  : "Prep activity calendar"
              }
            >
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="flex flex-col gap-[3px]"
                  role="row"
                  data-today-col={week.some((c) => c.isToday) ? "1" : undefined}
                >
                  {week.map((cell) => {
                    const isSelected = selectedCell?.date === cell.date;
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        role="gridcell"
                        disabled={!cell.inRange}
                        aria-current={cell.isToday ? "date" : undefined}
                        aria-pressed={isSelected}
                        aria-label={
                          !cell.inRange
                            ? `${formatLong(cell.date)}, outside prep`
                            : cell.isExam
                              ? `${formatLong(cell.date)}, exam day${cell.count ? `, ${cell.count} activities` : ""}`
                              : cell.future
                                ? `${formatLong(cell.date)}, upcoming`
                                : cell.count > 0
                                  ? `${formatLong(cell.date)}, ${cell.count} activit${cell.count === 1 ? "y" : "ies"}`
                                  : `${formatLong(cell.date)}, no activity`
                        }
                        onClick={() => {
                          if (cell.inRange) setSelected(cell.date);
                        }}
                        className={cn(
                          "shrink-0 rounded-[3px]",
                          cellClass,
                          !cell.inRange && "cursor-default bg-transparent",
                          cell.inRange &&
                            !cell.future &&
                            cn(
                              intensity(cell.count),
                              "cursor-pointer transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan",
                            ),
                          cell.inRange &&
                            cell.future &&
                            "cursor-pointer bg-ink/[0.04] ring-1 ring-inset ring-ink/10",
                          cell.isToday &&
                            cell.inRange &&
                            "ring-1 ring-navy ring-offset-1 ring-offset-white",
                          cell.isExam &&
                            "ring-1 ring-cyan ring-offset-1 ring-offset-white",
                          isSelected &&
                            "ring-1 ring-teal ring-offset-1 ring-offset-white",
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-5 text-[12px] text-muted">
          {selectedCell ? (
            <>
              <span className="font-semibold text-ink">
                {formatLong(selectedCell.date)}
              </span>
              {selectedCell.isExam ? " · Exam day" : ""}
              {" · "}
              {selectedCell.future
                ? "Upcoming"
                : selectedCell.count > 0
                  ? `${selectedCell.count} activit${selectedCell.count === 1 ? "y" : "ies"}`
                  : selectedCell.isToday
                    ? "Today — practice to keep your streak"
                    : "No activity"}
              {selectedCell.isToday && currentStreak > 0
                ? ` · ${currentStreak}-day streak`
                : ""}
            </>
          ) : examIso ? (
            <>
              {activeDays} active day{activeDays === 1 ? "" : "s"} · exam{" "}
              {formatShort(examIso)}
            </>
          ) : (
            <>
              {activeDays} active day{activeDays === 1 ? "" : "s"} this prep
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-light">
          <span>Less</span>
          {LEVELS.map((c) => (
            <span key={c} className={cn("size-2.5 rounded-[2px]", c)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
