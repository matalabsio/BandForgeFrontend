import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";
import { ContactForm } from "@/components/landing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with MATA Labs for partnerships, product enquiries, or early access.",
  alternates: { canonical: "/contact" },
};

function ContactFormSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]" aria-hidden>
      <div className="h-10 animate-pulse rounded-lg bg-navy/8" />
      <div className="h-10 animate-pulse rounded-lg bg-navy/8" />
      <div className="h-32 animate-pulse rounded-lg bg-navy/8" />
      <div className="h-11 w-36 animate-pulse rounded-full bg-navy/10" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <BandForgeRouteShell
      eyebrow="Contact"
      title="We'd like to hear from you"
      description="Share a short note about your goals, audience, and timeline — or email hello@matalabs.io directly."
    >
      <div className="bf-container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-2">
            <h2 className="text-h4 text-navy">What to include</h2>
            <ul className="mt-4 space-y-3 text-body leading-relaxed text-ink/70">
              <li className="flex gap-2">
                <span className="font-semibold text-teal" aria-hidden>
                  ·
                </span>
                Organisation or project context
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-teal" aria-hidden>
                  ·
                </span>
                Rough timeline and budget band (if known)
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-teal" aria-hidden>
                  ·
                </span>
                Links or attachments you can share later over email
              </li>
            </ul>
            <p className="mt-8 text-meta text-ink/55">
              <Link
                href="/privacy-policy"
                prefetch
                className="font-medium text-teal transition-colors duration-200 hover:text-teal-light"
              >
                Privacy policy
              </Link>{" "}
              ·{" "}
              <Link
                href="/terms"
                prefetch
                className="font-medium text-teal transition-colors duration-200 hover:text-teal-light"
              >
                Terms of use
              </Link>
            </p>
          </div>
          <div className="lg:col-span-3">
            <Suspense fallback={<ContactFormSkeleton />}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </BandForgeRouteShell>
  );
}
