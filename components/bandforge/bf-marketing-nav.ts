export type MarketingNavIconName =
  | "route"
  | "layout-grid"
  | "users"
  | "tag"
  | "sparkles"
  | "play-circle"
  | "smartphone"
  | "message-square"
  | "mail"
  | "shield"
  | "file-text"
  | "rotate-ccw";

export type MarketingNavItem = {
  href: string;
  label: string;
  icon: MarketingNavIconName;
};

export const BF_MARKETING_NAV: readonly MarketingNavItem[] = [
  { href: "/diagnostic", label: "Free diagnostic", icon: "play-circle" },
  { href: "/pricing", label: "Pricing", icon: "tag" },
  { href: "/faq", label: "FAQ", icon: "message-square" },
  { href: "/how-it-works", label: "How it works", icon: "route" },
  { href: "/about", label: "About", icon: "users" },
] as const;

export const BF_MARKETING_NAV_LEGAL: readonly MarketingNavItem[] = [
  { href: "/privacy-policy", label: "Privacy", icon: "shield" },
  { href: "/terms", label: "Terms", icon: "file-text" },
  { href: "/refund-policy", label: "Refunds", icon: "rotate-ccw" },
] as const;
