/** Minimum valid response length in seconds (locked in speaking evaluation plan). */
export const SHORT_RESPONSE_SEC = 5;

/** Heuristic: response too short or likely silent. */
export function isShortOrSilentResponse(
  durationSec: number,
  blob?: Blob | null,
): boolean {
  if (durationSec < SHORT_RESPONSE_SEC) return true;
  if (!blob || blob.size < 2_000) return true;
  return false;
}
