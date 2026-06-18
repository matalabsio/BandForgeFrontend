import { BRAND_ABOUT_FOUNDER_QUOTES } from "@/lib/brand-mock-data";

export function BfAboutFounderStatement() {
  return (
    <section className="border-y border-border-soft bg-white lg:border-y-0">
      <div className="bf-container py-11 lg:grid lg:grid-cols-[0.4fr_1fr] lg:items-start lg:gap-14 lg:py-[5.5rem]">
        <div className="hidden lg:block">
          <div className="mb-5 h-1 w-11 rounded-sm bg-cyan" aria-hidden />
          <h2 className="font-display text-[1.625rem] leading-tight font-bold tracking-[-0.025em] text-navy">
            In the founder&apos;s words
          </h2>
        </div>
        <div className="max-w-[64ch] lg:mx-0">
          <div className="mb-6 h-[3px] w-[34px] rounded-sm bg-cyan lg:hidden" aria-hidden />
          {BRAND_ABOUT_FOUNDER_QUOTES.map((quote, i) => (
            <p
              key={i}
              className="text-[1.0625rem] leading-[1.65] text-[#3f4f63] lg:text-[1.3125rem] [&+&]:mt-[22px] lg:[&+&]:mt-[26px]"
            >
              {i === 1 ? (
                <>
                  BandForge is built on one principle —{" "}
                  <span className="font-semibold text-navy">
                    diagnosis before prescription.
                  </span>{" "}
                  No generic practice. No guesswork. Just a precise understanding
                  of where you are and a structured path to where you need to be.
                </>
              ) : (
                quote
              )}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
