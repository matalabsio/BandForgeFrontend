import { marketingAppHref } from "@/components/bandforge/bf-marketing-auth-links";

export const BF_FOOTER_PRODUCT = [
  { href: "/diagnostic", label: "Free diagnostic" },
  { href: "/writing", label: "Writing Sprint" },
  { href: "/speaking", label: "Speaking Sprint" },
  { href: "/how-it-works", label: "Mock tests" },
  { href: "/pricing", label: "Pricing" },
  { href: marketingAppHref(), label: "Practice" },
] as const;

export const BF_FOOTER_RESOURCES = [
  { href: "/telugu", label: "Telugu speakers" },
  { href: "/urdu", label: "Urdu speakers" },
  { href: "/hyderabad", label: "Hyderabad" },
  { href: "/faq", label: "FAQ" },
  { href: "/vs-coaching-centres", label: "vs Coaching" },
  { href: "/blog", label: "Blog" },
] as const;

export const BF_FOOTER_COMPANY = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const BF_FOOTER_LEGAL = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
] as const;

/** Full footer — Product / IELTS prep / Company / Legal */
export const BF_FOOTER_COLUMNS = [
  { title: "Product", links: BF_FOOTER_PRODUCT },
  { title: "IELTS prep", links: BF_FOOTER_RESOURCES },
  { title: "Company", links: BF_FOOTER_COMPANY },
  { title: "Legal", links: BF_FOOTER_LEGAL },
] as const;

export const BF_FOOTER_YEAR = 2026;
