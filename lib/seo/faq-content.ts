/** Site-wide FAQ for /faq — AEO-first answers (lead sentence ≤50 words). */

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_LAST_UPDATED = "22 July 2026";

export const SITE_FAQ: FaqItem[] = [
  {
    question: "What is BandForge?",
    answer:
      "BandForge is an online IELTS preparation platform built for Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh. You start with a free 15-minute diagnostic, then choose targeted skill sprints from ₹999 with AI practice and Band 9-trained human review.",
  },
  {
    question: "Is the IELTS diagnostic really free?",
    answer:
      "Yes. The BandForge diagnostic is completely free — no payment or subscription required. You get section-wise band scores in about 15 minutes so you know your real level before spending on coaching.",
  },
  {
    question: "How long does the free diagnostic take?",
    answer:
      "The diagnostic takes 15 minutes. It covers Listening, Reading, Writing, and Speaking sections and gives you section-wise band scores — not just an overall guess.",
  },
  {
    question: "What is an IELTS skill sprint?",
    answer:
      "A sprint is a focused 90-day plan for one or more IELTS skills. Each sprint includes 12 practice tasks, AI feedback, and Band 9-trained human review within 48 hours. Complete all tasks to unlock one full mock test.",
  },
  {
    question: "How much do BandForge sprints cost?",
    answer:
      "Writing Sprint and Speaking Sprint are ₹999 each. Dual Sprint (Writing + Speaking) is ₹1,799. All Skills Sprint is ₹2,999. The diagnostic is always free regardless of which sprint you choose.",
  },
  {
    question: "How long do I have access to a sprint?",
    answer:
      "Sprint access lasts 90 days from activation. You get 12 tasks during that period. If you finish all 12 tasks with no band improvement, the Completion Guarantee gives you a free extension.",
  },
  {
    question: "How fast is human writing and speaking review?",
    answer:
      "Band 9-trained evaluators review your writing and speaking submissions within 48 hours. AI practice feedback is instant on objective sections like Reading and Listening.",
  },
  {
    question: "What is the Completion Guarantee?",
    answer:
      "Finish all 12 sprint tasks with no measurable band improvement and BandForge extends your access for free. This applies to paid sprints — terms are in our refund policy.",
  },
  {
    question: "Is BandForge only for Telugu and Urdu speakers?",
    answer:
      "BandForge is built primarily for Telugu- and Urdu-speaking students in AP, Telangana, and Hyderabad. The platform, support, and study paths are tuned for Indian test takers targeting Band 7+.",
  },
  {
    question: "Can I prepare on my phone?",
    answer:
      "Yes. BandForge works on mobile browsers with thumb-friendly controls and readable passages. Take the diagnostic or practice whenever you have focus time — no classroom schedule required.",
  },
  {
    question: "Where is BandForge based?",
    answer:
      "BandForge is operated by MATA Labs OPC Private Limited from Hyderabad, Telangana, India. We serve students across Telangana, Andhra Pradesh, and online learners from Hyderabad and beyond.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payments are processed securely via Razorpay. Your sprint activates immediately after payment is verified. For refund and cancellation terms, see our refund policy or contact support@bandforge.study.",
  },
];

/** First sentence of an answer — used for AEO lead blocks and schema snippets. */
export function faqLeadAnswer(answer: string): string {
  const match = answer.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : answer;
}
