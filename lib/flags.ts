/** Phone OTP (MSG91) — off by default until NEXT_PUBLIC_PHONE_OTP_ENABLED=true */
export function isPhoneOtpEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED === "true";
}

/** Auth gates (middleware, modals, protected pages) — off until NEXT_PUBLIC_AUTH_ENABLED=true */
export function isAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
}
