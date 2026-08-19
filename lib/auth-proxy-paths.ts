export const AUTH_PROXY_PATHS = new Set([
  "register",
  "collect-lead",
  "login",
  "send-otp",
  "verify-otp",
  "send-email-otp",
  "verify-email-otp",
  "verify-email",
  "refresh",
  "restore",
  "logout",
  "forgot-password",
  "reset-password",
  "me",
  "profile",
  "profile/avatar",
]);

export function isAuthProxyPath(path: string): boolean {
  return AUTH_PROXY_PATHS.has(path);
}

/** Paths whose successful responses set auth cookies on the BFF. */
export const AUTH_PROXY_SESSION_PATHS = new Set([
  "restore",
  "login",
  "verify-otp",
  "verify-email-otp",
  "verify-email",
]);
