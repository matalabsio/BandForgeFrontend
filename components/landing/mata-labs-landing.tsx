import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "IELTS", label: "Exam-faithful UI" },
  { value: "AI", label: "Writing & speaking feedback" },
  { value: "PWA", label: "Practice anywhere" },
] as const;

const products = [
  {
    title: "BandForge",
    tag: "Flagship",
    desc: "Full-length IELTS mocks with a calm, clinical test interface and instant AI evaluation on Writing and Speaking.",
    href: "/dashboard",
    cta: "Open demo",
    featured: true,
  },
  {
    title: "Systems",
    tag: "Infrastructure",
    desc: "AI-native backends, async evaluation pipelines, and scalable data layers for education products.",
    href: "#about",
    cta: "Learn more",
    featured: false,
  },
  {
    title: "Experiences",
    tag: "Design",
    desc: "Premium interfaces built for long sessions — readable typography, clear hierarchy, mobile-first.",
    href: "#about",
    cta: "Our approach",
    featured: false,
  },
] as const;

export function MataLabsLanding() {
  return (
    <div className="bg-surface text-ink">
      <div className="flex min-h-dvh flex-col">
        <LandingHeader />
        <LandingHero />
      </div>

      <main>
        <section className="border-b border-border bg-white py-8 sm:py-10">
          <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            {stats.map((s) => (
              <li
                key={s.label}
                className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left"
              >
                <span className="text-h3 font-bold text-teal">{s.value}</span>
                <span className="text-meta text-ink/60">{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* About */}
        <section id="about" className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
            <div>
              <p className="text-meta font-semibold uppercase tracking-wider text-teal">
                About MATA Labs
              </p>
              <h2 className="mt-3 text-h2 text-navy">
                Precision design meets AI-native architecture
              </h2>
              <p className="mt-4 text-body leading-relaxed text-ink/70">
                We build products that respect how people learn under pressure —
                readable typography, intentional whitespace, and interfaces that
                stay out of the way during high-stakes practice.
              </p>
              <p className="mt-4 text-body leading-relaxed text-ink/70">
                BandForge is our IELTS preparation platform for Telugu-speaking
                candidates: full mocks, instant Writing feedback, and scored
                Speaking evaluation — all behind an interface aligned with the
                official exam experience.
              </p>
            </div>
            <div className="card-premium-elevated space-y-4 p-6 sm:p-8">
              {[
                {
                  label: "Test interface",
                  detail: "White canvas, navy navigation, teal progress — zero marketing chrome during mocks.",
                },
                {
                  label: "Dashboard & reports",
                  detail: "Expressive analytics and score breakdowns when you are not in an active test.",
                },
                {
                  label: "Mobile-first",
                  detail: "Designed from 375px up — 44px touch targets and thumb-friendly controls.",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-body font-semibold text-navy">
                    {row.label}
                  </p>
                  <p className="mt-1 text-meta leading-relaxed text-ink/65">
                    {row.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section
          id="products"
          className="border-t border-border bg-white py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-meta font-semibold uppercase tracking-wider text-teal">
                What we build
              </p>
              <h2 className="mt-3 text-h2 text-navy">Products & platforms</h2>
              <p className="mt-4 text-body text-ink/70">
                Education technology with the rigour of a real examination hall
                and the polish of modern SaaS.
              </p>
            </div>

            <ul className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
              {products.map((item) => (
                <li
                  key={item.title}
                  className={
                    item.featured
                      ? "card-premium-elevated relative overflow-hidden p-6 lg:col-span-1 lg:row-span-1 lg:ring-2 lg:ring-teal/20"
                      : "card-premium p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-elevated)]"
                  }
                >
                  {item.featured ? (
                    <div
                      className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal/10"
                      aria-hidden
                    />
                  ) : null}
                  <Badge variant={item.featured ? "teal" : "navy"}>
                    {item.tag}
                  </Badge>
                  <h3 className="mt-4 text-h4 text-navy">{item.title}</h3>
                  <p className="mt-2 text-body leading-relaxed text-ink/65">
                    {item.desc}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex cursor-pointer items-center gap-1 text-body font-semibold text-teal transition-colors duration-200 hover:text-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
                  >
                    {item.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/scores">
                <Button variant="secondary" className="min-w-0 rounded-lg">
                  View sample score report
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" className="min-w-0 rounded-lg">
                  Admin preview
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* BandForge highlight */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl bg-navy text-white shadow-[var(--shadow-elevated)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-14">
                <div>
                  <p className="text-meta font-semibold uppercase tracking-wider text-teal-light">
                    BandForge
                  </p>
                  <h2 className="mt-3 text-h2 text-white">
                    Practice like it&apos;s test day
                  </h2>
                  <p className="mt-4 text-body leading-relaxed text-white/75">
                    Reading, Listening, Writing, and Speaking modules with timed
                    flows, question navigation, and clinical white layouts — the
                    same calm focus you get in the exam room.
                  </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    { module: "Reading", path: "/test/reading" },
                    { module: "Listening", path: "/test/listening" },
                    { module: "Writing", path: "/test/writing" },
                    { module: "Speaking", path: "/test/speaking" },
                  ].map((m) => (
                    <li key={m.module}>
                      <Link
                        href={m.path}
                        className="flex min-h-[var(--spacing-touch)] cursor-pointer items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-body font-medium transition-colors duration-200 hover:border-teal-light/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light"
                      >
                        {m.module}
                        <span className="text-teal-light" aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t border-border py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-h2 text-navy">Get in touch</h2>
            <p className="mx-auto mt-4 max-w-md text-body text-ink/65">
              Interested in early access to BandForge or partnership with MATA
              Labs? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:hello@matalabs.io"
              className="mt-6 inline-flex cursor-pointer text-h4 font-semibold text-teal transition-colors duration-200 hover:text-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              hello@matalabs.io
            </a>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="mailto:hello@matalabs.io">
                <Button variant="primary" className="min-w-[200px] rounded-lg">
                  Email us
                </Button>
              </a>
              <Link href="/dashboard">
                <Button variant="teal" className="min-w-[200px] rounded-lg">
                  Launch demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-meta text-ink/50">
            © {new Date().getFullYear()} MATA Labs OPC. All rights reserved.
          </p>
          <nav
            className="flex flex-wrap justify-center gap-6"
            aria-label="Footer"
          >
            {[
              { href: "/dashboard", label: "BandForge" },
              { href: "/test/reading", label: "Test UI" },
              { href: "#about", label: "About" },
              { href: "#contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="cursor-pointer text-meta font-medium text-ink/55 transition-colors duration-200 hover:text-teal"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
