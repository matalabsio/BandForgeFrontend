import type { ComponentType, SVGProps } from "react";
import {
  BookIcon,
  CalendarIcon,
  ClipboardIcon,
  FileTextIcon,
  HomeIcon,
} from "@/components/bandforge/dashboard/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavLink = {
  label: string;
  /** Shorter label for the mobile tab bar */
  shortLabel?: string;
  href: string;
  Icon: Icon;
  disabled?: boolean;
  disabledHint?: string;
  indent?: boolean;
  /** Mobile tab that opens the daily report instead of navigating. */
  action?: "open-report";
};

export type NavGroup = {
  title: string;
  items: NavLink[];
};

type NavOptions = {
  /** Full mocks unlock after the personalized practice plan is complete. */
  mockUnlocked?: boolean;
};

/** Sidebar — primary routes. Complete Mock unlocks after the practice plan. */
export function getDashboardNav({
  mockUnlocked = false,
}: NavOptions = {}): NavGroup[] {
  return [
    {
      title: "",
      items: [
        { label: "Today", href: "/dashboard", Icon: HomeIcon },
        { label: "Full plan", href: "/study-plan", Icon: CalendarIcon },
        {
          label: "Complete Mock",
          shortLabel: "Mock",
          href: "/test",
          Icon: FileTextIcon,
          disabled: !mockUnlocked,
          disabledHint: "Finish your personalized practice plan to unlock mocks",
        },
        { label: "Library", href: "/content-library", Icon: BookIcon },
      ],
    },
  ];
}

/** Mobile / tablet tab bar — primary routes plus Report (no sidebar below lg). */
export function getMobileBottomNav({
  mockUnlocked = false,
}: NavOptions = {}): NavLink[] {
  const items = [...(getDashboardNav({ mockUnlocked })[0]?.items ?? [])];
  items.push({
    label: "Report card",
    shortLabel: "Report",
    href: "#report",
    Icon: ClipboardIcon,
    action: "open-report",
  });
  return items;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/study-plan") {
    return pathname === "/study-plan" || pathname.startsWith("/study-plan/");
  }
  if (href === "/test") {
    return pathname === "/test" || pathname.startsWith("/test/");
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
