import Link from "next/link";
import { BandForgeFinalCta } from "@/components/bandforge/bf-final-cta";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { FaqClient } from "@/components/bandforge/seo/faq-client";
import { SeoPrimaryCta } from "@/components/seo/seo-cta-button";
import { FAQ_LAST_UPDATED } from "@/lib/seo/faq-content";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export function FaqExperience() {
  return (
    <BandForgeRouteShell
      activeHref="/faq"
      eyebrow="FAQ"
      title={PAGE_SEO_COPY.faq.h1}
      description={PAGE_SEO_COPY.faq.description}
      lastUpdated={FAQ_LAST_UPDATED}
      heroCta={
        <SeoPrimaryCta href="/diagnostic">Take free diagnostic</SeoPrimaryCta>
      }
    >
      <section className="border-b border-border-soft bg-surface py-8 sm:py-10 lg:py-12">
        <FaqClient />
      </section>

      <section className="bg-white py-10 sm:py-12">
        <div className="bf-container mx-auto max-w-2xl text-center">
          <h2 className="font-display text-lg font-bold text-navy sm:text-xl">
            Still stuck?
          </h2>
          <p className="mx-auto mt-2 max-w-[36ch] text-sm leading-relaxed text-muted">
            Email{" "}
            <a
              href="mailto:support@bandforge.study"
              className="font-semibold text-[#0097a7] transition-colors hover:text-[#00bcd4]"
            >
              support@bandforge.study
            </a>{" "}
            or see{" "}
            <Link
              href="/contact"
              prefetch
              className="font-semibold text-[#0097a7] transition-colors hover:text-[#00bcd4]"
            >
              Contact
            </Link>
            .
          </p>
          <p className="mt-4 text-sm text-muted">
            <Link
              href="/pricing"
              prefetch
              className="font-medium text-[#0097a7] transition-colors hover:text-[#00bcd4]"
            >
              Pricing
            </Link>
            <span className="mx-2 text-border">·</span>
            <Link
              href="/refund-policy"
              prefetch
              className="font-medium text-[#0097a7] transition-colors hover:text-[#00bcd4]"
            >
              Refunds
            </Link>
          </p>
        </div>
      </section>

      <BandForgeFinalCta />
    </BandForgeRouteShell>
  );
}
