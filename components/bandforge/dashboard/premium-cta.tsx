import Link from "next/link";
import { ArrowRightIcon, CrownIcon } from "@/components/bandforge/dashboard/icons";

export function PremiumCta() {
  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <CrownIcon className="size-4" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-[#0F172A]">Go Premium</p>
          <p className="text-[11px] text-[#0F172A]/50">
            Unlimited mocks & AI feedback
          </p>
        </div>
      </div>
      <Link
        href="/features"
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#1e293b]"
      >
        Upgrade Now
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}
