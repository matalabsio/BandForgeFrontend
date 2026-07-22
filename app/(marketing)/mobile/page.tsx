import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { BandForgeMobile } from "@/components/bandforge/bf-mobile";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "BandForge Mobile — IELTS Practice on Your Phone",
  description:
    "BandForge is designed from mobile up, with thumb-safe IELTS practice and score reports that work on small screens.",
  path: "/mobile",
});

export default function MobilePage() {
  return (
    <BandForgeRouteShell
      eyebrow="Mobile-first"
      title="IELTS practice that works where students actually study."
      description="Readable passages, thumb-safe controls, and reports designed for phone screens, not squeezed down from desktop."
    >
      <BandForgeMobile />
    </BandForgeRouteShell>
  );
}
