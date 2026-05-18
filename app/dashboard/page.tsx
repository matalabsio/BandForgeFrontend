import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const upcoming = [
  { title: "Full Academic Mock", date: "20 May 2026", modules: "4 skills" },
  { title: "Reading Drill", date: "22 May 2026", modules: "Reading only" },
];

const practice = [
  { href: "/test/reading", label: "Reading", band: "6.5", done: true },
  { href: "/test/listening", label: "Listening", band: "7.0", done: true },
  { href: "/test/writing", label: "Writing", band: "6.0", done: false },
  { href: "/test/speaking", label: "Speaking", band: "—", done: false },
];

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Candidate dashboard"
        description="Track mocks, scores, and recommended practice. Expressive layout — distinct from the clinical test UI."
        actions={
          <Link href="/test/reading">
            <Button variant="teal" className="min-w-0">
              Start mock test
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall band"
          value="6.5"
          hint="Last full mock"
          trend={<Badge variant="success">+0.5</Badge>}
        />
        <StatCard label="Study streak" value="5 days" />
        <StatCard label="Hours practiced" value="12.4" />
        <StatCard label="Next mock" value="20 May" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <h2 className="text-h4 text-navy">Upcoming tests</h2>
          <ul className="mt-4 space-y-3">
            {upcoming.map((t) => (
              <li
                key={t.title}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="text-body font-semibold text-navy">{t.title}</p>
                  <p className="text-meta text-ink/55">
                    {t.date} · {t.modules}
                  </p>
                </div>
                <Badge variant="teal">Scheduled</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="elevated">
          <h2 className="text-h4 text-navy">Recent scores</h2>
          <p className="mt-1 text-meta text-ink/55">Full mock · 12 May 2026</p>
          <ProgressBar className="mt-4" value={6.5} max={9} label="Overall" />
          <Link
            href="/scores"
            className="mt-4 inline-flex cursor-pointer text-body font-semibold text-teal hover:text-teal-light"
          >
            View full report →
          </Link>
        </Card>
      </div>

      <Card variant="elevated" className="mt-6">
        <h2 className="text-h4 text-navy">Recommended practice</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {practice.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-colors duration-200 hover:border-teal/40 hover:bg-surface"
              >
                <span className="text-body font-medium text-navy">
                  {m.label}
                </span>
                <span className="text-meta text-ink/55">
                  {m.done ? `Band ${m.band}` : "Not started"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </DashboardShell>
  );
}
