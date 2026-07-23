import Image from "next/image";
import { BfAutoMarquee } from "@/components/bandforge/bf-auto-marquee";
import { LISTENING_FLAG_IMAGES } from "@/modules/listening/listening-flags";

const proofItems = [
  { title: "5.5 → 7", sub: "Typical learner trajectory with structured mocks" },
  { title: "AI + human", sub: "Speaking reviewed for nuance, not just scores" },
  { title: "PWA-ready", sub: "Install on Android — faster launches and offline browsing" },
  { title: "Exam-faithful", sub: "Strict timing, authentic navigation, zero gimmicks" },
  { title: "Instant R&L", sub: "Objective scoring the moment you submit" },
  { title: "Telugu-friendly", sub: "Support and copy tuned for Indian test takers" },
] as const;

/** High-intent IELTS destinations only — keeps homepage HTML lean. */
const countryItems = [
  { country: "Canada", flag: "canada", sub: "IELTS for study + PR pathways" },
  { country: "United Kingdom", flag: "uk", sub: "IELTS for university + visas" },
  { country: "Australia", flag: "australia", sub: "IELTS for study + migration" },
  { country: "New Zealand", flag: "newzealand", sub: "IELTS for study + migration" },
  { country: "USA", flag: "usa", sub: "IELTS accepted by many universities" },
  { country: "Ireland", flag: "ireland", sub: "IELTS for study pathways" },
  { country: "Germany", flag: "germany", sub: "IELTS accepted by many institutions" },
  { country: "Singapore", flag: "singapore", sub: "IELTS for university admissions" },
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
        <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-red-600" />
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
    const src =
      code === "australia"
        ? LISTENING_FLAG_IMAGES.australia
        : LISTENING_FLAG_IMAGES.newzealand;
    return (
      <span
        className="relative h-7 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-white shadow-[var(--shadow-soft)]"
        aria-hidden
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="44px"
        />
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

  if (code === "singapore") {
    return (
      <span className={base} aria-hidden>
        <span className="absolute inset-x-0 top-0 h-1/2 bg-red-600" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
        <span className="absolute left-1.5 top-1.5 size-2 rounded-full bg-white" />
        <span className="absolute left-2.5 top-1.5 size-2 rounded-full bg-red-600" />
      </span>
    );
  }

  // Ireland (tricolour)
  return (
    <span className={base} aria-hidden>
      <span className="absolute inset-y-0 left-0 w-1/3 bg-emerald-600" />
      <span className="absolute inset-y-0 left-1/3 w-1/3 bg-white" />
      <span className="absolute inset-y-0 right-0 w-1/3 bg-orange-500" />
    </span>
  );
}

export function BandForgeTrust() {
  return (
    <section
      id="trust"
      className="scroll-mt-20 overflow-x-hidden border-b border-border/70 bg-white/45 py-6 backdrop-blur sm:py-8"
    >
      <BfAutoMarquee
        aria-label="BandForge proof points"
        speed={24}
        mobileLoopDuration="36s"
      >
        <ul className="bf-marquee-track gap-3 pr-3 sm:gap-4 sm:pr-4">
          {proofItems.map((item) => (
            <li
              key={item.title}
              className="bf-min-card flex w-[min(78vw,220px)] shrink-0 flex-col justify-center px-4 py-3.5 sm:min-w-[260px] sm:w-auto sm:px-5 sm:py-4"
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
        className="mt-3 sm:mt-4"
        speed={18}
        mobileLoopDuration="42s"
      >
        <ul className="bf-marquee-track gap-3 pr-3 sm:gap-4 sm:pr-4">
          {countryItems.map((item) => (
            <li
              key={item.country}
              className="bf-min-card flex w-[min(82vw,240px)] shrink-0 flex-col justify-center px-4 py-3.5 sm:min-w-[290px] sm:w-auto sm:px-5 sm:py-4"
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
