"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { minExamDateIso, parseExamDate } from "@/lib/diagnostic-lead";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  const d = parseExamDate(iso);
  if (!d) return "Select date";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCells(view: Date): (Date | null)[] {
  const first = startOfMonth(view);
  const startPad = first.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Props = {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  className?: string;
};

export function ExamDatePicker({
  value,
  onChange,
  min = minExamDateIso(),
  className,
}: Props) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseExamDate(value);
  const minDate = parseExamDate(min) ?? new Date();
  const [view, setView] = useState(() =>
    startOfMonth(selected ?? minDate),
  );

  useEffect(() => {
    if (selected) setView(startOfMonth(selected));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps -- sync month when value changes

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells = buildCells(view);
  const monthLabel = view.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-[9px] border border-[#CFE6E9] bg-white px-3 font-mono text-[15px] text-[#0D1F3C] outline-none transition-colors",
          "hover:border-cyan focus-visible:border-cyan focus-visible:ring-2 focus-visible:ring-cyan/20",
          open && "border-cyan ring-2 ring-cyan/20",
        )}
      >
        <span className={cn(!value && "text-[#9AA7B8]")}>
          {value ? formatDisplay(value) : "DD/MM/YYYY"}
        </span>
        <CalendarIcon className="size-4 text-cyan" aria-hidden />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Choose exam date"
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-[280px] overflow-hidden rounded-[14px] border border-[#D5DCE6] bg-white shadow-[0_16px_40px_rgba(13,31,60,0.16)]"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-3 py-2.5">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setView((v) => addMonths(v, -1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[#5A6B82] transition-colors hover:bg-[#F4F7FA] hover:text-navy"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="font-display text-[14px] font-semibold text-[#0D1F3C]">
              {monthLabel}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setView((v) => addMonths(v, 1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[#5A6B82] transition-colors hover:bg-[#F4F7FA] hover:text-navy"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-3 pt-2">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="py-1 text-center font-mono text-[11px] tracking-wide text-[#8A99AC]"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-3 pb-2">
            {cells.map((cell, idx) => {
              if (!cell) {
                return <span key={`empty-${idx}`} className="size-9" />;
              }
              const iso = toIso(cell);
              const disabled = cell < minDate;
              const isSelected = selected ? sameDay(cell, selected) : false;
              const isToday = sameDay(cell, today);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex size-9 cursor-pointer items-center justify-center rounded-[8px] font-mono text-[13px] transition-colors",
                    disabled && "cursor-not-allowed text-[#C3CDDA]",
                    !disabled && !isSelected && "text-[#0D1F3C] hover:bg-[#F0FAFB]",
                    isSelected && "bg-cyan font-semibold text-white shadow-[0_4px_12px_rgba(0,151,167,0.35)]",
                    isToday && !isSelected && "ring-1 ring-cyan/40",
                  )}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[#EEF2F6] px-3 py-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="cursor-pointer px-2 py-1 text-[13px] font-medium text-[#8A99AC] transition-colors hover:text-navy"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={today < minDate}
              onClick={() => {
                const iso = toIso(today < minDate ? minDate : today);
                onChange(iso);
                setView(startOfMonth(parseExamDate(iso) ?? today));
                setOpen(false);
              }}
              className="cursor-pointer px-2 py-1 text-[13px] font-semibold text-cyan transition-colors hover:text-[#008a99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
