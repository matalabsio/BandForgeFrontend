import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleHelp,
  FileText,
  GitCompareArrows,
  Languages,
  MapPin,
  Newspaper,
  Receipt,
  Scale,
  Shield,
  Tag,
} from "lucide-react";

// Temporarily hidden — product routes
// export const BF_FOOTER_PRODUCT = [...]

export type BfFooterLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** SEO / audience landing pages. */
export const BF_FOOTER_RESOURCES: readonly BfFooterLink[] = [
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/telugu", label: "Telugu speakers", icon: Languages },
  { href: "/urdu", label: "Urdu speakers", icon: Languages },
  { href: "/hyderabad", label: "Hyderabad", icon: MapPin },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/vs-coaching-centres", label: "vs Coaching", icon: GitCompareArrows },
  { href: "/blog", label: "Blog", icon: Newspaper },
] as const;

export const BF_FOOTER_LEGAL: readonly BfFooterLink[] = [
  { href: "/privacy-policy", label: "Privacy", icon: Shield },
  { href: "/terms", label: "Terms", icon: FileText },
  { href: "/refund-policy", label: "Refunds", icon: Receipt },
] as const;

export type BfFooterColumn = {
  title: string;
  icon: LucideIcon;
  links: readonly BfFooterLink[];
};

/** Footer — SEO + Legal (product / company hidden for now). */
export const BF_FOOTER_COLUMNS: readonly BfFooterColumn[] = [
  { title: "IELTS prep", icon: BookOpen, links: BF_FOOTER_RESOURCES },
  { title: "Legal", icon: Scale, links: BF_FOOTER_LEGAL },
] as const;

export const BF_FOOTER_YEAR = 2026;
