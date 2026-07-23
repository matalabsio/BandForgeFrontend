import type { Metadata } from "next";

import { BfLegalShell } from "@/components/bandforge/bf-legal-shell";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_SUPPORT_EMAIL,
} from "@/components/bandforge/bf-legal-meta";
import {
  BfLegalContactCard,
  BfLegalEmail,
  BfLegalLink,
  BfLegalList,
  BfLegalListItem,
  BfLegalP,
  BfLegalSection,
} from "@/components/bandforge/bf-legal-primitives";

import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service — BandForge",
  description:
    "Terms governing your access to and use of the BandForge Platform and Services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <BfLegalShell
      title="Terms of service"
      description="Terms governing your access to and use of the BandForge Platform and the products and services offered through it."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
    >
      <BfLegalSection number={1} title="Agreement">
        <BfLegalP>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
          use of the BandForge website and application (the &ldquo;Platform&rdquo;)
          and the products and services offered through it (the
          &ldquo;Services&rdquo;). BandForge is a product operated by MATA Labs OPC
          Private Limited (CIN: U73100TS2026OPC213657), Hyderabad, Telangana, India
          (the &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By
          accessing the Platform, creating an account, or purchasing any Service,
          you agree to be bound by these Terms and by our{" "}
          <BfLegalLink href="/privacy-policy">Privacy Policy</BfLegalLink> and{" "}
          <BfLegalLink href="/refund-policy">
            Refund &amp; Cancellation Policy
          </BfLegalLink>
          , which are incorporated by reference. If you do not agree, do not use the
          Platform.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={2} title="Not affiliated with IELTS test owners">
        <BfLegalP>
          BandForge is an independent test-preparation service and is not affiliated
          with, endorsed by, or connected to the owners or administrators of the
          IELTS examination, including the British Council, IDP: IELTS Australia, or
          Cambridge University Press &amp; Assessment. &ldquo;IELTS&rdquo; and related
          marks are the property of their respective owners and are used on the
          Platform only to describe the exam for which we help you prepare. Any band
          scores, evaluations, or predictions provided by BandForge are practice
          estimates for learning purposes only. They are not official IELTS scores and
          do not guarantee any result in an actual IELTS examination.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={3} title="Eligibility">
        <BfLegalP>
          You must be at least 18 years old to purchase Services in your own name. If
          you are under 18, you may use the Platform only with the consent and under
          the supervision of a parent or lawful guardian, who agrees to these Terms on
          your behalf and is responsible for your use and any payments.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={4} title="Accounts">
        <BfLegalP>
          You agree to provide accurate information, keep your login credentials
          confidential, and be responsible for all activity under your account. Notify
          us promptly of any unauthorised use. We may suspend or terminate accounts
          that breach these Terms.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={5} title="Description of Services">
        <BfLegalP>
          BandForge offers IELTS preparation products, which may include a diagnostic
          assessment and skill-focused practice packages. Your written and spoken
          submissions are evaluated and returned to you as feedback and indicative band
          estimates. You acknowledge that: (a) feedback may contain errors or
          inconsistencies and is provided as-is to assist your practice; (b) band
          estimates are indicative only (see Section 2); and (c) we may modify, add, or
          discontinue features or products at any time.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={6} title="Fees and payment">
        <BfLegalP>
          Prices for the Services are displayed on the Platform in Indian Rupees
          (&#8377;) and are inclusive of applicable taxes unless stated otherwise. The
          price applicable to your purchase is the price displayed at the time you
          place your order. We may change prices, products, and promotional offers at
          any time. Payments are processed by Razorpay; by paying, you also agree to
          Razorpay&rsquo;s terms. Refunds are governed by our{" "}
          <BfLegalLink href="/refund-policy">
            Refund &amp; Cancellation Policy
          </BfLegalLink>
          .
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={7} title="Your submissions and licence">
        <BfLegalP>
          You retain ownership of the content you submit (written responses, voice
          recordings). By submitting, you grant us a limited, non-exclusive,
          royalty-free licence to store, process, transcribe, evaluate, and display
          that content back to you for the purpose of delivering the Services, and to
          use de-identified / aggregated data to improve our products. We will not
          publish your identifiable submissions without your consent.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={8} title="Licence to you and restrictions">
        <BfLegalP>
          We grant you a personal, non-transferable, non-exclusive, revocable licence
          to access the Services you have purchased for your own learning. You must
          not:
        </BfLegalP>
        <BfLegalList>
          <BfLegalListItem>
            share, resell, sublicense, or provide access to your account or purchased
            content to others;
          </BfLegalListItem>
          <BfLegalListItem>
            copy, scrape, reproduce, or distribute Platform content;
          </BfLegalListItem>
          <BfLegalListItem>
            reverse-engineer or interfere with the Platform&rsquo;s operation or
            security;
          </BfLegalListItem>
          <BfLegalListItem>
            use the Platform unlawfully or to infringe others&rsquo; rights; or
          </BfLegalListItem>
          <BfLegalListItem>
            upload unlawful, offensive, or infringing material.
          </BfLegalListItem>
        </BfLegalList>
      </BfLegalSection>

      <BfLegalSection number={9} title="Intellectual property, anti-scraping, and enforcement">
        <BfLegalP>
          All content on the Platform — including its software, question banks, practice
          materials, evaluation frameworks, scoring logic and methodologies, text,
          graphics, branding, and design (collectively, the &ldquo;Proprietary
          Content&rdquo;) — is owned by or licensed to the Company and is protected by
          copyright, trademark, database, and other laws. Your licence under Section 8
          grants no ownership and no right to exploit the Proprietary Content beyond
          your own personal, permitted use.
        </BfLegalP>
        <BfLegalP>
          You must not, and must not permit, enable, or assist any other person to:
        </BfLegalP>
        <BfLegalList>
          <BfLegalListItem>
            copy, scrape, crawl, harvest, mirror, cache, index, or extract any part of
            the Proprietary Content by any automated or manual means;
          </BfLegalListItem>
          <BfLegalListItem>
            reproduce, republish, resell, distribute, or build any derivative,
            competing, or substitute product, service, or dataset from the Proprietary
            Content;
          </BfLegalListItem>
          <BfLegalListItem>
            capture, record, screenshot, or screen-scrape Platform content beyond your
            own personal use; or
          </BfLegalListItem>
          <BfLegalListItem>
            circumvent, disable, or interfere with any access, security, or technical
            protection measure.
          </BfLegalListItem>
        </BfLegalList>
        <BfLegalP>
          To protect the Platform and detect misuse, we record technical, device,
          session, and usage information, and we may embed identifying markers within
          the content served to your account. This enables us to attribute, trace, and
          evidence any unauthorised access, reproduction, scraping, screenshotting, or
          leakage of our content back to its source. We treat unauthorised extraction or
          reproduction of our content — particularly by or on behalf of competitors —
          as a serious violation, and we will pursue all available civil and criminal
          remedies to the fullest extent of the law, including injunctions, damages,
          and account termination.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={10} title="Third-party services">
        <BfLegalP>
          The Platform integrates third-party services (for example, payment, hosting,
          evaluation, and analytics). We are not responsible for the acts, omissions,
          or terms of these third parties, though we select them with reasonable care.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={11} title="Disclaimers">
        <BfLegalP>
          The Services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
          without warranties of any kind, whether express or implied, to the maximum
          extent permitted by law. We do not warrant that use of the Services will
          result in any particular IELTS band score or outcome, that feedback will be
          error-free, or that the Platform will be uninterrupted or secure.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={12} title="Limitation of liability">
        <BfLegalP>
          To the maximum extent permitted by law, the Company&rsquo;s total aggregate
          liability arising out of or relating to the Services shall not exceed the
          amount you paid to us for the specific Service giving rise to the claim in
          the twelve (12) months preceding the claim. We shall not be liable for
          indirect, incidental, special, or consequential damages, or loss of
          opportunity, data, or goodwill. Nothing in these Terms excludes liability
          that cannot be excluded under applicable law.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={13} title="Indemnity">
        <BfLegalP>
          You agree to indemnify and hold harmless the Company and its officers and
          personnel from claims, losses, and expenses arising out of your breach of
          these Terms, your misuse of the Services, or your violation of any law or
          third-party right.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={14} title="Suspension and termination">
        <BfLegalP>
          We may suspend or terminate your access if you breach these Terms or use the
          Services in a manner that harms us, other users, or the Platform. You may
          stop using the Services at any time. Sections that by their nature should
          survive termination (including Sections 7, 9, 11, 12, and 13) will survive.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={15} title="Governing law and dispute resolution">
        <BfLegalP>
          These Terms are governed by the laws of India. Subject to the grievance
          process below, the courts at Hyderabad, Telangana shall have exclusive
          jurisdiction.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={16} title="Grievance redressal (Consumer Protection)">
        <BfLegalP>
          In compliance with the Consumer Protection Act, 2019 and the Consumer
          Protection (E-Commerce) Rules, 2020, our Grievance Officer is:
        </BfLegalP>
        <BfLegalContactCard
          name="Kiriti Mortha"
          designation="Director"
          email={LEGAL_SUPPORT_EMAIL}
          address="Gachibowli, Hyderabad, Telangana, India"
          note="We will acknowledge complaints within 48 hours and endeavour to resolve them within one month of receipt."
        />
      </BfLegalSection>

      <BfLegalSection number={17} title="Changes">
        <BfLegalP>
          We may update these Terms from time to time. Material changes will be
          notified via the Platform or email. Continued use after changes take effect
          constitutes acceptance.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={18} title="Contact">
        <BfLegalP>
          Questions about these Terms: <BfLegalEmail email={LEGAL_SUPPORT_EMAIL} />
        </BfLegalP>
      </BfLegalSection>
    </BfLegalShell>
  );
}
