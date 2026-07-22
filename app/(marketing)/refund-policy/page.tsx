import type { Metadata } from "next";

import { BfLegalShell } from "@/components/bandforge/bf-legal-shell";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_SUPPORT_EMAIL,
} from "@/components/bandforge/bf-legal-meta";
import {
  BfLegalEmail,
  BfLegalLink,
  BfLegalList,
  BfLegalListItem,
  BfLegalP,
  BfLegalSection,
} from "@/components/bandforge/bf-legal-primitives";

import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Refund & Cancellation Policy — BandForge",
  description:
    "BandForge refund and cancellation terms for digital learning products and evaluation services.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <BfLegalShell
      title="Refund & cancellation policy"
      description="Our refund position for Services purchased on BandForge, including limited exceptions and how to request a refund."
      lastUpdated={LEGAL_LAST_UPDATED}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
    >
      <BfLegalSection number={1} title="Overview">
        <BfLegalP>
          This Policy explains our refund position for Services purchased on BandForge,
          a product operated by MATA Labs OPC Private Limited, Hyderabad, Telangana,
          India. It applies alongside our{" "}
          <BfLegalLink href="/terms">Terms of Service</BfLegalLink>. Because BandForge
          sells digital learning products and evaluation services that are delivered and
          consumed on access, all purchases are final and non-refundable except in the
          limited cases set out in Section 3. This Policy does not limit any rights you
          may have under the Consumer Protection Act, 2019.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={2} title="Nature of our products">
        <BfLegalP>
          Our Services are digital learning products and evaluated submissions (Writing
          and Speaking) that are delivered and consumed immediately upon access. Once you
          access a product, or once your submission has been received or its evaluation
          has begun, the Service has been substantially delivered and consumed.
          Accordingly, purchases are final and, save as set out in Section 3,
          non-refundable.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={3} title="Limited exceptions">
        <BfLegalP>
          As a limited exception, we will provide a refund only in the following cases:
        </BfLegalP>
        <BfLegalList>
          <BfLegalListItem label="Duplicate or failed payment">
            if you are charged more than once for the same order, or money is debited
            but your purchase is not activated, we will refund the excess or failed
            amount.
          </BfLegalListItem>
          <BfLegalListItem label="Total non-delivery">
            if you paid for a Service that we are unable to deliver at all and no
            substitute is provided, we will refund the amount paid for that Service.
          </BfLegalListItem>
        </BfLegalList>
        <BfLegalP>
          No circumstances other than those listed above qualify for a refund.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={4} title="No other refunds">
        <BfLegalP>
          Except as stated in Section 3, purchases are non-refundable. In particular,
          refunds are not available where:
        </BfLegalP>
        <BfLegalList>
          <BfLegalListItem>
            you have accessed, started, or completed the Service, or submitted work, or
            feedback or an evaluation has been generated or delivered;
          </BfLegalListItem>
          <BfLegalListItem>
            you changed your mind, no longer need the Service, or purchased in error;
          </BfLegalListItem>
          <BfLegalListItem>
            your dissatisfaction relates to the band estimate or score you received
            (band estimates are indicative and not guaranteed — see the{" "}
            <BfLegalLink href="/terms">Terms of Service</BfLegalLink>);
          </BfLegalListItem>
          <BfLegalListItem>
            the purchase was a promotional, discounted, or free item; or
          </BfLegalListItem>
          <BfLegalListItem>
            your access was suspended or terminated for breach of the Terms of Service.
          </BfLegalListItem>
        </BfLegalList>
        <BfLegalP>
          Where you experience a genuine technical problem attributable to us, we will
          work to resolve it or re-deliver the Service; any refund in such cases is at
          the Company&rsquo;s sole discretion.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={5} title="How to request a refund">
        <BfLegalP>
          Email <BfLegalEmail email={LEGAL_SUPPORT_EMAIL} /> from your registered email
          address with your order ID, the reason for the request, and any supporting
          details. We will review and respond within 21 business days.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={6} title="How refunds are paid">
        <BfLegalP>
          Approved refunds are made to the original payment method via our payment
          gateway, Razorpay. Once approved, refunds are typically credited within 7–14
          business days, subject to your bank or card issuer&rsquo;s processing time. We
          do not charge a processing fee for refunds we approve.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={7} title="Cancellations">
        <BfLegalP>
          Because Services are delivered and consumed on access, orders cannot be
          cancelled once placed. Any recurring plan (if offered) may be cancelled before
          its next billing date to stop future charges; amounts already billed are
          non-refundable except as set out in Section 3.
        </BfLegalP>
      </BfLegalSection>

      <BfLegalSection number={8} title="Contact">
        <BfLegalP>
          For refund or cancellation queries, contact our Grievance Officer / support
          team at <BfLegalEmail email={LEGAL_SUPPORT_EMAIL} />, Gachibowli, Hyderabad,
          Telangana, India.
        </BfLegalP>
      </BfLegalSection>
    </BfLegalShell>
  );
}
