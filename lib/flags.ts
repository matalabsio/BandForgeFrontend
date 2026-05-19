/** Phone OTP (MSG91) — off by default until NEXT_PUBLIC_PHONE_OTP_ENABLED=true */
export function isPhoneOtpEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED === "true";
}
