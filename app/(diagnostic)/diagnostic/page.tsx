import type { Metadata } from "next";
import { DiagnosticStartExperience } from "@/components/diagnostic/diagnostic-start-experience";
import { pageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO_COPY } from "@/lib/seo/page-copy";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO_COPY.diagnostic.title,
  description: PAGE_SEO_COPY.diagnostic.description,
  path: "/diagnostic",
});

/** Lead form mounts after client session/FSP gate (loader first). */
export const revalidate = 300;

export default function DiagnosticLandingPage() {
  return <DiagnosticStartExperience />;
}
