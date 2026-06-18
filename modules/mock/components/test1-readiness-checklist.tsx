"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const CHECKLIST_ITEMS = [
  {
    id: "headphones",
    label: "My headphones are plugged in and audio is clear.",
  },
  {
    id: "internet",
    label: "My internet connection is stable.",
  },
  {
    id: "time",
    label: "I have 3 hours of uninterrupted time available.",
  },
  {
    id: "quiet",
    label: "I am in a quiet place with minimal distractions.",
  },
  {
    id: "power",
    label: "My device is charged or plugged in for the full session.",
  },
] as const;

type CheckId = (typeof CHECKLIST_ITEMS)[number]["id"];

export function Test1ReadinessChecklist({
  onReadyChange,
  className,
  variant = "default",
}: {
  onReadyChange: (ready: boolean) => void;
  className?: string;
  variant?: "default" | "dark";
}) {
  const [checked, setChecked] = useState<Record<CheckId, boolean>>({
    headphones: false,
    internet: false,
    time: false,
    quiet: false,
    power: false,
  });

  const allChecked = useMemo(
    () => CHECKLIST_ITEMS.every((item) => checked[item.id]),
    [checked],
  );

  useEffect(() => {
    onReadyChange(allChecked);
  }, [allChecked, onReadyChange]);

  const toggle = useCallback((id: CheckId, value: boolean) => {
    setChecked((prev) => ({ ...prev, [id]: value }));
  }, []);

  const isDark = variant === "dark";

  return (
    <section
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        isDark
          ? "border-white/10 bg-white/5"
          : "border-[var(--exam-border)] bg-[var(--exam-surface,#f8fafc)]",
        className,
      )}
      aria-labelledby="test1-readiness-heading"
    >
      <p
        id="test1-readiness-heading"
        className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--exam-accent)]"
      >
        Before you start
      </p>
      <h2
        className={cn(
          "mt-1 text-[15px] font-bold sm:text-base",
          isDark ? "text-white" : "text-[var(--exam-ink)]",
        )}
      >
        Hardware & environment check
      </h2>
      <p
        className={cn(
          "mt-1 text-[12px] leading-relaxed",
          isDark ? "text-white/70" : "text-[var(--exam-ink-muted)]",
        )}
      >
        Confirm each item below. You cannot begin until every box is checked.
      </p>

      <ul className="mt-4 space-y-2.5">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item.id}>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-1 py-1.5 text-[13px] leading-snug transition-colors",
                isDark
                  ? "text-white/90 hover:bg-white/5"
                  : "text-[var(--exam-ink)] hover:border-[var(--exam-border)] hover:bg-white/80",
              )}
            >
              <input
                type="checkbox"
                checked={checked[item.id]}
                onChange={(e) => toggle(item.id, e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--exam-accent)]"
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {!allChecked ? (
        <p
          className={cn(
            "mt-3 text-[11px] font-medium",
            isDark ? "text-white/60" : "text-[var(--exam-ink-muted)]",
          )}
        >
          {CHECKLIST_ITEMS.filter((item) => !checked[item.id]).length} item
          {CHECKLIST_ITEMS.filter((item) => !checked[item.id]).length === 1
            ? ""
            : "s"}{" "}
          remaining
        </p>
      ) : null}
    </section>
  );
}
