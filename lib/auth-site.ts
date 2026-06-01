/** Canonical production origin for Google OAuth (must match EC2 GOOGLE_REDIRECT_URI host). */
export const PRODUCTION_OAUTH_ORIGIN =
  process.env.NEXT_PUBLIC_OAUTH_SITE_URL?.replace(/\/$/, "") ||
  "https://bandforge.netlify.app";

/** Netlify deploy previews: `https://<hash>--bandforge.netlify.app` */
export function isNetlifyDeployPreviewHost(hostname: string): boolean {
  return /--[a-z0-9-]+\.netlify\.app$/i.test(hostname);
}

export function isNetlifyDeployPreviewOrigin(origin: string): boolean {
  try {
    return isNetlifyDeployPreviewHost(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/**
 * Google OAuth redirect_uri is fixed to production. Previews must start OAuth on
 * bandforge.netlify.app or Google returns to production without cookies on preview.
 */
export function oauthOriginForRequest(requestOrigin: string): string {
  if (isNetlifyDeployPreviewOrigin(requestOrigin)) {
    return PRODUCTION_OAUTH_ORIGIN;
  }
  return requestOrigin.replace(/\/$/, "");
}

export function googleOAuthStartUrl(next: string, requestOrigin: string): string {
  const origin = oauthOriginForRequest(requestOrigin);
  return `${origin}/api/auth/google?next=${encodeURIComponent(next)}`;
}

export function productionLoginUrl(next = "/dashboard"): string {
  const safe =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return `${PRODUCTION_OAUTH_ORIGIN}/login?next=${encodeURIComponent(safe)}`;
}
