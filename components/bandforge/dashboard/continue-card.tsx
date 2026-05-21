import Link from "next/link";
import type { DashboardInProgressAttempt } from "@/components/bandforge/dashboard/types";
import { MODULE_LABELS } from "@/components/bandforge/dashboard/types";
import {
  ArrowRightIcon,
  HeadphonesIcon,
  BookIcon,
  PencilIcon,
  MicIcon,
} from "@/components/bandforge/dashboard/icons";
import { Waveform } from "@/components/bandforge/dashboard/waveform";

function moduleIcon(module: string) {
  switch (module) {
    case "listening":
      return HeadphonesIcon;
    case "reading":
      return BookIcon;
    case "writing":
      return PencilIcon;
    case "speaking":
      return MicIcon;
    default:
      return HeadphonesIcon;
  }
}

function resumeHref(attempt: DashboardInProgressAttempt): string | null {
  switch (attempt.module) {
    case "listening":
      return `/mock/${attempt.mock_test.id}/listening`;
    case "reading":
      return `/mock/${attempt.mock_test.id}/reading`;
    default:
      return null;
  }
}

function formatStarted(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContinueCard({
  attempts,
}: {
  attempts: DashboardInProgressAttempt[];
}) {
  if (attempts.length === 0) return null;

  const top = attempts[0];
  const Icon = moduleIcon(top.module);
  const href = resumeHref(top);
  const moduleLabel =
    MODULE_LABELS[top.module as keyof typeof MODULE_LABELS] ?? top.module;

  return (
    <section
      aria-label="Continue learning"
      className="bf-dash-enter relative overflow-hidden rounded-[28px] border border-[#06B6D4]/35 bg-gradient-to-br from-[#06B6D4]/12 via-white/80 to-white/90 p-1 shadow-[0_0_48px_rgba(6,182,212,0.15)]"
      style={{ animationDelay: "120ms" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.25),transparent_50%)]" />
      <div className="relative flex flex-col gap-5 rounded-[26px] bg-white/50 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#06B6D4] text-white shadow-[0_8px_24px_rgba(6,182,212,0.45)]">
            <Icon className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F172A] text-[9px] font-bold text-white">
              ●
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
              Continue now
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              {moduleLabel} mock
            </h2>
            <p className="mt-1 truncate text-[14px] font-medium text-[#0F172A]/65">
              {top.mock_test.title}
            </p>
            <p className="mt-2 text-[12px] text-[#0F172A]/45">
              Started {formatStarted(top.started_at)} · ~15 min left
            </p>
            <div className="mt-4 max-w-xs">
              <Waveform active />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {attempts.length > 1 ? (
            <span className="self-center rounded-full border border-[#0F172A]/10 bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#0F172A]/55 sm:self-end">
              +{attempts.length - 1} more in progress
            </span>
          ) : null}
          {href ? (
            <Link
              href={href}
              className="bf-dash-glow inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#06B6D4] px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:brightness-105"
            >
              Continue {moduleLabel}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          ) : (
            <span className="rounded-2xl border border-[#0F172A]/10 bg-white/80 px-6 py-3 text-sm font-semibold text-[#0F172A]/50">
              Resume coming soon
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
