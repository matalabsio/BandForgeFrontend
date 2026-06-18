"use client";

import { useState } from "react";
import { BookOpen, Lock, Search } from "lucide-react";
import Link from "next/link";
import { BfSectionEyebrow, BfSectionHeading } from "@/components/bandforge/ui";
import {
  BRAND_CONTENT_FILTERS,
  BRAND_CONTENT_LESSONS,
} from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

export function ContentLibraryExperience() {
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const lessons = BRAND_CONTENT_LESSONS.filter((l) => {
    const matchesFilter = filter === "All" || l.module === filter;
    const matchesQuery =
      !query.trim() ||
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.module.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const featured = BRAND_CONTENT_LESSONS.find((l) => l.featured);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <BfSectionEyebrow>Resources</BfSectionEyebrow>
          <BfSectionHeading className="mt-2">Content library</BfSectionHeading>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Lessons, drills, and vocabulary sets mapped to your study plan.
          </p>
        </div>
        <div className="relative hidden max-w-xs flex-1 lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons…"
            className="w-full rounded-full border border-border-muted py-2.5 pr-4 pl-10 text-sm text-navy outline-none focus:border-cyan"
          />
        </div>
      </header>

      {featured ? (
        <article className="relative overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute top-4 right-4 opacity-20">
            <BookOpen className="size-32 text-cyan" strokeWidth={1} />
          </div>
          <p className="font-mono text-xs tracking-[0.12em] text-cyan uppercase">
            Featured module
          </p>
          <h2 className="font-display mt-2 max-w-md text-2xl font-bold">
            {featured.title}
          </h2>
          <p className="mt-2 text-sm text-slate">
            {featured.module} · {featured.duration}
          </p>
          <Link
            href="#"
            className="mt-5 inline-flex rounded-full bg-cyan px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-sky-hover"
          >
            Start Module
          </Link>
        </article>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {BRAND_CONTENT_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-cyan text-white"
                : "border border-border-muted text-muted hover:border-cyan/40",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lessons
          .filter((l) => !l.featured)
          .map((lesson) => {
            const locked = "locked" in lesson && lesson.locked;
            return (
              <li
                key={lesson.id}
                className={cn(
                  "rounded-2xl border border-border-soft border-t-[3px] border-t-cyan bg-white p-5 shadow-sm",
                  locked && "opacity-90",
                )}
              >
                <p className="font-mono text-[0.6875rem] tracking-wide text-cyan uppercase">
                  {lesson.module}
                </p>
                <h3 className="font-display mt-1 text-base font-bold text-navy">
                  {lesson.title}
                </h3>
                {locked ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#d4a017]">
                    <Lock className="size-3.5" />
                    Upgrade to unlock
                  </p>
                ) : (
                  <>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-light">
                      <span>{lesson.duration}</span>
                      <span>{lesson.progress}% complete</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded bg-border-soft">
                      <div
                        className="h-full rounded bg-cyan"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
