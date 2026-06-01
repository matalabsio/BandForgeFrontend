import { Suspense } from "react";
import { BfFinalConversionCtas } from "@/components/bandforge/bf-final-conversion-ctas";

export function BandForgeFinalCta() {
  return (
    <section
      id="final-cta"
      className="bf-section scroll-mt-20 border-t border-border/70 bg-white"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="bf-section-title">
          Your next IELTS band score starts here.
        </h2>
        <p className="bf-copy mx-auto mt-5 max-w-xl">
          Save your mobile number now, continue with Google, and start building
          your mock-test dashboard without a cluttered signup flow.
        </p>
        <Suspense
          fallback={
            <div
              className="mx-auto mt-8 h-12 w-56 animate-pulse rounded-full bg-navy/10"
              aria-hidden
            />
          }
        >
          <BfFinalConversionCtas />
        </Suspense>
      </div>
    </section>
  );
}
