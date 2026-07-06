"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  type PaymentHistoryItem,
  type Subscription,
  formatInr,
  getPaymentHistory,
  getSubscription,
} from "@/lib/payments";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_PILL: Record<string, string> = {
  paid: "bg-[#DCFCE7] text-success",
  active: "bg-[#DCFCE7] text-success",
  failed: "bg-[#FEF3C7] text-warning",
  refunded: "bg-surface text-muted",
  created: "bg-surface text-muted",
  expired: "bg-surface text-muted",
  cancelled: "bg-surface text-muted",
};

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_PILL[status.toLowerCase()] ?? "bg-surface text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] ${cls}`}
    >
      {status}
    </span>
  );
}

export function BillingClient() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getSubscription().catch(() => null),
      getPaymentHistory().catch(() => ({ payments: [] })),
    ])
      .then(([sub, hist]) => {
        if (!active) return;
        setSubscription(sub);
        setHistory(hist?.payments ?? []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const active = subscription?.is_active;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Billing
        </p>
        <h1 className="font-display mt-1 text-2xl font-bold text-navy">
          Plan &amp; billing
        </h1>
      </header>

      {/* plan & billing card */}
      <section className="rounded-2xl border border-border-soft bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-navy">Current plan</h2>
          {!loading && active ? <StatusPill status={subscription?.status ?? "active"} /> : null}
        </div>

        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-surface" />
        ) : active ? (
          <div className="space-y-2.5">
            <Row label="Plan" value={subscription?.plan_name ?? "—"} />
            <Row label="Expires" value={formatDate(subscription?.expires_at ?? null)} />
            <div className="pt-2">
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-deep"
              >
                Renew or upgrade
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              No active plan. Unlock full mocks and examiner reviews.
            </p>
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan px-4 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-brand-sky-hover"
            >
              View plans
            </Link>
          </div>
        )}
      </section>

      {/* payment history */}
      <section className="rounded-2xl border border-border-soft bg-white p-6 shadow-soft">
        <h2 className="font-display text-base font-bold text-navy">Payment history</h2>
        {loading ? (
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-surface" />
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No payments yet.{" "}
            <Link href="/pricing" className="font-semibold text-cyan hover:underline">
              View plans
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border-soft text-[11px] uppercase tracking-wide text-muted-light">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Reference</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-mono text-muted">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 text-navy">{item.plan_name ?? "—"}</td>
                    <td className="py-3 font-mono text-navy">{formatInr(item.amount)}</td>
                    <td className="py-3 font-mono text-[11px] text-muted">
                      {item.razorpay_payment_id ?? "—"}
                    </td>
                    <td className="py-3">
                      <StatusPill status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-muted-light">
              Payment references are your Razorpay payment IDs for support inquiries.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="font-mono text-[13px] font-semibold text-navy">{value}</span>
    </div>
  );
}
