import { BfAutoMarquee } from "@/components/bandforge/bf-auto-marquee";

const proofItems = [
  { title: "5.5 → 7", sub: "Typical learner trajectory with structured mocks" },
  { title: "AI + human", sub: "Speaking reviewed for nuance, not just scores" },
  { title: "PWA-ready", sub: "Install on Android — practice offline-first where supported" },
  { title: "Exam-faithful", sub: "Strict timing, authentic navigation, zero gimmicks" },
  { title: "Instant R&L", sub: "Objective scoring the moment you submit" },
  { title: "Telugu-friendly", sub: "Support and copy tuned for Indian test takers" },
] as const;

const countryItems = [
  { country: "Canada", flag: "canada", sub: "IELTS for study + PR pathways" },
  { country: "United Kingdom", flag: "uk", sub: "IELTS for university + visas" },
  { country: "Australia", flag: "australia", sub: "IELTS for study + migration" },
  { country: "New Zealand", flag: "newzealand", sub: "IELTS for study + migration" },
  { country: "USA", flag: "usa", sub: "IELTS accepted by many universities" },
  { country: "Ireland", flag: "ireland", sub: "IELTS for study pathways" },
  { country: "Germany", flag: "germany", sub: "IELTS accepted by many institutions" },
  { country: "France", flag: "france", sub: "IELTS for international programs" },
  { country: "Netherlands", flag: "netherlands", sub: "IELTS for English-taught degrees" },
  { country: "Singapore", flag: "singapore", sub: "IELTS for university admissions" },
  { country: "UAE", flag: "uae", sub: "IELTS for study + work pathways" },
  { country: "Japan", flag: "japan", sub: "IELTS for global university tracks" },
  { country: "South Korea", flag: "southkorea", sub: "IELTS for English-taught programs" },
  { country: "Malta", flag: "malta", sub: "IELTS for study + visa pathways" },
  { country: "Italy", flag: "italy", sub: "IELTS for international programs" },
] as const;

type FlagCode = (typeof countryItems)[number]["flag"];

function FlagMark({ code }: { code: FlagCode }) {
  const base =
    "relative h-6 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-white shadow-[var(--shadow-soft)]";

  if (code === "canada") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-y-0 left-0 w-1/4 bg-red-600" />
        <span className="absolute inset-y-0 right-0 w-1/4 bg-red-600" />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-red-600" />
      </span>
    );
  }

  if (code === "uk") {
    return (
      <span className={`${base} bg-[#123274]`} aria-hidden>
        <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-white" />
        <span className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-white" />
        <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-red-600" />
        <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-red-600" />
      </span>
    );
  }

  if (code === "australia" || code === "newzealand") {
    return (
      <span className={`${base} bg-[#123274]`} aria-hidden>
        <span className="absolute left-1 top-1 h-2 w-3 rounded-sm bg-white/90" />
        <span className="absolute right-1.5 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
        <span className="absolute bottom-1.5 right-3 h-1 w-1 rounded-full bg-white" />
        <span className="absolute bottom-1 left-4 h-1.5 w-1.5 rounded-full bg-white" />
      </span>
    );
  }

  if (code === "usa") {
    return (
      <span className={base} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-0 h-0.5 w-full bg-red-600"
            style={{ top: `${i * 4}px` }}
          />
        ))}
        <span className="absolute left-0 top-0 h-3.5 w-4 bg-[#123274]" />
      </span>
    );
  }

  if (code === "germany") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-x-0 top-0 h-1/3 bg-black" />
        <span className="absolute inset-x-0 top-1/3 h-1/3 bg-red-600" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-amber-400" />
      </span>
    );
  }

  if (code === "france") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-y-0 left-0 w-1/3 bg-[#123274]" />
        <span className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
        <span className="absolute inset-y-0 right-0 w-1/3 bg-red-600" />
      </span>
    );
  }

  if (code === "netherlands") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-x-0 top-0 h-1/3 bg-red-600" />
        <span className="absolute inset-x-0 top-1/3 h-1/3 bg-white" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[#123274]" />
      </span>
    );
  }

  if (code === "singapore") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-x-0 top-0 h-1/2 bg-red-600" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
        <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-white" />
        <span className="absolute left-2.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />
      </span>
    );
  }

  if (code === "uae") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-y-0 left-0 w-1/4 bg-red-600" />
        <span className="absolute inset-x-0 left-1/4 top-0 h-1/3 bg-emerald-600" />
        <span className="absolute inset-x-0 left-1/4 top-1/3 h-1/3 bg-white" />
        <span className="absolute inset-x-0 bottom-0 left-1/4 h-1/3 bg-black" />
      </span>
    );
  }

  if (code === "japan") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600" />
      </span>
    );
  }

  if (code === "southkorea") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500" />
        <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-b-full bg-blue-600" />
        <span className="absolute left-1 top-1 h-0.5 w-2 rotate-45 bg-black" />
        <span className="absolute bottom-1 right-1 h-0.5 w-2 rotate-45 bg-black" />
      </span>
    );
  }

  if (code === "malta") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-y-0 left-0 w-1/2 bg-white" />
        <span className="absolute inset-y-0 right-0 w-1/2 bg-red-600" />
        <span className="absolute left-1 top-1 h-1.5 w-1.5 border border-ink/40" />
      </span>
    );
  }

  if (code === "italy") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-y-0 left-0 w-1/3 bg-emerald-600" />
        <span className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
        <span className="absolute inset-y-0 right-0 w-1/3 bg-red-600" />
      </span>
    );
  }

  return (
    <span className={base} aria-hidden>
      <span className="absolute inset-y-0 left-0 w-1/3 bg-emerald-600" />
      <span className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
      <span className="absolute inset-y-0 right-0 w-1/3 bg-orange-500" />
    </span>
  );
}

export function BandForgeTrust() {
  const proofLoop = [...proofItems, ...proofItems];
  const countryLoop = [...countryItems, ...countryItems];

  return (
    <section
      id="trust"
      className="scroll-mt-20 border-b border-border/70 bg-white/45 py-6 backdrop-blur sm:py-8"
    >
      <BfAutoMarquee aria-label="BandForge proof points" speed={24}>
        <ul className="bf-marquee-track gap-4 pr-4">
          {proofLoop.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="bf-min-card flex min-w-[200px] shrink-0 flex-col justify-center px-5 py-4 sm:min-w-[260px]"
            >
              <p className="text-h4 font-bold tracking-tight text-navy">
                {item.title}
              </p>
              <p className="mt-1.5 text-meta leading-snug text-ink/60">
                {item.sub}
              </p>
            </li>
          ))}
        </ul>
      </BfAutoMarquee>

      <BfAutoMarquee
        aria-label="IELTS destination countries"
        className="mt-4"
        speed={18}
      >
        <ul className="bf-marquee-track gap-4 pr-4">
          {countryLoop.map((item, index) => (
            <li
              key={`${item.country}-${index}`}
              className="bf-min-card flex min-w-[230px] shrink-0 flex-col justify-center px-5 py-4 sm:min-w-[290px]"
            >
              <div className="flex items-center gap-3">
                <FlagMark code={item.flag} />
                <p className="text-h4 font-bold tracking-tight text-navy">
                  {item.country}
                </p>
              </div>
              <p className="mt-2 text-meta leading-snug text-ink/60">
                {item.sub}
              </p>
            </li>
          ))}
        </ul>
      </BfAutoMarquee>
    </section>
  );
}
