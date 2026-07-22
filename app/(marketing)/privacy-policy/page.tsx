import type { Metadata } from "next";

import { BfLegalShell } from "@/components/bandforge/bf-legal-shell";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_SUPPORT_EMAIL,
} from "@/components/bandforge/bf-legal-meta";
import {
  BfLegalCallout,
  BfLegalContactCard,
  BfLegalList,
  BfLegalListItem,
  BfLegalP,
  BfLegalSection,
} from "@/components/bandforge/bf-legal-primitives";

import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy — BandForge",
  description:
    "How BandForge collects, uses, and protects your personal data on the Platform.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <BfLegalShell
      title="Privacy policy"
      description="BandForge is built privacy-first. We collect only what we need to help you prepare and never sell your data."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      callout={
        <BfLegalCallout title="Our privacy commitment">
          <BfLegalP>
            BandForge is built privacy-first. We do not sell, rent, or trade your
            personal data to anyone — not to advertisers, not to data brokers, not
            to any third party — for any reason, ever.
          </BfLegalP>
          <BfLegalP>
            We collect only what we need to help you prepare, we use it only to
            deliver our services to you, and we never treat your data as a product
            to be sold. This is a binding commitment, not a marketing line.
          </BfLegalP>
        </BfLegalCallout>
      }
    >
      <BfLegalSection number={1} title="Who we are">
        <BfLegalP>
          BandForge (&ldquo;BandForge&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) is a product operated by MATA Labs OPC Private
          Limited, a One Person Company incorporated under the Companies Act,
          2013 (CIN: U73100TS2026OPC213657; PAN: AAUCM7307B), with its
          registered office at Gachibowli, Hyderabad, Telangana, India (the
          &ldquo;Company&rdquo;).
        </BfLegalP>
        <BfLegalP>
          For the purposes of the Digital Personal Data Protection Act, 2023
          (&ldquo;DPDP Act&rdquo;) and the rules made thereunder, the Company is
          the Data Fiduciary in respect of the personal data described in this
          Policy, and you (our user) are the Data Principal.
        </BfLegalP>
        <BfLegalP>
          This Privacy Policy explains what personal data we collect through the
          BandForge website and application (the &ldquo;Platform&rdquo;), why we
          collect it, how we use and protect it, and the rights available to you.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={2} title="Scope and consent">
        <BfLegalP>
          By creating an account, purchasing a product, or otherwise using the
          Platform, you confirm that you have read this Policy and, where
          required by law, that you consent to the collection and processing of
          your personal data as described here. Where we rely on your consent,
          you may withdraw it at any time (see Section 12). Withdrawal will not
          affect processing already carried out on the basis of consent given
          before withdrawal.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={3} title="Personal data we collect">
        <BfLegalP>
          We collect only the data we need to provide our services. This includes:
        </BfLegalP>
        <BfLegalList>
          <BfLegalListItem label="Account and identity data">
            your name, email address, mobile number, password (stored in hashed
            form), and preferred language.
          </BfLegalListItem>
          <BfLegalListItem label="Profile and learning data">
            your target IELTS band, test date, first language, self-reported
            proficiency, and the results of any diagnostic test you take.
          </BfLegalListItem>
          <BfLegalListItem label="Learning submissions">
            the written responses you submit for Writing tasks and the
            audio/voice recordings you submit for Speaking tasks, together with
            the feedback, scores, and band estimates generated in respect of
            them.
          </BfLegalListItem>
          <BfLegalListItem label="Transaction data">
            records of the products you purchase, order identifiers, invoices, and
            payment status. We do not collect or store your full card, UPI, or bank
            details. Payments are processed by our payment gateway, Razorpay (see
            Section 6).
          </BfLegalListItem>
          <BfLegalListItem label="Technical and usage data">
            IP address, device and browser type, operating system, pages and
            features used, session activity, and approximate location derived from
            your IP address.
          </BfLegalListItem>
          <BfLegalListItem label="Cookies and similar technologies">
            as described in Section 10.
          </BfLegalListItem>
          <BfLegalListItem label="Communications">
            messages you send us for support, feedback, or grievances.
          </BfLegalListItem>
        </BfLegalList>
      </BfLegalSection>

      <BfLegalSection number={4} title="How we use your data">
        <BfLegalP>We process your personal data for the following purposes:</BfLegalP>
        <BfLegalP>
          (i) to create and manage your account and authenticate you; (ii) to
          deliver the products and services you purchase, including running
          diagnostics and generating evaluations, feedback, and band estimates;
          (iii) to process payments and issue invoices; (iv) to provide customer
          support and respond to your queries and grievances; (v) to operate,
          maintain, secure, and improve the Platform, including debugging and
          analytics, and to detect, prevent, investigate, and act against fraud,
          misuse, unauthorised access, scraping, and infringement; (vi) to send you
          service-related communications; (vii) with your consent, to send you
          marketing or promotional communications, which you can opt out of at any
          time; and (viii) to comply with applicable law and enforce our Terms of
          Service.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={5} title="How your test responses are processed">
        <BfLegalP>
          To evaluate your submissions and generate your feedback, your test
          responses may be processed using third-party service providers, some of
          which may store or process data on servers located outside India. By
          submitting your responses, you consent to this processing. These
          providers act as our Data Processors and are contractually required to
          protect your data and to use it only to provide services to us.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={6} title="Sharing and disclosure">
        <BfLegalP>We do not sell your personal data. We share it only as follows:</BfLegalP>
        <BfLegalList>
          <BfLegalListItem label="Service providers (Data Processors)">
            acting on our instructions under contract, including our payment
            gateway (Razorpay), cloud hosting and database provider (Vercel for
            cloud hosting and Supabase for database), providers that help us
            evaluate test responses and generate feedback, and analytics and
            communication providers.
          </BfLegalListItem>
          <BfLegalListItem label="Legal and regulatory">
            where required to comply with applicable law, a court order, or a lawful
            request from a public authority, or to protect our rights, users, or the
            public.
          </BfLegalListItem>
          <BfLegalListItem label="Business transfers">
            in connection with a merger, acquisition, restructuring, or sale of
            assets, subject to the recipient honouring this Policy.
          </BfLegalListItem>
        </BfLegalList>
      </BfLegalSection>

      <BfLegalSection number={7} title="Children's data">
        <BfLegalP>
          The Platform is intended for users aged 18 and above. We recognise,
          however, that some IELTS aspirants are minors. If you are under 18, you
          may use the Platform only with the involvement and verifiable consent of
          a parent or lawful guardian, who accepts these terms on your behalf. In
          line with the DPDP Act, we will not knowingly process a child&rsquo;s
          personal data without verifiable parental consent, and we will not
          undertake tracking, behavioural monitoring, or targeted advertising
          directed at children. If we learn that we have collected a child&rsquo;s
          data without the required consent, we will delete it. A parent or guardian
          may contact our Grievance Officer to review or delete such data.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={8} title="Data retention">
        <BfLegalP>
          We retain personal data only for as long as necessary for the purposes
          set out in this Policy, or as required by applicable law (for example,
          tax and accounting records). When data is no longer required, we will
          delete or anonymise it. You may request deletion of your account and
          associated data as described in Section 11; some records may be retained
          for a limited period where the law requires.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={9} title="Cross-border transfers">
        <BfLegalP>
          Some of our Data Processors (including certain service and hosting
          providers) may store or process your data on servers outside India.
          Where we transfer personal data outside India, we do so in accordance
          with the DPDP Act and any restrictions notified by the Central Government
          from time to time, and we require such recipients to protect your data
          under contract.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={10} title="Cookies">
        <BfLegalP>
          We use cookies and similar technologies to keep you logged in, remember
          your preferences, secure the Platform, and understand usage. You can
          control cookies through your browser settings; disabling some cookies may
          affect Platform functionality.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={11} title="Your rights as a Data Principal">
        <BfLegalP>Subject to applicable law, you have the right to:</BfLegalP>
        <BfLegalList>
          <BfLegalListItem>
            access a summary of the personal data we hold about you and how we
            process it;
          </BfLegalListItem>
          <BfLegalListItem>
            correct, complete, or update inaccurate or incomplete data;
          </BfLegalListItem>
          <BfLegalListItem>
            erase your personal data where it is no longer required;
          </BfLegalListItem>
          <BfLegalListItem>
            nominate another individual to exercise your rights in the event of your
            death or incapacity; and
          </BfLegalListItem>
          <BfLegalListItem>
            grievance redressal — to have your complaints addressed by us.
          </BfLegalListItem>
        </BfLegalList>
        <BfLegalP>
          To exercise any right, contact our Grievance Officer (Section 13). We may
          need to verify your identity before acting on a request.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={12} title="Withdrawing consent">
        <BfLegalP>
          Where we rely on your consent, you may withdraw it at any time by
          contacting us or using the controls in your account settings. On
          withdrawal, we will stop the relevant processing, though this may prevent
          us from providing some or all of the services.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={13} title="Grievance Officer and contact">
        <BfLegalP>
          In accordance with the DPDP Act and the Information Technology Act, 2000,
          our Grievance Officer is:
        </BfLegalP>
        <BfLegalContactCard
          name="Kiriti Mortha"
          designation="Director"
          email={LEGAL_SUPPORT_EMAIL}
          address="Gachibowli, Hyderabad, Telangana, India"
          note="We will acknowledge and endeavour to resolve grievances within the timelines prescribed under applicable law (and in any event no later than 90 days for DPDP-related grievances)."
        />
      </BfLegalSection>

      <BfLegalSection number={14} title="Security">
        <BfLegalP>
          We maintain reasonable technical and organisational safeguards — including
          encryption in transit, access controls, and hashed passwords — designed to
          protect your data. No system is completely secure; in the event of a
          personal data breach, we will notify the Data Protection Board of India
          and affected users as required by law.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={15} title="Changes to this Policy">
        <BfLegalP>
          We may update this Policy from time to time. Material changes will be
          notified through the Platform or by email, and the &ldquo;Last
          updated&rdquo; date above will be revised. Continued use after changes
          take effect constitutes acceptance.
        </BfLegalP>
      </BfLegalSection>
    </BfLegalShell>
  );
}
