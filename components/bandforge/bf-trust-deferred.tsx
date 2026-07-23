"use client";

import dynamic from "next/dynamic";
import { BfSectionSkeleton } from "@/components/bandforge/bf-section-skeleton";

/** Client-only trust marquees — keeps decorative DOM out of the initial HTML. */
export const BandForgeTrustDeferred = dynamic(
  () =>
    import("@/components/bandforge/bf-trust").then((m) => m.BandForgeTrust),
  {
    ssr: false,
    loading: () => <BfSectionSkeleton className="min-h-[140px]" />,
  },
);
