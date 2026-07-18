import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BookIcon,
  FileTextIcon,
  HeadphonesIcon,
  HomeIcon,
  LayoutGridIcon,
  MicIcon,
  PencilIcon,
  UserIcon,
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

export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: "",
    items: [{ label: "Dashboard", href: "/dashboard", Icon: HomeIcon }],
  },
  {
    title: "Study Plan",
    items: [
      { label: "Today's Plan", href: "/study-plan/today", Icon: FileTextIcon },
      { label: "Full Plan", href: "/study-plan", Icon: FileTextIcon, indent: true },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Listening", href: "/practice/listening", Icon: HeadphonesIcon },
      { label: "Reading", href: "/practice/reading", Icon: BookIcon },
      { label: "Writing", href: "/practice/writing", Icon: PencilIcon },
      { label: "Speaking", href: "/practice/speaking", Icon: MicIcon },
    ],
  },
  {
    title: "Progress",
    items: [
      { label: "Performance", href: "/scores", Icon: BarChartIcon },
      { label: "Diagnostic Report", href: "/diagnostic/report", Icon: FileTextIcon },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Content Library", href: "/content-library", Icon: LayoutGridIcon },
      { label: "Mock tests", href: "/test", Icon: FileTextIcon },
    ],
  },
  {
    title: "",
    items: [{ label: "Settings", href: "/profile", Icon: UserIcon }],
  },
];

export const MOBILE_BOTTOM_NAV: NavLink[] = [
  { label: "Home", href: "/dashboard", Icon: HomeIcon },
  { label: "Today", href: "/study-plan/today", Icon: FileTextIcon },
  { label: "Practice", href: "/practice/listening", Icon: HeadphonesIcon },
  { label: "Scores", href: "/scores", Icon: BarChartIcon },
  { label: "Profile", href: "/profile", Icon: UserIcon },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/study-plan") {
    return pathname === "/study-plan";
  }
  if (href === "/study-plan/today") {
    return pathname.startsWith("/study-plan/today");
  }
  if (href.startsWith("/practice/")) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === "/test") {
    return pathname === "/test" || pathname.startsWith("/test/");
  }
  if (href !== "/dashboard" && href !== "/profile") {
    return pathname.startsWith(href);
  }
  return false;
}
