import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BookIcon,
  CrownIcon,
  FileTextIcon,
  FlameIcon,
  HeadphonesIcon,
  HomeIcon,
  LayoutGridIcon,
  MicIcon,
  PencilIcon,
  UserIcon,
} from "@/components/bandforge/dashboard/icons";
import { shortModuleExamPath } from "@/lib/mock-catalog";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavLink = {
  label: string;
  href: string;
  Icon: Icon;
  disabled?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavLink[];
};

export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: "",
    items: [{ label: "Home", href: "/dashboard", Icon: HomeIcon }],
  },
  {
    title: "Tests",
    items: [
      {
        label: "Listening",
        href: shortModuleExamPath(1, "listening"),
        Icon: HeadphonesIcon,
      },
      {
        label: "Reading",
        href: shortModuleExamPath(1, "reading"),
        Icon: BookIcon,
      },
      {
        label: "Writing",
        href: "/test/writing",
        Icon: PencilIcon,
      },
      {
        label: "Speaking",
        href: shortModuleExamPath(1, "speaking"),
        Icon: MicIcon,
      },
    ],
  },
  {
    title: "Progress",
    items: [
      { label: "Performance", href: "/scores", Icon: BarChartIcon },
      { label: "Streak", href: "/streak", Icon: FlameIcon },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Content Library", href: "/content-library", Icon: LayoutGridIcon },
      { label: "Study Plan", href: "/study-plan", Icon: FileTextIcon },
      { label: "Plans", href: "/plan", Icon: CrownIcon },
    ],
  },
];

export const MOBILE_BOTTOM_NAV: NavLink[] = [
  { label: "Home", href: "/dashboard", Icon: HomeIcon },
  { label: "Tests", href: "/test", Icon: FileTextIcon },
  { label: "Progress", href: "/scores", Icon: BarChartIcon },
  { label: "Content", href: "/content-library", Icon: LayoutGridIcon },
  { label: "Profile", href: "/profile", Icon: UserIcon },
];
