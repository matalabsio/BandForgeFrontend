/** Phone OTP (MSG91) — off by default until NEXT_PUBLIC_PHONE_OTP_ENABLED=true */
export function isPhoneOtpEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED === "true";
}

/** Email OTP (Resend) — off by default until NEXT_PUBLIC_EMAIL_OTP_ENABLED=true */
export function isEmailOtpEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED === "true";
}

/**
 * Diagnostic results multi-SKU offer UI.
 * Off by default until NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND=true.
 */
export function isDiagnosticMultiSkuRecommendEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DIAGNOSTIC_MULTI_SKU_RECOMMEND === "true";
}

function isTruthyEnvFlag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

/** Common Vercel mistake: Railway API URL pasted into NEXT_PUBLIC_AUTH_ENABLED. */
function isMisconfiguredAuthEnabledApiUrl(value: string | undefined): boolean {
  const flag = value?.trim() ?? "";
  return flag.startsWith("http://") || flag.startsWith("https://");
}

/** Auth gates (middleware, modals, protected pages) — off until NEXT_PUBLIC_AUTH_ENABLED=true */
export function isAuthEnabled(): boolean {
  if (isTruthyEnvFlag(process.env.NEXT_PUBLIC_AUTH_ENABLED)) return true;
  // Runtime override on Vercel — no redeploy needed for server routes / middleware.
  if (isTruthyEnvFlag(process.env.AUTH_ENABLED)) return true;
  // Recover when NEXT_PUBLIC_AUTH_ENABLED was set to the API URL by mistake.
  if (isMisconfiguredAuthEnabledApiUrl(process.env.NEXT_PUBLIC_AUTH_ENABLED)) {
    return true;
  }
  return false;
}
