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
  { href: "/#how", label: "How it works", icon: "route" },
  { href: "/#modules", label: "Modules", icon: "layout-grid" },
  { href: "/about", label: "About", icon: "users" },
  { href: "/#pricing", label: "Pricing", icon: "tag" },
] as const;

export const BF_MARKETING_NAV_LEGAL: readonly MarketingNavItem[] = [
  { href: "/privacy-policy", label: "Privacy", icon: "shield" },
  { href: "/terms", label: "Terms", icon: "file-text" },
  { href: "/refund-policy", label: "Refunds", icon: "rotate-ccw" },
] as const;
