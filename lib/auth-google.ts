import {
  getApiUrl,
  parseApiError,
  parseJsonResponse,
  type ApiErrorBody,
} from "@/lib/api";

function rewriteSetCookie(header: string): string {
  return header
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Path=[^;]*/gi, "")
    .concat("; Path=/");
}

export type GoogleAuthResult = {
  user?: {
    id: string;
    email: string | null;
    full_name: string | null;
  };
  access_token?: string;
  redirect_to: string;
  pending_verification?: boolean;
  message?: string;
};

/** Exchange Google OAuth code via backend; returns Set-Cookie headers for the BFF route. */
export async function exchangeGoogleCode(
  code: string,
  state: string,
): Promise<{ data: GoogleAuthResult; setCookies: string[] }> {
  const res = await fetch(`${getApiUrl()}/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
    cache: "no-store",
  });
  const data = await parseJsonResponse<GoogleAuthResult & ApiErrorBody>(res);
  if (!res.ok) {
    throw new Error(parseApiError(data, res.status));
  }
  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];
  if (setCookies.length === 0) {
    const single = res.headers.get("set-cookie");
    if (single) setCookies.push(single);
  }
  return {
    data,
    setCookies: setCookies.map(rewriteSetCookie),
  };
}

export async function fetchGoogleAuthorizationUrl(
  next: string,
): Promise<string> {
  const res = await fetch(
    `${getApiUrl()}/auth/google/authorize?next=${encodeURIComponent(next)}`,
    { cache: "no-store" },
  );
  const body = await parseJsonResponse<{
    authorization_url?: string;
  } & ApiErrorBody>(res);
  if (!res.ok || !body.authorization_url) {
    throw new Error(
      body.authorization_url
        ? "Google sign-in is not available."
        : parseApiError(body, res.status),
    );
  }
  return body.authorization_url;
}
