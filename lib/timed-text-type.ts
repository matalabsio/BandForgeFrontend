/**
 * Budget TextType so all copy finishes before a countdown ends.
 * Leaves a small cushion so the last line is readable before auto-advance.
 */

export type TimedTypeSegment = {
  text: string;
};

export type TimedTypePlan = {
  /** ms per character (base typingSpeed) */
  typingSpeed: number;
  variableSpeed: { min: number; max: number };
  /** initialDelay per segment, ms */
  delays: number[];
};

const START_DELAY_MS = 280;
const GAP_BETWEEN_SEGMENTS_MS = 380;
const FINISH_CUSHION_MS = 1200;
const MIN_TYPING_SPEED = 28;
const MAX_TYPING_SPEED = 72;

/**
 * Fit sequential one-shot typing into `totalSec` seconds.
 * Speeds up when copy is long; never stretches past the countdown.
 */
export function planTimedTextType(
  segments: TimedTypeSegment[],
  totalSec: number,
): TimedTypePlan {
  const texts = segments.map((s) => s.text).filter(Boolean);
  const totalChars = texts.reduce((n, t) => n + t.length, 0);
  const gaps = Math.max(0, texts.length - 1) * GAP_BETWEEN_SEGMENTS_MS;
  const budgetMs = Math.max(
    1500,
    totalSec * 1000 - START_DELAY_MS - gaps - FINISH_CUSHION_MS,
  );

  let typingSpeed =
    totalChars > 0 ? Math.floor(budgetMs / totalChars) : MAX_TYPING_SPEED;
  typingSpeed = Math.min(MAX_TYPING_SPEED, Math.max(MIN_TYPING_SPEED, typingSpeed));

  const delays: number[] = [];
  let cursor = START_DELAY_MS;
  for (const text of texts) {
    delays.push(cursor);
    cursor += text.length * typingSpeed + GAP_BETWEEN_SEGMENTS_MS;
  }

  const jitter = Math.max(6, Math.round(typingSpeed * 0.18));
  return {
    typingSpeed,
    variableSpeed: {
      min: Math.max(MIN_TYPING_SPEED - 4, typingSpeed - jitter),
      max: typingSpeed + jitter,
    },
    delays,
  };
}
