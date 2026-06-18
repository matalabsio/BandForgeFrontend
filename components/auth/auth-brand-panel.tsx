import { BfBrandBars } from "@/components/bandforge/bf-brand-bars";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";

const modules = [
  { label: "Listening", icon: HeadphonesIcon },
  { label: "Reading", icon: BookIcon },
  { label: "Writing", icon: PencilIcon },
  { label: "Speaking", icon: MicIcon },
] as const;

const proofPoints = [
  { value: "10,000+", label: "practice questions" },
  { value: "Instant", label: "band scoring" },
  { value: "4 modules", label: "exam skills" },
] as const;

export function AuthBrandPanel() {
  return (
    <aside
      className="relative flex flex-col justify-between overflow-hidden bg-navy bg-[radial-gradient(420px_280px_at_20%_100%,rgb(0_151_167/0.26),transparent_70%)] px-6 py-8 text-white sm:px-8 sm:py-10 lg:min-h-dvh lg:px-10 lg:py-12"
      aria-label="BandForge brand"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <BfBrandBars size="lg" />
          <span className="font-display text-[1.375rem] font-bold tracking-tight">
            <span className="text-white">Band</span>
            <span className="text-cyan">Forge</span>
          </span>
        </div>

        <p className="mt-8 font-mono text-xs tracking-[0.16em] text-cyan uppercase">
          IELTS preparation
        </p>
        <h2 className="font-display mt-4 max-w-md text-3xl leading-[1.08] font-bold tracking-[-0.03em] sm:text-4xl">
          Let&apos;s set up your study plan.
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate sm:text-base">
          Realistic mocks, instant Reading and Listening scores, and AI feedback
          for Writing and Speaking — all in one place.
        </p>

        <ul className="mt-8 flex flex-wrap gap-2.5">
          {modules.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm"
            >
              <Icon className="size-4 shrink-0 text-cyan" />
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
              <p className="mt-0.5 font-mono text-[0.6875rem] tracking-wider text-slate uppercase">
                {point.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
