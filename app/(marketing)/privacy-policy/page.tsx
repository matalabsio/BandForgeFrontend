import type { Metadata } from "next";
import { BandForgeRouteShell } from "@/components/bandforge/bf-route-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MATA Labs handles information when you use our website.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <BandForgeRouteShell
      eyebrow="Legal"
      title="Privacy policy"
      description="How we handle information when you contact us or browse the BandForge site."
    >
      <article className="bf-container pb-16 lg:pb-20">
        <p className="text-meta text-ink/55">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="prose-legal mt-10 space-y-8 text-body leading-relaxed text-ink/80">
          <section className="space-y-3">
            <h2 className="text-h4 text-navy">1. Who we are</h2>
            <p>
              This website is operated by MATA Labs OPC (“MATA Labs”, “we”,
              “us”). If you contact us by email or through forms on this site,
              we may process the information you provide for the purposes
              described below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">2. Information we collect</h2>
            <p>
              We may collect your name, email address, and any other details you
              voluntarily include in a message. Technical data such as IP
              address, browser type, and approximate location may be processed
              by our hosting and analytics providers in standard web server logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">3. How we use information</h2>
            <p>We use contact and technical information to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Respond to enquiries and evaluate potential work together;</li>
              <li>Operate, secure, and improve this website;</li>
              <li>Comply with legal obligations where applicable.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">4. Legal bases (EEA/UK)</h2>
            <p>
              Where required, we rely on legitimate interests (responding to
              enquiries, securing our services) and, where appropriate, your
              consent (for example optional marketing if we offer it and you opt
              in).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">5. Retention</h2>
            <p>
              We retain correspondence for as long as needed to fulfil the
              purposes above, unless a longer period is required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">6. Your rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct,
              delete, or restrict processing of your personal data, and to
              object or lodge a complaint with a supervisory authority. Contact us
              at hello@matalabs.io to exercise these rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">7. Changes</h2>
            <p>
              We may update this policy from time to time. The “Last updated”
              date at the top will change when we do.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-h4 text-navy">8. Contact</h2>
            <p>
              Questions about privacy:{" "}
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
    </BandForgeRouteShell>
  );
}
