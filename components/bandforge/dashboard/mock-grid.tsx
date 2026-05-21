import Link from "next/link";
import type {
  DashboardModule,
  MockTestSummary,
} from "@/components/bandforge/dashboard/types";
import {
  MODULE_AVAILABILITY,
  MODULE_LABELS,
} from "@/components/bandforge/dashboard/types";
import {
  ArrowRightIcon,
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
  PlayIcon,
} from "@/components/bandforge/dashboard/icons";
import { Waveform } from "@/components/bandforge/dashboard/waveform";

const MODULE_ORDER: DashboardModule[] = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

const MODULE_ICONS: Record<DashboardModule, typeof HeadphonesIcon> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

const MODULE_GRADIENT: Record<DashboardModule, string> = {
  listening: "from-[#06B6D4]/30 via-[#0891B2]/20 to-[#0F172A]/5",
  reading: "from-violet-400/25 via-violet-300/10 to-[#0F172A]/5",
  writing: "from-amber-400/25 via-amber-300/10 to-[#0F172A]/5",
  speaking: "from-rose-400/25 via-rose-300/10 to-[#0F172A]/5",
};

function moduleHref(testId: string, module: DashboardModule): string | null {
  if (module === "listening") return `/mock/${testId}/listening`;
  if (module === "reading") return `/mock/${testId}/reading`;
  return null;
}

export function MockGrid({ mocks }: { mocks: MockTestSummary[] }) {
  return (
    <section aria-label="Skill modules" className="bf-dash-enter space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#06B6D4]">
            Skill modules
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A]">
            IELTS mock library
          </h2>
          <p className="mt-1 text-[13px] text-[#0F172A]/55">
            Immersive simulations — Listening is live with single-play audio.
          </p>
        </div>
        <span className="rounded-full border border-[#06B6D4]/20 bg-[#06B6D4]/8 px-3 py-1 text-[11px] font-bold text-[#0891B2]">
          {mocks.length} mocks
        </span>
      </header>

      {mocks.length === 0 ? (
        <EmptyMocks />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {mocks.map((m, i) => (
            <MockCard key={m.id} mock={m} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function MockCard({ mock, index }: { mock: MockTestSummary; index: number }) {
  const listeningHref = moduleHref(mock.id, "listening");

  return (
    <article
      className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/65 shadow-[0_10px_36px_rgba(15,23,42,0.07)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#06B6D4]/30 hover:shadow-[0_16px_48px_rgba(6,182,212,0.14)]"
      style={{ animationDelay: `${260 + index * 50}ms` }}
    >
      <div
        className={`relative h-28 bg-gradient-to-br ${MODULE_GRADIENT.listening} px-5 pt-5`}
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A]/55">
            Full mock
          </span>
          <span className="rounded-full bg-[#0F172A]/80 px-2 py-0.5 text-[10px] font-semibold text-white">
            Band 5–9
          </span>
        </div>
        <div className="absolute bottom-3 left-5 right-5">
          <Waveform />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-[#0F172A]">
          {mock.title}
        </h3>
        {mock.description ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#0F172A]/55">
            {mock.description}
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Meta label="Duration" value="~90m" />
          <Meta label="Listening" value="30m" />
          <Meta label="Questions" value="20+" />
        </dl>

        <ul className="mt-4 grid grid-cols-2 gap-2">
          {MODULE_ORDER.map((mod) => {
            const Icon = MODULE_ICONS[mod];
            const live = MODULE_AVAILABILITY[mod] === "live";
            const href = live ? moduleHref(mock.id, mod) : null;
            const cell = (
              <span
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition-all ${
                  live
                    ? "cursor-pointer border-[#0F172A]/8 bg-[#0F172A]/[0.02] hover:border-[#06B6D4]/35 hover:bg-[#06B6D4]/8"
                    : "border-dashed border-[#0F172A]/10 text-[#0F172A]/35"
                }`}
              >
                <Icon className="h-4 w-4 text-[#06B6D4]" />
                <span className="flex-1 truncate text-left">
                  {MODULE_LABELS[mod]}
                </span>
                {live ? (
                  <PlayIcon className="h-3.5 w-3.5 text-[#06B6D4]" />
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                    soon
                  </span>
                )}
              </span>
            );
            return (
              <li key={mod}>
                {href ? (
                  <Link href={href} className="block">
                    {cell}
                  </Link>
                ) : (
                  cell
                )}
              </li>
            );
          })}
        </ul>

        {listeningHref ? (
          <Link
            href={listeningHref}
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0F172A] py-3 text-[13px] font-bold text-white transition-all group-hover:bg-[#06B6D4]"
          >
            Start listening
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#0F172A]/[0.03] px-2 py-2">
      <dt className="text-[9px] font-bold uppercase tracking-wider text-[#0F172A]/40">
        {label}
      </dt>
      <dd className="text-[13px] font-bold tabular-nums text-[#0F172A]">
        {value}
      </dd>
    </div>
  );
}

function EmptyMocks() {
  return (
    <div className="rounded-[24px] border border-dashed border-[#06B6D4]/30 bg-white/60 px-8 py-14 text-center backdrop-blur-sm">
      <HeadphonesIcon className="mx-auto h-10 w-10 text-[#06B6D4]" />
      <p className="mt-4 font-display text-xl font-bold text-[#0F172A]">
        No mocks available yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-[#0F172A]/55">
        Sign in and run the listening seed in Supabase, or check that the API is
        running on port 8000.
      </p>
    </div>
  );
}
