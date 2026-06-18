import Link from "next/link";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";
import { getMarketingSessionUser } from "@/lib/marketing-auth-server";
import { isAuthEnabled } from "@/lib/flags";
import { mockTestNumberPath } from "@/lib/mock-catalog";
import { cn } from "@/lib/utils";

const ctaClass =
  "inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan font-display font-semibold text-white no-underline transition-colors hover:bg-brand-sky-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 focus-visible:ring-offset-2 px-4 py-2 text-[0.8125rem] lg:px-[22px] lg:py-2.5 lg:text-[0.9375rem]";

const diagnosticPath = mockTestNumberPath(1);

export async function BfHeaderAuthCta({ compact }: { compact?: boolean }) {
  if (!isAuthEnabled()) {
    return (
      <Link href={diagnosticPath} prefetch className={cn(ctaClass, compact && "px-4 text-sm")}>
        {compact ? "Start" : "Start free"}
      </Link>
    );
  }

  const user = await getMarketingSessionUser();

  if (user) {
    return (
      <Link href="/dashboard" prefetch className={cn(ctaClass, compact && "px-4 text-sm")}>
        {compact ? "Dashboard" : "Dashboard"}
      </Link>
    );
  }

  return (
    <Link
      href={marketingSignInHref(diagnosticPath)}
      prefetch
      className={cn(ctaClass, compact && "px-4 text-sm")}
    >
      {compact ? "Start" : "Start free"}
    </Link>
  );
}
