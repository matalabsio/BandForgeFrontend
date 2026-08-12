import Link from "next/link";
import { BandForgeLogoLink } from "@/components/bandforge/bandforge-logo-link";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";
import {
  getDashboardNav,
  isNavItemActive,
} from "@/components/bandforge/dashboard/dashboard-nav";
import { PremiumCta } from "@/components/bandforge/dashboard/premium-cta";
import { cn } from "@/lib/utils";

type Props = {
  pathname: string;
  displayName: string;
  avatarUrl?: string | null;
  showPremiumCta?: boolean;
  mockUnlocked?: boolean;
};

export function DashboardSidebarNav({
  pathname,
  displayName,
  avatarUrl = null,
  showPremiumCta = true,
  mockUnlocked = false,
}: Props) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "B";

  return (
    <>
      <div className="mb-8 px-1">
        <BandForgeLogoLink href="/dashboard" size="sm" />
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto" aria-label="Main">
        {getDashboardNav({ mockUnlocked }).map((group, groupIndex) => (
          <div key={group.title || `untitled-${groupIndex}`}>
            {group.title ? (
              <p className="mb-2 px-3 font-roboto-condensed text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                {group.title}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                const inner = (
                  <>
                    <item.Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-cyan" : "text-ink/40",
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                );
                const className = cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                  item.indent && "ml-3",
                  active
                    ? "bg-cyan/10 text-ink"
                    : "text-ink/60 hover:bg-ink/5 hover:text-ink",
                  item.disabled && "pointer-events-none opacity-45",
                );

                return (
                  <li key={item.label}>
                    {item.disabled ? (
                      <span className={className} title={item.disabledHint}>
                        {inner}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={!item.disabled}
                        className={className}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-4 border-t border-ink/8 pt-5">
        {showPremiumCta ? <PremiumCta /> : null}
        {process.env.NODE_ENV === "development" ? (
          <div className="rounded-xl border border-cyan/25 bg-navy px-3 py-3 text-white">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan">
              Dev · Mock tests
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link
                href="/test/1/listening"
                prefetch
                className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/5 px-2.5 text-[11px] font-semibold text-white/90 hover:border-cyan/50 hover:bg-cyan/15"
              >
                MT1
              </Link>
              <Link
                href="/test/2/listening"
                prefetch
                className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/5 px-2.5 text-[11px] font-semibold text-white/90 hover:border-cyan/50 hover:bg-cyan/15"
              >
                MT2
              </Link>
              <Link
                href="/diagnostic"
                prefetch
                className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/5 px-2.5 text-[11px] font-semibold text-white/90 hover:border-cyan/50 hover:bg-cyan/15"
              >
                Diagnostic
              </Link>
            </div>
          </div>
        ) : null}
        <Link
          href="/profile"
          className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink/5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-bold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{displayName}</p>
            <p className="text-[11px] text-ink/45">Edit profile</p>
          </div>
        </Link>
        <SignOutButton />
      </div>
    </>
  );
}
