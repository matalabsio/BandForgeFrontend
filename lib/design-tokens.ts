/** BandForge IELTS design system — tokens & behavioral constants */

export const colors = {
  navy: "#0D1F3C",
  teal: "#0097A7",
  tealLight: "#00BCD4",
  green: "#059669",
  amber: "#D97706",
  red: "#DC2626",
  ink: "#0F1923",
  graySurface: "#F5F7FA",
  border: "#E5E7EB",
} as const;

const typography = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 14,
  question: 16,
  meta: 12,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

const timerWarningSeconds = 5 * 60;
const timerCriticalSeconds = 60;

export const writingTargets = {
  task1Min: 150,
  task1Max: 200,
  task2Min: 250,
} as const;

export type TimerVariant = "default" | "warning" | "critical";

export function getTimerVariant(remainingSeconds: number): TimerVariant {
  if (remainingSeconds < timerCriticalSeconds) return "critical";
  if (remainingSeconds < timerWarningSeconds) return "warning";
  return "default";
}

export type WordCountStatus = "low" | "ok" | "good";

export function getWordCountStatus(
  count: number,
  min: number,
  max?: number,
): WordCountStatus {
  if (count < min * 0.7) return "low";
  if (max && count > max) return "ok";
  if (count >= min) return "good";
  return "ok";
}
