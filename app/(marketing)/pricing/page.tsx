import type { Metadata } from "next";
import { PricingExperience } from "@/components/bandforge/seo/pricing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import {
  fetchPlansResult,
  fetchSubscriptionResult,
} from "@/lib/payments-server";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { pricingSchemaGraph } from "@/lib/seo/schema";
import { getCachedCookieHeader } from "@/lib/server-cache";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.pricing.title,
  description: PAGE_SEO_COPY.pricing.description,
  path: "/pricing",
});

export default async function PricingPage() {
  const cookieHeader = await getCachedCookieHeader();
  const [plansResult, subscriptionResult] = await Promise.all([
    fetchPlansResult(),
    fetchSubscriptionResult(cookieHeader),
  ]);

  return (
    <>
      <JsonLd data={pricingSchemaGraph()} />
      <PricingExperience
        initialPlans={plansResult.plans}
        initialPaymentsEnabled={plansResult.payments_enabled}
        plansKnown={plansResult.known}
        initialSubscription={subscriptionResult.subscription}
      />
    </>
  );
}
