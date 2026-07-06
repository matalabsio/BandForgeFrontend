/** Static pricing FAQ — separate module so SSR/client always share one source. */
export const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: "Is my payment secure?",
    a: "Yes. Razorpay processes the payment. BandForge does not store card or UPI details.",
  },
  {
    q: "When is my plan activated?",
    a: "Immediately after your payment is verified.",
  },
  {
    q: "What if payment fails?",
    a: "No plan is activated. You can try again from this page.",
  },
  {
    q: "How do I test payments?",
    a: "Netbanking → Success is fastest. UPI: on desktop scan the QR with PhonePe/GPay; on mobile pick your UPI app. Cards: Add new card with domestic test numbers only — Visa 4111 1111 1111 1111 or Mastercard 5267 3181 8797 5449 (any expiry/CVV). International test cards (5555...) and real foreign cards are rejected. Uncheck Save card; disable browser autofill on saved cards.",
  },
  {
    q: "Why does OTP fail even with 6 digits?",
    a: 'The "Securely saving your card" screen is save-card tokenization (real SMS to your phone). The red "Please enter a 6 digit OTP" usually means wrong or expired SMS code, not missing digits. Skip OTP, uncheck Save card, or use the latest SMS. Payment OTP after Pay accepts any 4-10 digits in test mode.',
  },
  {
    q: "Where can I see receipts?",
    a: "In your dashboard under Plan & billing.",
  },
];
