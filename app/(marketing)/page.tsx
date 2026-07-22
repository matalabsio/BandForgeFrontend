import type { Metadata } from "next";
import { BandForgeLanding } from "@/components/bandforge";
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

/** Fresh session check for hero/header CTAs (avoid stale ISR auth). */
export const dynamic = "force-dynamic";

/** BandForge marketing landing at `/`. */
export default function Home() {
  return <BandForgeLanding />;
}
