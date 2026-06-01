import type { AuthUser } from "@/lib/session";
import { formatIndiaDisplay, normalizeIndiaMobile } from "@/lib/india-mobile";

export function formatUserDisplayName(user: AuthUser | null | undefined): string {
  if (!user) return "Account";
  let display = user.email ?? user.full_name ?? "your account";
  if (user.phone) {
    const digits = normalizeIndiaMobile(user.phone.replace(/^\+?91/, ""));
    display =
      digits.length === 10 ? formatIndiaDisplay(digits) : user.phone;
  }
  return display;
}

export function getUserFirstName(user: AuthUser | null | undefined): string {
  if (!user) return "there";
  return (
    user.full_name?.trim().split(/\s+/)[0] ??
    user.email?.split("@")[0] ??
    "there"
  );
}
