import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";

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
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: { bgColor?: string; textColor?: string };
};

/** Primary marketing nav — Dashboard CTA for now. */
export const BF_MARKETING_NAV: readonly MarketingNavItem[] = [
  // Temporarily hidden — product routes
  // {
  //   href: "/how-it-works",
  //   label: "The Method",
  //   ariaLabel: "The Method",
  //   icon: "route",
  //   rotation: -8,
  //   hoverStyles: { bgColor: "#0097a7", textColor: "#ffffff" },
  // },
  // {
  //   href: "/drills",
  //   label: "The Drills",
  //   ariaLabel: "The Drills — Four modules",
  //   icon: "layout-grid",
  //   rotation: 8,
  //   hoverStyles: { bgColor: "#00bcd4", textColor: "#ffffff" },
  // },
  // {
  //   href: "/pricing",
  //   label: "Pricing",
  //   ariaLabel: "Pricing",
  //   icon: "tag",
  //   rotation: 8,
  //   hoverStyles: { bgColor: "#0d1f3c", textColor: "#ffffff" },
  // },
  {
    href: marketingAppHref("/dashboard"),
    label: "Dashboard",
    ariaLabel: "Open your dashboard",
    icon: "play-circle",
    rotation: -8,
    hoverStyles: { bgColor: "#0097a7", textColor: "#ffffff" },
  },
];

/** Nav item used as the primary auth/app CTA (Dashboard). */
export const BF_MARKETING_START_CTA_LABEL = "Dashboard";

export const BF_MARKETING_NAV_LEGAL: readonly MarketingNavItem[] = [
  { href: "/privacy-policy", label: "Privacy", icon: "shield" },
  { href: "/terms", label: "Terms", icon: "file-text" },
  { href: "/refund-policy", label: "Refunds", icon: "rotate-ccw" },
];
