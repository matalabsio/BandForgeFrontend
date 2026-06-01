import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { marketingSignInHref } from "@/components/bandforge/bf-marketing-auth-links";
import { getMarketingSessionUser } from "@/lib/marketing-auth-server";
import { isAuthEnabled } from "@/lib/flags";

const ctaClass =
  "group inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[0.8125rem] font-semibold text-white shadow-[0_16px_40px_-22px_rgb(13_31_60_/_0.8)] transition-colors duration-200 hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 xl:px-5";

export async function BfHeaderAuthCta({ compact }: { compact?: boolean }) {
  if (!isAuthEnabled()) {
    return (
      <Link href="/dashboard" prefetch className={ctaClass}>
        {compact ? "Dashboard" : "Start mock"}
        <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    );
  }

  const user = await getMarketingSessionUser();

  if (user) {
    const label = compact
      ? "Dashboard"
      : `Hi, ${user.full_name?.split(" ")[0] ?? "Account"}`;
    return (
      <Link href="/dashboard" prefetch className={ctaClass}>
        {label}
        <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    );
  }

  return (
    <Link href={marketingSignInHref()} prefetch className={ctaClass}>
      {compact ? "Get started" : "Sign in / up"}
      <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}
