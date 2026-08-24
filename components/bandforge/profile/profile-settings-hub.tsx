import type { ReactNode } from "react";
import {
  BellIcon,
  CalendarIcon,
  CreditCardIcon,
  CrownIcon,
  GlobeIcon,
  HelpCircleIcon,
  MessageIcon,
  UserIcon,
} from "@/components/bandforge/dashboard/icons";
import { BfSettingsRow } from "@/components/bandforge/ui";
import { SignOutButton } from "@/components/bandforge/auth/sign-out-button";

export type ProfileHubStats = {
  planName: string;
  planDaysRemaining: number | null;
  targetBand: number | null;
  testsCompleted: number;
  expectedBand: number | null;
  examDateLabel: string | null;
};

type Props = {
  displayName: string;
  email: string | null;
  avatarInitial: string;
  stats: ProfileHubStats;
  children: ReactNode;
};

function formatBand(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(1);
}

export function ProfileSettingsHub({
  displayName,
  email,
  avatarInitial,
  stats,
  children,
}: Props) {
  const safeStats: ProfileHubStats = {
    planName: stats?.planName || "Free",
    planDaysRemaining: stats?.planDaysRemaining ?? null,
    targetBand: stats?.targetBand ?? null,
    testsCompleted: stats?.testsCompleted ?? 0,
    expectedBand: stats?.expectedBand ?? null,
    examDateLabel: stats?.examDateLabel ?? null,
  };

  const settingsGroups = [
    {
      title: "Account",
      rows: [
        { label: "Edit Profile", icon: UserIcon, href: "#account-form" },
        {
          label: "Notification Preferences",
          icon: BellIcon,
          href: "#notification-preferences",
        },
        { label: "Language", icon: GlobeIcon, value: "English", href: "#" },
      ],
    },
    {
      title: "Plan",
      rows: [
        {
          label: "Current Plan Details",
          icon: CreditCardIcon,
          value: safeStats.planName,
          href: "/profile/billing",
        },
        { label: "Upgrade Plan", icon: CrownIcon, href: "/pricing" },
        {
          label: "Billing History",
          icon: CreditCardIcon,
          href: "/profile/billing",
        },
      ],
    },
    {
      title: "Test Preferences",
      rows: [
        {
          label: "Test Date",
          icon: CalendarIcon,
          value: safeStats.examDateLabel ?? "Not set",
          href: "#account-form",
        },
      ],
    },
    {
      title: "Support",
      rows: [
        { label: "WhatsApp Support", icon: MessageIcon, href: "#" },
        { label: "FAQs", icon: HelpCircleIcon, href: "/contact" },
        { label: "Report an Issue", icon: HelpCircleIcon, href: "/contact" },
      ],
    },
  ] as const;

  const daysLabel =
    safeStats.planDaysRemaining != null
      ? `${safeStats.planDaysRemaining} days remaining`
      : "No active plan expiry";

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
              {safeStats.planName} ·{" "}
              <span className="font-medium text-navy">{daysLabel}</span>
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border-soft pt-6 text-center">
            <div>
              <dt className="font-mono text-lg text-cyan">
                {formatBand(safeStats.targetBand)}
              </dt>
              <dd className="text-xs text-muted-light">Target Band</dd>
            </div>
            <div>
              <dt className="font-mono text-lg text-cyan">
                {safeStats.testsCompleted}
              </dt>
              <dd className="text-xs text-muted-light">Tests Completed</dd>
            </div>
            <div>
              <dt className="font-mono text-lg text-cyan">
                {formatBand(safeStats.expectedBand)}
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
              {group.rows.map((row) => {
                const Icon = row.icon;
                return (
                  <BfSettingsRow
                    key={row.label}
                    label={row.label}
                    value={"value" in row ? row.value : undefined}
                    href={row.href}
                    icon={
                      <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-soft text-teal">
                        <Icon className="size-[16px]" />
                      </span>
                    }
                  />
                );
              })}
            </section>
          ))}
        </div>
      </div>

      <div className="text-center">
        <SignOutButton className="text-sm font-medium text-[#e5484d] hover:text-[#c9343a]" />
      </div>

      <div id="account-form" className="space-y-6">
        {children}
      </div>
    </div>
  );
}
