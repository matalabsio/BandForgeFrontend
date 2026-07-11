export const legalLinks = [
  {
    href: "/privacy-policy",
    label: "Privacy policy",
    shortLabel: "Privacy",
  },
  {
    href: "/terms",
    label: "Terms of service",
    shortLabel: "Terms",
  },
  {
    href: "/refund-policy",
    label: "Refund policy",
    shortLabel: "Refunds",
  },
] as const;

export type LegalLinkHref = (typeof legalLinks)[number]["href"];
