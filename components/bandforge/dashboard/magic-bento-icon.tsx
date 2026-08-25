import type { ComponentType } from "react";
import {
  CalendarDays,
  Crosshair,
  Flame,
  LayoutGrid,
  Pencil,
  Play,
  Target,
  BarChart3,
  type LucideProps,
} from "lucide-react";
import type { MagicBentoCardIcon } from "@/components/bandforge/dashboard/magic-bento-types";

const ICON_MAP: Record<
  MagicBentoCardIcon,
  ComponentType<LucideProps>
> = {
  practice: Play,
  progress: Target,
  skills: BarChart3,
  focus: Crosshair,
  hubs: LayoutGrid,
  streak: Flame,
  writing: Pencil,
};

export function MagicBentoCalendarIcon({ className }: { className?: string }) {
  return <CalendarDays className={className} strokeWidth={2.25} aria-hidden />;
}

export function MagicBentoIcon({
  name,
  className,
}: {
  name: MagicBentoCardIcon;
  className?: string;
}) {
  const Icon = ICON_MAP[name];
  return <Icon className={className} strokeWidth={2.25} aria-hidden />;
}
