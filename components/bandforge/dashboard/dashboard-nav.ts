import type { ComponentType, SVGProps } from "react";
import {
  BookIcon,
  CalendarIcon,
  ClipboardIcon,
  FileTextIcon,
  HomeIcon,
  MicIcon,
  PencilIcon,
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
  /** Show Writing when the user has writing practice access (FSP or Writing Skill). */
  showWritingNav?: boolean;
  /** Show Speaking when the user has speaking practice access (FSP or Speaking Skill). */
  showSpeakingNav?: boolean;
};

/** Sidebar — primary routes. Complete Mock unlocks after the practice plan. */
export function getDashboardNav({
  mockUnlocked = false,
  showWritingNav = false,
  showSpeakingNav = false,
}: NavOptions = {}): NavGroup[] {
  const items: NavLink[] = [
    { label: "Today", href: "/dashboard", Icon: HomeIcon },
    { label: "Full plan", href: "/study-plan", Icon: CalendarIcon },
  ];
  if (showWritingNav) {
    items.push({
      label: "Writing",
      href: "/practice/writing",
      Icon: PencilIcon,
    });
  }
  if (showSpeakingNav) {
    items.push({
      label: "Speaking",
      href: "/practice/speaking",
      Icon: MicIcon,
    });
  }
  items.push(
    {
      label: "Complete Mock",
      shortLabel: "Mock",
      href: "/test",
      Icon: FileTextIcon,
      disabled: !mockUnlocked,
      disabledHint: "Finish your personalized practice plan to unlock mocks",
    },
    { label: "Library", href: "/content-library", Icon: BookIcon },
  );
  return [{ title: "", items }];
}

/** Mobile / tablet tab bar — Writing/Speaking when entitled; no Complete Mock. */
export function getMobileBottomNav({
  showWritingNav = false,
  showSpeakingNav = false,
}: NavOptions = {}): NavLink[] {
  const items: NavLink[] = [
    { label: "Today", href: "/dashboard", Icon: HomeIcon },
    { label: "Full plan", href: "/study-plan", Icon: CalendarIcon },
  ];
  if (showWritingNav) {
    items.push({
      label: "Writing",
      href: "/practice/writing",
      Icon: PencilIcon,
    });
  }
  if (showSpeakingNav) {
    items.push({
      label: "Speaking",
      href: "/practice/speaking",
      Icon: MicIcon,
    });
  }
  items.push(
    { label: "Library", href: "/content-library", Icon: BookIcon },
    {
      label: "Report card",
      shortLabel: "Report",
      href: "#report",
      Icon: ClipboardIcon,
      action: "open-report",
    },
  );
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
  if (href === "/practice/writing") {
    return (
      pathname === "/practice/writing" ||
      pathname.startsWith("/practice/writing/")
    );
  }
  if (href === "/practice/speaking") {
    return (
      pathname === "/practice/speaking" ||
      pathname.startsWith("/practice/speaking/")
    );
  }
  if (href !== "/dashboard" && href !== "/profile") {
    return pathname.startsWith(href);
  }
  return false;
}
