"use client";

import {
  DIAGNOSTIC_GOAL_OPTIONS,
  goalFromId,
  normalizeIndiaPhone,
  type DiagnosticGoalId,
  type DiagnosticLead,
} from "@/lib/diagnostic-lead";
import { cn } from "@/lib/utils";

type Props = {
  value: Partial<DiagnosticLead>;
  onChange: (lead: Partial<DiagnosticLead>) => void;
  className?: string;
};

export function DiagnosticLeadForm({ value, onChange, className }: Props) {
  const setField = <K extends keyof DiagnosticLead>(key: K, field: DiagnosticLead[K]) => {
    onChange({ ...value, [key]: field });
  };

  const handleGoalChange = (goalId: DiagnosticGoalId) => {
    const goal = goalFromId(goalId);
    onChange({
      ...value,
      goal: goal.id,
      goalLabel: goal.label,
      targetBand: goal.targetBand,
    });
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div>
        <label
          htmlFor="diagnostic-lead-name"
          className="mb-1.5 block text-xs font-medium text-[#5A6B82]"
        >
          Full name
        </label>
        <input
          id="diagnostic-lead-name"
          type="text"
          value={value.fullName ?? ""}
          onChange={(e) => setField("fullName", e.target.value)}
          placeholder="Your full name"
          className="h-[46px] w-full rounded-[11px] border border-[#D9E0E8] bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-[#9AA7B8] focus:border-cyan focus:ring-2 focus:ring-cyan/20"
        />
      </div>

      <div>
        <label
          htmlFor="diagnostic-lead-phone"
          className="mb-1.5 block text-xs font-medium text-[#5A6B82]"
        >
          WhatsApp number
        </label>
        <div className="flex h-[46px] items-center gap-2.5 rounded-[11px] border border-[#D9E0E8] bg-white px-3.5">
          <span className="inline-flex items-center gap-1.5 border-r border-[#E6EBF1] pr-2.5 text-sm font-medium text-navy">
            <WhatsAppIcon />
            +91
          </span>
          <input
            id="diagnostic-lead-phone"
            type="tel"
            inputMode="numeric"
            value={value.phone ?? ""}
            onChange={(e) => setField("phone", normalizeIndiaPhone(e.target.value))}
            placeholder="98765 43210"
            maxLength={10}
            className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-[#9AA7B8]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="diagnostic-lead-goal"
          className="mb-1.5 block text-xs font-medium text-[#5A6B82]"
        >
          I&apos;m preparing for
        </label>
        <div className="relative">
          <select
            id="diagnostic-lead-goal"
            value={value.goal ?? ""}
            onChange={(e) => handleGoalChange(e.target.value as DiagnosticGoalId)}
            className={cn(
              "h-[46px] w-full cursor-pointer appearance-none rounded-[11px] border border-[#D9E0E8] bg-white px-3.5 text-sm outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/20",
              value.goal ? "text-navy" : "text-[#9AA7B8]",
            )}
          >
            <option value="" disabled>
              Select your goal
            </option>
            {DIAGNOSTIC_GOAL_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-[18px] -translate-y-1/2 text-[#7689A0]" />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {DIAGNOSTIC_GOAL_OPTIONS.map((g) => {
            const selected = value.goal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGoalChange(g.id)}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  selected
                    ? "border border-cyan/30 bg-cyan/10 text-teal"
                    : "bg-[#F1F5F9] text-[#5A6B82] hover:bg-[#E8EDF3]",
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.6-.6-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.6.1.3.7 1.1 1.5 1.7 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.5-.1 1z" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
