import type { AuthUser } from "@/lib/session";
import { formatIndiaDisplay, normalizeIndiaMobile } from "@/lib/india-mobile";

export type DisplayUser = {
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
};

export function formatUserDisplayName(user: DisplayUser | null | undefined): string {
  if (!user) return "Account";
  let display = user.email ?? user.full_name ?? "your account";
  if (user.phone) {
    const digits = normalizeIndiaMobile(user.phone.replace(/^\+?91/, ""));
    display =
      digits.length === 10 ? formatIndiaDisplay(digits) : user.phone;
  }
  return display;
}

export function getUserFirstName(user: DisplayUser | null | undefined): string {
  if (!user) return "there";
  return (
    user.full_name?.trim().split(/\s+/)[0] ??
    user.email?.split("@")[0] ??
    "there"
  );
}
