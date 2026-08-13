import type { Metadata } from "next";
import { BandForgeLanding } from "@/components/bandforge";
import { fetchMarketingHero } from "@/lib/hero-stream";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  pageMetadata,
} from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  path: "/",
});

/** BandForge marketing landing at `/`. */
export default async function Home() {
  const initialHero = await fetchMarketingHero();
  return <BandForgeLanding initialHero={initialHero} />;
}
