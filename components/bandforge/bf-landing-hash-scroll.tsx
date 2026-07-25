"use client";

import { useEffect } from "react";
import { scheduleMarketingHashScroll } from "@/components/bandforge/bf-scroll-to-section";

/** Scrolls to `/#modules` (etc.) after dynamic landing sections mount. */
export function BfLandingHashScroll() {
  useEffect(() => scheduleMarketingHashScroll(), []);
  return null;
}
