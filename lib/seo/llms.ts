import { SITE_ENTITY_DESCRIPTION } from "@/lib/seo/metadata";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  HUMAN_REVIEW_SLA,
  OPERATOR_LOCATION,
  OPERATOR_NAME,
  SPRINT_MOCK_COUNT,
  SPRINT_PLANS,
  SPRINT_TASK_COUNT,
  formatPriceInr,
} from "@/lib/seo/claims";
import { buildKeywordMapLlmsSection } from "@/lib/seo/keyword-map";
import { siteUrl } from "@/lib/site";

type LlmsLink = {
  title: string;
  path: string;
  description: string;
};

function linkLine({ title, path, description }: LlmsLink): string {
  return `- [${title}](${siteUrl(path)}): ${description}`;
}

function linkSection(title: string, links: LlmsLink[]): string {
  const lines = links.map(linkLine);
  return `## ${title}\n\n${lines.join("\n")}`;
}

/**
 * Spec-compliant llms.txt body for AI crawlers (https://llmstxt.org/).
 * Lists only live public URLs (mirrors sitemap live paths subset).
 */
export function buildLlmsTxt(): string {
  const sprintPriceLines = SPRINT_PLANS.map(
    (plan) => `- ${plan.name}: ${formatPriceInr(plan.priceInr)}`,
  );

  const body = [
    "# BandForge",
    "",
    `> ${SITE_ENTITY_DESCRIPTION}`,
    "",
    "- Free IELTS diagnostic with section-wise band scores",
    `- Diagnostic takes ${DIAGNOSTIC_DURATION_MINUTES} minutes`,
    ...sprintPriceLines,
    "- Program access: personalised plan until your exam date",
    `- Practice hubs: 48 (12 per skill)`,
    `- Mock unlocked on completion: ${SPRINT_MOCK_COUNT}`,
    `- Evaluation: AI practice plus Band 9-trained human review ${HUMAN_REVIEW_SLA}`,
    "- Completion Guarantee: finish all 12 tasks with no improvement and get a free extension",
    `- Operator: ${OPERATOR_NAME}, ${OPERATOR_LOCATION}`,
    "- Audience: Telugu- and Urdu-speaking students in Telangana and Andhra Pradesh",
    "",
    linkSection("Product", [
      {
        title: "BandForge Home",
        path: "/",
        description:
          "IELTS prep for Telugu and Urdu speakers — free diagnostic and Full Skill Program (Rs. 2499).",
      },
      {
        title: "Free IELTS Diagnostic",
        path: "/diagnostic",
        description:
          "15-minute free diagnostic with section-wise band scores. No payment required.",
      },
      {
        title: "BandForge Pricing",
        path: "/pricing",
        description:
          "Full Skill Program — Rs. 2499 one-time. Diagnostic always free.",
      },
      {
        title: "IELTS Writing Sprint",
        path: "/writing",
        description:
          "Writing practice within the Full Skill Program — AI + Band 9 human review within 48 hours.",
      },
      {
        title: "IELTS Speaking Sprint",
        path: "/speaking",
        description:
          "Speaking practice within the Full Skill Program — AI analysis and Band 9 human review within 48 hours.",
      },
    ]),
    "",
    linkSection("Learn more", [
      {
        title: "About BandForge",
        path: "/about",
        description: "Online IELTS platform from MATA Labs in Hyderabad for AP and TG students.",
      },
      {
        title: "IELTS for Telugu Speakers",
        path: "/telugu",
        description: "IELTS coaching built for Telugu-speaking students in AP and Telangana.",
      },
      {
        title: "IELTS for Urdu Speakers",
        path: "/urdu",
        description: "Hyderabad-built IELTS platform for Urdu-speaking test takers.",
      },
      {
        title: "IELTS Coaching in Hyderabad",
        path: "/hyderabad",
        description: "Online IELTS prep from Gachibowli, Hyderabad — Full Skill Program Rs. 2499.",
      },
      {
        title: "BandForge FAQ",
        path: "/faq",
        description: "Answers on diagnostics, sprints, pricing, and the Completion Guarantee.",
      },
      {
        title: "BandForge vs Coaching Centres",
        path: "/vs-coaching-centres",
        description: "Honest comparison of BandForge online sprints vs traditional coaching.",
      },
      {
        title: "BandForge Blog",
        path: "/blog",
        description: "IELTS tips and guides for Telugu- and Urdu-speaking students.",
      },
      {
        title: "BandForge Features",
        path: "/features",
        description: "Realistic IELTS mocks, AI evaluation, speaking analysis, and practice.",
      },
      {
        title: "How BandForge Works",
        path: "/how-it-works",
        description: "Mock test, feedback, and focused practice loop for IELTS learners.",
      },
      {
        title: "Contact BandForge",
        path: "/contact",
        description: "Partnerships, product enquiries, and support for BandForge IELTS prep.",
      },
    ]),
    "",
    linkSection("Optional", [
      {
        title: "Privacy Policy",
        path: "/privacy-policy",
        description: "How BandForge collects, uses, and protects personal data.",
      },
      {
        title: "Terms of Service",
        path: "/terms",
        description: "Terms governing access to the BandForge platform and services.",
      },
      {
        title: "Refund Policy",
        path: "/refund-policy",
        description: "Refund and cancellation terms for digital learning products.",
      },
    ]),
    "",
    buildKeywordMapLlmsSection(),
  ];

  return `${body.join("\n")}\n`;
}
