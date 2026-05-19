import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/marketing-shell";
import { ContactForm } from "@/components/landing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with MATA Labs for partnerships, product enquiries, or early access.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <main className="flex-1">
        <div className="border-b border-border bg-gradient-to-b from-white to-surface py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-meta font-semibold uppercase tracking-wider text-teal">
              Contact
            </p>
            <h1 className="mt-2 max-w-2xl text-h1 text-navy sm:text-[2.25rem]">
              We&apos;d like to hear from you
            </h1>
            <p className="mt-4 max-w-2xl text-body leading-relaxed text-ink/70">
              Share a short note about your goals, audience, and timeline. For a
              quick path, you can also email us directly at{" "}
              <a
                href="mailto:hello@matalabs.io"
                className="font-semibold text-teal underline-offset-2 transition-colors duration-200 hover:text-teal-light"
              >
                hello@matalabs.io
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:gap-14 lg:px-8 lg:py-16">
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
                className="font-medium text-teal transition-colors duration-200 hover:text-teal-light"
              >
                Privacy policy
              </Link>{" "}
              ·{" "}
              <Link
                href="/terms"
                className="font-medium text-teal transition-colors duration-200 hover:text-teal-light"
              >
                Terms of use
              </Link>
            </p>
          </div>
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
