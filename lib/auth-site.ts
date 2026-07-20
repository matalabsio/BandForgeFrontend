import {
  CANONICAL_SITE_URL,
  isDeployPreviewHost,
  isDeployPreviewOrigin,
  siteOriginForRequest,
} from "@/lib/site";

/** @deprecated Use CANONICAL_SITE_URL from lib/site */
export const PRODUCTION_OAUTH_ORIGIN = CANONICAL_SITE_URL;

/** @deprecated Use isDeployPreviewHost from lib/site */
export function isNetlifyDeployPreviewHost(hostname: string): boolean {
  return isDeployPreviewHost(hostname);
}

/** @deprecated Use isDeployPreviewOrigin from lib/site */
export function isNetlifyDeployPreviewOrigin(origin: string): boolean {
  return isDeployPreviewOrigin(origin);
}

export { isDeployPreviewHost, isDeployPreviewOrigin };

/**
 * Google OAuth redirect_uri is fixed to production. Previews must start OAuth on
 * bandforge-web.vercel.app or Google returns to production without cookies on preview.
 */
export function oauthOriginForRequest(requestOrigin: string): string {
  return siteOriginForRequest(requestOrigin);
}

export function googleOAuthStartUrl(next: string, requestOrigin: string): string {
  const origin = oauthOriginForRequest(requestOrigin);
  return `${origin}/api/auth/google?next=${encodeURIComponent(next)}`;
}

export function productionLoginUrl(next = "/dashboard"): string {
  const safe =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return `${CANONICAL_SITE_URL}/login?next=${encodeURIComponent(safe)}`;
}
