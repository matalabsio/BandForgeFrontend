"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { type Subscription, getSubscription } from "@/lib/payments";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CheckoutSuccessClient() {
  const router = useRouter();
  // Read-only: subscription was granted by POST /verify before navigation here.
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSubscription()
      .then((sub) => {
        if (!active) return;
        setSubscription(sub);
        if (!sub.is_active) {
          router.replace("/pricing");
          return;
        }
        router.replace("/dashboard");
      })
      .catch(() => {
        if (active) router.replace("/pricing");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-success">
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 className="font-display mt-6 text-2xl font-extrabold text-navy">
        Payment successful
      </h1>
      <p className="mt-2 text-sm text-muted">Your BandForge plan is now active.</p>

      <div className="mt-8 w-full rounded-2xl border border-border-soft bg-white p-6 text-left shadow-soft">
        <Row label="Plan" value={loading ? "—" : (subscription?.plan_name ?? "—")} />
        <Row label="Status" value={subscription?.is_active ? "Active" : "—"} pill />
        <Row label="Valid until" value={formatDate(subscription?.expires_at ?? null)} />
      </div>

      <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row">
        <Link
          href="/dashboard"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-deep"
        >
          Go to dashboard
        </Link>
        <Link
          href="/profile/billing"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-surface-alt"
        >
          View payment history
        </Link>
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted-light">
        Receipt saved to your account.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  pill,
}: {
  label: string;
  value: string;
  pill?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-soft py-2.5 last:border-0">
      <span className="text-[13px] text-muted">{label}</span>
      {pill ? (
        <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] text-success">
          {value}
        </span>
      ) : (
        <span className="font-mono text-[13px] font-semibold text-navy">{value}</span>
      )}
    </div>
  );
}
