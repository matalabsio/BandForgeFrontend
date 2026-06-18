import Link from "next/link";
import {
  BookIcon,
  HeadphonesIcon,
  MicIcon,
  PencilIcon,
} from "@/components/bandforge/dashboard/icons";
import { BRAND_DASHBOARD_EMPTY_MODULES } from "@/lib/brand-mock-data";
import type { ModuleKey } from "@/lib/brand-mock-data";
import type { ComponentType, SVGProps } from "react";

const moduleIcons: Record<
  ModuleKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  listening: HeadphonesIcon,
  reading: BookIcon,
  writing: PencilIcon,
  speaking: MicIcon,
};

export function DashboardEmptyModules() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-muted-light uppercase">
          Your modules
        </span>
        <span className="font-mono text-[0.6875rem] text-muted-light">
          0 / 4 tested
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {BRAND_DASHBOARD_EMPTY_MODULES.map((mod) => {
          const Icon = moduleIcons[mod.key];
          return (
            <li
              key={mod.key}
              className="flex items-center gap-3.5 rounded-[0.875rem] border border-border-soft border-l-[3px] border-l-cyan bg-white px-4 py-[15px]"
            >
              <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] bg-cyan-soft text-cyan">
                <Icon className="size-[22px]" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display mb-1.5 text-base font-bold tracking-tight text-navy">
                  {mod.title}
                </p>
                <div className="h-1.5 rounded-sm bg-[#edf1f6]" />
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-2xl leading-none font-medium text-[#cbd5e1]">
                  —
                </p>
                <p className="mt-1 text-[0.65625rem] text-muted-light">
                  Not yet tested
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
