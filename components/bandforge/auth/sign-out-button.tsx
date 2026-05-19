"use client";

import { logout } from "@/lib/auth";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-lg border border-border px-3 py-2 text-meta font-semibold text-ink/70 transition-colors hover:bg-surface hover:text-navy"
      onClick={() => {
        void logout().then(() => {
          window.location.href = "/";
        });
      }}
    >
      Sign out
    </button>
  );
}
