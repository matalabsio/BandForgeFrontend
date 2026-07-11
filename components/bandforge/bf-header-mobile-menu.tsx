"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import type { MarketingNavItem } from "@/components/bandforge/bf-marketing-nav";
import { BfMarketingNavIcon } from "@/components/bandforge/bf-marketing-nav-icon";

type Props = {
  items: readonly MarketingNavItem[];
};

export function BfHeaderMobileMenu({ items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-slate-700 transition-colors duration-200 hover:bg-gray-50"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-border-soft bg-white/95 p-2 shadow-xl backdrop-blur-md">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="inline-flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
              >
                <BfMarketingNavIcon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
