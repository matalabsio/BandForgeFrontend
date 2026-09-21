/**
 * Diagnostic Writing/Speaking access decisions (mid-auth product).
 * Self-contained for Node unit tests — no optimistic "session hint" allow.
 */

function isFullAccountRole(role: string | null | undefined): boolean {
  return Boolean(role && role !== "guest");
}

export type DiagnosticProductiveAccessDecision =
  | { kind: "loading" }
  | { kind: "allow" }
  | { kind: "deny" };

/**
 * Whether protected productive children may mount.
 * Session cookie / localStorage hints alone never allow — role must be known.
 */
export function decideDiagnosticProductiveAccess(opts: {
  /** True only after ensureSession + getMe (or equivalent) finished. */
  roleResolved: boolean;
  hasSession: boolean;
  role: string | null | undefined;
}): DiagnosticProductiveAccessDecision {
  if (!opts.roleResolved) return { kind: "loading" };
  if (!opts.hasSession || !isFullAccountRole(opts.role)) {
    return { kind: "deny" };
  }
  return { kind: "allow" };
}
