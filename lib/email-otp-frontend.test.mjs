import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTH_PROXY_SESSION_PATHS,
  isAuthProxyPath,
} from "./auth-proxy-paths.ts";
import { isEmailOtpEnabled, isPhoneOtpEnabled } from "./flags.ts";

const ORIGINAL_EMAIL_FLAG = process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED;
const ORIGINAL_PHONE_FLAG = process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED;

test.after(() => {
  if (ORIGINAL_EMAIL_FLAG === undefined) {
    delete process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED;
  } else {
    process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED = ORIGINAL_EMAIL_FLAG;
  }
  if (ORIGINAL_PHONE_FLAG === undefined) {
    delete process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED;
  } else {
    process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED = ORIGINAL_PHONE_FLAG;
  }
});

test("isEmailOtpEnabled is false by default", () => {
  delete process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED;
  assert.equal(isEmailOtpEnabled(), false);
});

test("isEmailOtpEnabled is true only for exact true string", () => {
  process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED = "true";
  assert.equal(isEmailOtpEnabled(), true);
  process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED = "TRUE";
  assert.equal(isEmailOtpEnabled(), false);
});

test("isPhoneOtpEnabled remains independent from email OTP flag", () => {
  process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED = "true";
  delete process.env.NEXT_PUBLIC_PHONE_OTP_ENABLED;
  assert.equal(isEmailOtpEnabled(), true);
  assert.equal(isPhoneOtpEnabled(), false);
});

test("auth proxy allowlist includes email OTP routes", () => {
  assert.equal(isAuthProxyPath("send-email-otp"), true);
  assert.equal(isAuthProxyPath("verify-email-otp"), true);
  assert.equal(isAuthProxyPath("verify-email"), true);
  assert.equal(isAuthProxyPath("send-email-otp/extra"), false);
});

test("verify-email-otp sets session cookies via BFF session path set", () => {
  assert.equal(AUTH_PROXY_SESSION_PATHS.has("verify-email-otp"), true);
  assert.equal(AUTH_PROXY_SESSION_PATHS.has("send-email-otp"), false);
});
