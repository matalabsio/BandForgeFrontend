import { redirect } from "next/navigation";
import { canonicalMockSlug, isUuid, mockHubPath } from "@/lib/mock-catalog";

/** Redirect UUID / legacy segment URLs to canonical slug (e.g. m01). */
export function ensureCanonicalMockSlug(
  segment: string,
  buildPath: (slug: string) => string,
): void {
  const canonical = canonicalMockSlug(segment);
  if (segment !== canonical && (isUuid(segment) || segment.length > 8)) {
    redirect(buildPath(canonical));
  }
}

export function ensureCanonicalMockHub(segment: string): void {
  ensureCanonicalMockSlug(segment, mockHubPath);
}
