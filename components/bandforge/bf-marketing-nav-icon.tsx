"use client";

import type { LucideIcon } from "lucide-react";
import {
  FileText,
  LayoutGrid,
  Mail,
  MessageSquare,
  PlayCircle,
  RotateCcw,
  Route,
  Shield,
  Smartphone,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";

import type { MarketingNavIconName } from "@/components/bandforge/bf-marketing-nav";
import { cn } from "@/lib/utils";

const iconMap: Record<MarketingNavIconName, LucideIcon> = {
  route: Route,
  "layout-grid": LayoutGrid,
  users: Users,
  tag: Tag,
  sparkles: Sparkles,
  "play-circle": PlayCircle,
  smartphone: Smartphone,
  "message-square": MessageSquare,
  mail: Mail,
  shield: Shield,
  "file-text": FileText,
  "rotate-ccw": RotateCcw,
};

type Props = {
  name: MarketingNavIconName;
  className?: string;
};

export function BfMarketingNavIcon({ name, className }: Props) {
  const Icon = iconMap[name];

  return (
    <Icon
      className={cn("size-4 shrink-0 text-cyan/80", className)}
      strokeWidth={2}
      aria-hidden
    />
  );
}
