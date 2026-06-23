import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
  Mic,
  ScrollText,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  exact?: boolean;
  description?: string;
};

export type AdminNavGroup = {
  title?: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        Icon: LayoutDashboard,
        exact: true,
        description: "Metrics and quick actions",
      },
      {
        href: "/admin/users",
        label: "Users",
        Icon: Users,
        description: "Accounts and activity",
      },
      {
        href: "/admin/mocks",
        label: "Mock tests",
        Icon: ClipboardList,
        description: "Content catalog and ingest",
      },
      {
        href: "/admin/speaking",
        label: "Evaluator",
        Icon: Mic,
        description: "Speaking review queue",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        href: "/admin/settings/audit",
        label: "Audit log",
        Icon: ScrollText,
        description: "Admin action history",
      },
    ],
  },
];
