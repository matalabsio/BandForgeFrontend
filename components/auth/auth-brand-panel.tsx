import {
  BookIcon,
  ChartIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";

const modules = [
  { label: "Listening", icon: HeadphonesIcon },
  { label: "Reading", icon: BookIcon },
  { label: "Writing", icon: PencilIcon },
  { label: "Speaking", icon: MicIcon },
] as const;

const proofPoints = [
  { value: "1,800+", label: "practice questions" },
  { value: "Instant", label: "band scoring" },
  { value: "4 modules", label: "exam skills" },
] as const;

export function AuthBrandPanel() {
  return (
    <aside
      className="relative flex flex-col justify-between overflow-hidden bg-navy px-6 py-8 text-white sm:px-8 sm:py-10 lg:min-h-dvh lg:px-10 lg:py-12"
      aria-label="BandForge brand"
    >
      <div
        className="pointer-events-none absolute inset-0 bf-grid-bg opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-teal/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 -translate-x-1/3 translate-y-1/3 rounded-full bg-teal-light/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="inline-flex rounded-2xl bg-white px-4 py-2.5 shadow-[0_16px_40px_-24px_rgb(0_0_0_/_0.45)]">
          <BandForgeLogoLink href="/" size="lg" priority />
        </div>

        <p className="mt-8 font-roboto-condensed text-xs font-bold tracking-[0.22em] text-teal-light uppercase sm:text-sm">
          AI-first IELTS preparation
        </p>
        <h2 className="mt-4 max-w-md font-bitter text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.65rem]">
          Prepare smarter.
          <span className="mt-1 block text-teal-light">Score higher.</span>
        </h2>
        <p className="mt-4 max-w-sm font-lora text-sm leading-relaxed text-white/72 sm:text-base">
          Realistic mocks, instant Reading and Listening scores, and AI feedback
          for Writing and Speaking — all in one place.
        </p>

        <ul className="mt-8 flex flex-wrap gap-2.5">
          {modules.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-meta font-semibold text-white/90 backdrop-blur-sm"
            >
              <Icon className="size-4 shrink-0 text-teal-light" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-10 lg:mt-0">
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {proofPoints.map((point) => (
            <li
              key={point.label}
              className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3.5 backdrop-blur-sm"
            >
              <p className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                {point.value}
              </p>
              <p className="mt-0.5 text-meta font-semibold uppercase tracking-wider text-teal-light/90">
                {point.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm">
          <ChartIcon className="mt-0.5 size-5 shrink-0 text-teal-light" />
          <p className="text-body leading-relaxed text-white/75">
            Track your progress across every module and see where to focus next.
          </p>
        </div>
      </div>
    </aside>
  );
}
