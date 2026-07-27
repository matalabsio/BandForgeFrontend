"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { BfSeoLeadAnswer } from "@/components/seo/bf-seo-lead-answer";
import {
  FAQ_CATEGORIES,
  SITE_FAQ,
  type FaqCategoryId,
} from "@/lib/seo/faq-content";
import { cn } from "@/lib/utils";

type CategoryFilter = FaqCategoryId | "all";

export function FaqClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITE_FAQ.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      const haystack = `${item.question} ${item.leadAnswer} ${item.detail ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category]);

  return (
    <div className="bf-container mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
      <label className="relative block">
        <span className="sr-only">Search FAQ</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-light"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="h-12 w-full rounded-full border border-border-soft bg-white py-3 pr-4 pl-11 text-sm text-navy placeholder:text-muted-light transition-colors duration-200 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/20"
        />
      </label>

      <div
        className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="FAQ categories"
      >
        {FAQ_CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-[0.8125rem] font-semibold transition-[background-position,box-shadow,border-color,color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                active
                  ? "border-transparent bg-[linear-gradient(90deg,#0097a7_0%,#00bcd4_50%,#0097a7_100%)] bg-[length:200%_100%] bg-left text-white shadow-[0_8px_22px_rgb(0_151_167/0.28)] hover:bg-right hover:shadow-[0_14px_32px_rgb(0_151_167/0.38)]"
                  : "border-border-soft bg-white text-navy hover:border-[#0097a7]/40 hover:text-[#0097a7]",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="rounded-[1.25rem] border border-border-soft bg-white px-6 py-10 text-center">
            <p className="font-display text-base font-bold text-navy">
              No matching questions
            </p>
            <p className="mt-2 text-sm text-muted">
              Try another search, or{" "}
              <Link
                href="/contact"
                prefetch
                className="font-semibold text-cyan transition-colors hover:text-brand-sky-hover"
              >
                contact support
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-4 cursor-pointer text-sm font-semibold text-navy underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-soft overflow-hidden rounded-[1.25rem] border border-border-soft bg-white">
            {filtered.map((item) => (
              <details
                key={item.question}
                className="group px-4 sm:px-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30 sm:py-5">
                  <h2 className="font-display text-[0.9375rem] font-semibold text-navy sm:text-base">
                    {item.question}
                  </h2>
                  <span
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border-soft text-muted transition-transform duration-200 group-open:rotate-45 group-open:border-cyan/40 group-open:text-cyan"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="pb-5">
                  <BfSeoLeadAnswer className="text-sm sm:text-[0.9375rem]">
                    {item.leadAnswer}
                  </BfSeoLeadAnswer>
                  {item.detail ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center font-mono text-[0.6875rem] text-muted-light">
        {filtered.length} of {SITE_FAQ.length} questions
      </p>
    </div>
  );
}
