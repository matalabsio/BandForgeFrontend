import type { ReactNode } from "react";
import {
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  MessageCircle,
  User,
} from "lucide-react";
import { BfSettingsRow } from "@/components/bandforge/ui";
import { BRAND_PROFILE_STATS } from "@/lib/brand-mock-data";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";

type Props = {
  displayName: string;
  email: string | null;
  avatarInitial: string;
  children: ReactNode;
};

const settingsGroups = [
  {
    title: "Account",
    rows: [
      { label: "Edit Profile", icon: User, href: "#account-form" },
      { label: "Notification Preferences", icon: Bell, href: "#" },
      { label: "Language", icon: Globe, value: "English", href: "#" },
    ],
  },
  {
    title: "Plan",
    rows: [
      {
        label: "Current Plan Details",
        icon: CreditCard,
        value: BRAND_PROFILE_STATS.planName,
        href: "/plan",
      },
      { label: "Upgrade Plan", icon: ChevronRight, href: "/pricing" },
      { label: "Billing History", icon: CreditCard, href: "/profile/billing" },
    ],
  },
  {
    title: "Test Preferences",
    rows: [
      { label: "Test Date", icon: Calendar, value: "Aug 15, 2026", href: "#" },
      { label: "Native Language", icon: Globe, value: "Telugu", href: "#" },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "WhatsApp Support", icon: MessageCircle, href: "#" },
      { label: "FAQs", icon: HelpCircle, href: "/contact" },
      { label: "Report an Issue", icon: HelpCircle, href: "/contact" },
    ],
  },
] as const;

export function ProfileSettingsHub({
  displayName,
  email,
  avatarInitial,
  children,
}: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <header className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-full bg-cyan font-display text-2xl font-bold text-white">
                {avatarInitial}
              </div>
              <span className="absolute -right-1 bottom-0 rounded-full bg-[#e7f7ee] px-2 py-0.5 text-[0.625rem] font-semibold text-[#15935b]">
                Active
              </span>
            </div>
            <h1 className="font-display mt-4 text-xl font-bold text-navy">
              {displayName}
            </h1>
            {email ? (
              <p className="mt-1 text-sm text-muted-light">{email}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted">
              {BRAND_PROFILE_STATS.planName} ·{" "}
              <span className="font-medium text-navy">
                {BRAND_PROFILE_STATS.planDaysRemaining} days remaining
              </span>
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border-soft pt-6 text-center">
            <div>
              <dt className="font-mono text-lg text-cyan">
                {BRAND_PROFILE_STATS.targetBand.toFixed(1)}
              </dt>
              <dd className="text-xs text-muted-light">Target Band</dd>
            </div>
            <div>
              <dt className="font-mono text-lg text-cyan">
                {BRAND_PROFILE_STATS.testsCompleted}
              </dt>
              <dd className="text-xs text-muted-light">Tests Completed</dd>
            </div>
            <div>
              <dt className="font-mono text-lg text-cyan">
                {BRAND_PROFILE_STATS.expectedBand.toFixed(1)}
              </dt>
              <dd className="text-xs text-muted-light">Expected Band</dd>
            </div>
          </dl>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {settingsGroups.map((group) => (
            <section
              key={group.title}
              className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm"
            >
              <p className="border-b border-border-soft px-4 py-3 font-mono text-[0.6875rem] tracking-wide text-muted-light uppercase">
                {group.title}
              </p>
              {group.rows.map((row) => (
                <BfSettingsRow
                  key={row.label}
                  label={row.label}
                  value={"value" in row ? row.value : undefined}
                  href={row.href}
                  icon={
                    <row.icon className="size-[18px] text-cyan" strokeWidth={2} />
                  }
                />
              ))}
            </section>
          ))}
        </div>
      </div>

      <div className="text-center">
        <SignOutButton className="text-sm font-medium text-[#e5484d] hover:text-[#c9343a]" />
      </div>

      <div id="account-form" className="rounded-2xl border border-border-soft bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
