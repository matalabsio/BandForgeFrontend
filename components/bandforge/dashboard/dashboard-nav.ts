import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  FileTextIcon,
  HeadphonesIcon,
  HomeIcon,
} from "@/components/bandforge/dashboard/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavLink = {
  label: string;
  href: string;
  Icon: Icon;
  disabled?: boolean;
  indent?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavLink[];
};

/** Primary destinations — flat list, no section titles. */
export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: "",
    items: [
      { label: "Dashboard", href: "/dashboard", Icon: HomeIcon },
      { label: "Study Plan", href: "/study-plan", Icon: FileTextIcon },
      { label: "Practice", href: "/practice", Icon: HeadphonesIcon },
      { label: "Mock tests", href: "/test", Icon: FileTextIcon },
      { label: "Progress", href: "/scores", Icon: BarChartIcon },
    ],
  },
];

export const MOBILE_BOTTOM_NAV: NavLink[] = [
  { label: "Home", href: "/dashboard", Icon: HomeIcon },
  { label: "Plan", href: "/study-plan", Icon: FileTextIcon },
  { label: "Practice", href: "/practice", Icon: HeadphonesIcon },
  { label: "Mocks", href: "/test", Icon: FileTextIcon },
  { label: "Progress", href: "/scores", Icon: BarChartIcon },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/study-plan") {
    return pathname === "/study-plan" || pathname.startsWith("/study-plan/");
  }
  if (href === "/practice" || href.startsWith("/practice/")) {
    return pathname === "/practice" || pathname.startsWith("/practice/");
  }
  if (href === "/test") {
    return pathname === "/test" || pathname.startsWith("/test/");
  }
  if (href === "/scores") {
    return pathname === "/scores" || pathname.startsWith("/scores/");
  }
  if (href !== "/dashboard" && href !== "/profile") {
    return pathname.startsWith(href);
  }
  return false;
}
