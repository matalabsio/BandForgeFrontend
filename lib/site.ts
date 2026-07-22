/** Canonical public site for OAuth and marketing metadata. */
export const CANONICAL_SITE_URL =
  process.env.NEXT_PUBLIC_OAUTH_SITE_URL?.replace(/\/$/, "") ||
  "https://bandforge-web.vercel.app";

/** Absolute public URL for a path (e.g. siteUrl("/diagnostic")). */
export function siteUrl(path = ""): string {
  if (!path || path === "/") return CANONICAL_SITE_URL;
  return `${CANONICAL_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Extra production hostnames (comma-separated). Vercel team aliases are included by default. */
const EXTRA_PRODUCTION_HOSTS = (process.env.NEXT_PUBLIC_PRODUCTION_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

/** Hostnames that behave as production (cookies + OAuth stay on the same origin). */
const PRODUCTION_HOSTS = new Set<string>([
  new URL(CANONICAL_SITE_URL).hostname.toLowerCase(),
  "bandforge-web.vercel.app",
  "bandforge-web-product-2554s-projects.vercel.app",
  "bandforge-web-git-main-product-2554s-projects.vercel.app",
  ...EXTRA_PRODUCTION_HOSTS,
]);

export function isProductionSiteHost(hostname: string): boolean {
  return PRODUCTION_HOSTS.has(hostname.toLowerCase());
}

/** Vercel preview / legacy Netlify preview — OAuth must start on production. */
export function isDeployPreviewHost(hostname: string): boolean {
  if (isProductionSiteHost(hostname)) return false;
  if (hostname.endsWith(".vercel.app")) return true;
  return /--[a-z0-9-]+\.netlify\.app$/i.test(hostname);
}

export function isDeployPreviewOrigin(origin: string): boolean {
  try {
    return isDeployPreviewHost(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export function siteOriginForRequest(requestOrigin: string): string {
  if (isDeployPreviewOrigin(requestOrigin)) {
    return CANONICAL_SITE_URL;
  }
  return requestOrigin.replace(/\/$/, "");
}
