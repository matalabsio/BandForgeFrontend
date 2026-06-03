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
}: {
  onReadyChange: (ready: boolean) => void;
  className?: string;
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

  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--exam-border)] bg-[var(--exam-surface,#f8fafc)] p-4 sm:p-5",
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
      <h2 className="mt-1 text-[15px] font-bold text-[var(--exam-ink)] sm:text-base">
        Hardware & environment check
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--exam-ink-muted)]">
        Confirm each item below. You cannot begin until every box is checked.
      </p>

      <ul className="mt-4 space-y-2.5">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-1 py-1.5 text-[13px] leading-snug text-[var(--exam-ink)] transition-colors hover:border-[var(--exam-border)] hover:bg-white/80">
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
        <p className="mt-3 text-[11px] font-medium text-[var(--exam-ink-muted)]">
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
