"use client";

import { createContext, useContext, type RefObject } from "react";

type SectionResultsScrollContextValue = {
  scrollRef: RefObject<HTMLDivElement | null>;
};

export const SectionResultsScrollContext =
  createContext<SectionResultsScrollContextValue | null>(null);

export function useSectionResultsScroll(): SectionResultsScrollContextValue | null {
  return useContext(SectionResultsScrollContext);
}
