import type { Metadata } from "next";
import { MarketingShell } from "@/components/landing/marketing-shell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the MATA Labs website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <h1 className="text-h1 text-navy">Terms of use</h1>
          <p className="mt-2 text-meta text-ink/55">
            Last updated: {new Date().toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="prose-legal mt-10 space-y-8 text-body leading-relaxed text-ink/80">
            <section className="space-y-3">
              <h2 className="text-h4 text-navy">1. Agreement</h2>
              <p>
                By accessing this website, you agree to these terms. If you do
                not agree, please do not use the site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">2. Use of the site</h2>
              <p>
                You may browse this site for lawful purposes only. You agree not
                to misuse the site, attempt unauthorised access, interfere with
                security features, or use automated means in a way that burdens
                our infrastructure without permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">3. Intellectual property</h2>
              <p>
                Content on this site (including text, graphics, and branding) is
                owned by MATA Labs or its licensors and is protected by
                applicable intellectual property laws. No licence is granted
                except the limited right to view content for personal,
                non-commercial use unless we agree otherwise in writing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">4. No warranty</h2>
              <p>
                This site is provided “as is” without warranties of any kind,
                to the fullest extent permitted by law. We do not warrant that
                the site will be uninterrupted or error-free.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">5. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, MATA Labs shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of the site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">6. Third-party links</h2>
              <p>
                The site may contain links to third-party websites. We are not
                responsible for their content or practices.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">7. Changes</h2>
              <p>
                We may update these terms periodically. Continued use after
                changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-h4 text-navy">8. Contact</h2>
              <p>
                For questions about these terms:{" "}
                <a
                  href="mailto:hello@matalabs.io"
                  className="font-semibold text-teal underline-offset-2 hover:text-teal-light"
                >
                  hello@matalabs.io
                </a>
              </p>
            </section>
          </div>
        </article>
      </main>
    </MarketingShell>
  );
}
