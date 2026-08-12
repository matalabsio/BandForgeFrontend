import type { CSSProperties } from "react";
import { FORGE_NAVY, FORGE_TEAL, INK, PAPER, SIGNAL_CYAN, SLATE } from "@/lib/brand";

const CYAN_SOFT = "#E0F7FA";

/** Shared IELTS test chrome (reading + listening). */
export const IELTS_EXAM_VARS: CSSProperties = {
  ["--exam-bar" as string]: FORGE_NAVY,
  ["--exam-ink" as string]: INK,
  ["--exam-ink-muted" as string]: SLATE,
  ["--exam-accent" as string]: FORGE_TEAL,
  ["--exam-accent-hover" as string]: SIGNAL_CYAN,
  ["--exam-accent-soft" as string]: CYAN_SOFT,
  ["--exam-paper" as string]: "#fffef9",
  ["--exam-surface" as string]: PAPER,
  ["--exam-border" as string]: "rgb(13 31 60 / 0.08)",
  ["--exam-muted" as string]: SLATE,
  ["--reading-bar" as string]: FORGE_NAVY,
  ["--reading-ink" as string]: INK,
  ["--reading-ink-muted" as string]: SLATE,
  ["--reading-accent" as string]: FORGE_TEAL,
  ["--reading-accent-soft" as string]: CYAN_SOFT,
  ["--reading-paper" as string]: "#fffef9",
  ["--reading-surface" as string]: PAPER,
  ["--reading-border" as string]: "rgb(13 31 60 / 0.08)",
  ["--reading-muted" as string]: SLATE,
};
