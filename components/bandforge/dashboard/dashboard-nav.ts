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
  TrendIcon,
} from "@/components/bandforge/dashboard/icons";

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
    items: [{ label: "Dashboard", href: "/dashboard", Icon: HomeIcon }],
  },
  {
    title: "Practice",
    items: [
      { label: "Listening", href: "/test/listening", Icon: HeadphonesIcon },
      { label: "Reading", href: "/test/reading", Icon: BookIcon },
      {
        label: "Writing",
        href: "/test/writing",
        Icon: PencilIcon,
        disabled: true,
      },
      {
        label: "Speaking",
        href: "/test/speaking",
        Icon: MicIcon,
        disabled: true,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Performance", href: "/scores", Icon: BarChartIcon },
      { label: "Progress", href: "/dashboard", Icon: TrendIcon },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Mock Tests", href: "/dashboard", Icon: LayoutGridIcon },
      { label: "Study Plan", href: "/dashboard", Icon: FileTextIcon, disabled: true },
    ],
  },
];
