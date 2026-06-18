import Link from "next/link";
import { cn } from "@/lib/utils";

export type BfEmptyStateVariant = "no-tests" | "score-pending" | "error";

type Props = {
  variant?: BfEmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
};

const PRESETS: Record<
  BfEmptyStateVariant,
  {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  }
> = {
  "no-tests": {
    title: "No tests yet",
    description:
      "Take your free diagnostic to see your band score across all four IELTS sections.",
    actionLabel: "Take the Free Diagnostic",
    actionHref: "/test",
  },
  "score-pending": {
    title: "Score pending",
    description:
      "Your Speaking responses are being evaluated. Results usually arrive within 24 hours.",
    actionLabel: "Back to Dashboard",
    actionHref: "/dashboard",
  },
  error: {
    title: "Something went wrong",
    description:
      "We couldn't load your results. Check your connection and try again.",
    actionLabel: "Try Again",
    actionHref: "/dashboard",
    secondaryLabel: "Contact Support",
    secondaryHref: "/contact",
  },
};

function Illustration({ variant }: { variant: BfEmptyStateVariant }) {
  return (
    <div
      className={cn(
        "mb-6 flex size-[150px] items-center justify-center rounded-full border border-border-soft bg-surface-alt",
        variant === "error" && "border-[#fecaca] bg-[#fff5f5]",
        variant === "score-pending" && "border-[#fdecc8] bg-[#fffbeb]",
      )}
      aria-hidden
    >
      <svg
        className={cn(
          "size-16",
          variant === "no-tests" && "text-cyan",
          variant === "score-pending" && "text-[#e8a317]",
          variant === "error" && "text-[#e5484d]",
        )}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        {variant === "error" ? (
          <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        ) : variant === "score-pending" ? (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </>
        ) : (
          <>
            <path d="M4 19V5" />
            <path d="M12 19V9" />
            <path d="M20 19v-6" />
          </>
        )}
      </svg>
    </div>
  );
}

export function BfEmptyState({
  variant = "no-tests",
  title,
  description,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
  className,
}: Props) {
  const preset = PRESETS[variant];
  const resolvedTitle = title ?? preset.title;
  const resolvedDescription = description ?? preset.description;
  const resolvedActionLabel = actionLabel ?? preset.actionLabel;
  const resolvedActionHref = actionHref ?? preset.actionHref;
  const resolvedSecondaryLabel = secondaryLabel ?? preset.secondaryLabel;
  const resolvedSecondaryHref = secondaryHref ?? preset.secondaryHref;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-border-soft bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <Illustration variant={variant} />
      <h3 className="font-display text-xl font-bold text-navy">{resolvedTitle}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        {resolvedDescription}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={resolvedActionHref}
          prefetch
          className="inline-flex min-h-[var(--spacing-touch)] items-center justify-center rounded-full bg-cyan px-6 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-sky-hover"
        >
          {resolvedActionLabel}
        </Link>
        {resolvedSecondaryLabel && resolvedSecondaryHref ? (
          <Link
            href={resolvedSecondaryHref}
            prefetch
            className="inline-flex min-h-[var(--spacing-touch)] items-center justify-center rounded-full border border-border-muted px-6 font-display text-sm font-semibold text-navy hover:border-cyan/40"
          >
            {resolvedSecondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
