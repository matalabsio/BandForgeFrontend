import type { ComponentType, SVGProps } from "react";
import {
  BookIcon,
  CalendarIcon,
  FlameIcon,
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

/** Sidebar — primary routes. Full mocks unlock after the practice plan. */
export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: "",
    items: [
      { label: "Today", href: "/dashboard", Icon: HomeIcon },
      { label: "Streak", href: "/streak", Icon: FlameIcon },
      { label: "Full plan", href: "/study-plan", Icon: CalendarIcon },
      { label: "Practice", href: "/practice", Icon: HeadphonesIcon },
      { label: "Library", href: "/content-library", Icon: BookIcon },
    ],
  },
];

/** Mobile / tablet tab bar — full primary set (no sidebar drawer below lg). */
export const MOBILE_BOTTOM_NAV: NavLink[] = [
  { label: "Today", href: "/dashboard", Icon: HomeIcon },
  { label: "Streak", href: "/streak", Icon: FlameIcon },
  { label: "Plan", href: "/study-plan", Icon: CalendarIcon },
  { label: "Practice", href: "/practice", Icon: HeadphonesIcon },
  { label: "Library", href: "/content-library", Icon: BookIcon },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/streak") {
    return pathname === "/streak" || pathname.startsWith("/streak/");
  }
  if (href === "/study-plan") {
    return pathname === "/study-plan" || pathname.startsWith("/study-plan/");
  }
  if (href === "/practice" || href.startsWith("/practice/")) {
    return pathname === "/practice" || pathname.startsWith("/practice/");
  }
  if (href === "/content-library") {
    return (
      pathname === "/content-library" ||
      pathname.startsWith("/content-library/")
    );
  }
  if (href !== "/dashboard" && href !== "/profile") {
    return pathname.startsWith(href);
  }
  return false;
}
