/** Pure pathname rules for dashboard chrome (no Next.js imports — testable in Node). */

export function bandforgeHideShellHeader(pathname: string): boolean {
  return pathname === "/dashboard" || pathname === "/scores";
}

/** Focused receipt page — no dashboard chrome. */
export function bandforgeQuietCheckoutChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return path === "/checkout/success";
}

/** Bank speaking exercise + results use the same full-bleed chrome as /test speaking. */
export function bandforgeQuietSpeakingExerciseChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return /\/practice\/speaking\/[^/]+\/exercise(?:\/results)?\/?$/.test(path);
}

/** Bank writing exercise + results use the same full-bleed chrome as practice speaking. */
export function bandforgeQuietWritingExerciseChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return /\/practice\/writing\/[^/]+\/exercise(?:\/results)?\/?$/.test(path);
}

/** Bank listening exercise + results — full-bleed so SectionResultsShell can own scroll. */
export function bandforgeQuietListeningExerciseChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return /\/practice\/listening\/[^/]+\/exercise(?:\/results)?\/?$/.test(path);
}

/** Bank reading exercise + results — full-bleed so SectionResultsShell can own scroll. */
export function bandforgeQuietReadingExerciseChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return /\/practice\/reading\/[^/]+\/exercise(?:\/results)?\/?$/.test(path);
}
