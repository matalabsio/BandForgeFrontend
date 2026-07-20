/** Canonical production origin for Google OAuth (must match Railway GOOGLE_REDIRECT_URI host). */
export const PRODUCTION_OAUTH_ORIGIN =
  process.env.NEXT_PUBLIC_OAUTH_SITE_URL?.replace(/\/$/, "") ||
  "https://bandforge-web.vercel.app";

/** Non-canonical hosts (Vercel previews / legacy Netlify) cannot keep OAuth cookies. */
export function isDeployPreviewHost(hostname: string): boolean {
  if (hostname === "bandforge-web.vercel.app") return false;
  if (hostname.endsWith(".vercel.app")) return true;
  return /--[a-z0-9-]+\.netlify\.app$/i.test(hostname);
}

/** @deprecated Use isDeployPreviewHost */
export function isNetlifyDeployPreviewHost(hostname: string): boolean {
  return isDeployPreviewHost(hostname);
}

export function isDeployPreviewOrigin(origin: string): boolean {
  try {
    return isDeployPreviewHost(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/** @deprecated Use isDeployPreviewOrigin */
export function isNetlifyDeployPreviewOrigin(origin: string): boolean {
  return isDeployPreviewOrigin(origin);
}

/**
 * Google OAuth redirect_uri is fixed to production. Previews must start OAuth on
 * bandforge-web.vercel.app or Google returns to production without cookies on preview.
 */
export function oauthOriginForRequest(requestOrigin: string): string {
  if (isDeployPreviewOrigin(requestOrigin)) {
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
