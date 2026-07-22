import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";
import { hasFullSkillProgram } from "@/lib/entitlement";
import { fetchSubscription } from "@/lib/payments-server";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";
import { getCachedCookieHeader, getCachedServerSession } from "@/lib/server-cache";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.diagnostic.title,
  description: PAGE_SEO_COPY.diagnostic.description,
  path: "/diagnostic",
});

export const dynamic = "force-dynamic";

export default async function DiagnosticLandingPage() {
  const cookieHeader = await getCachedCookieHeader();
  const user = await getCachedServerSession(cookieHeader);

  if (user) {
    const subscription = await fetchSubscription(cookieHeader);
    if (hasFullSkillProgram(subscription)) {
      redirect("/dashboard");
    }
  }

  return <DiagnosticStartExperience />;
}
