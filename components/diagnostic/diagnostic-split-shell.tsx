"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import {
  Check,
  ChevronRight,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { BandForgeLogoLink, BandForgeLogoMark } from "@/components/bandforge/bandforge-logo-link";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, MotionPathPlugin, DrawSVGPlugin);

export type SplitShellStep = {
  id: string;
  label: string;
};

type Props = {
  steps: SplitShellStep[];
  currentStep: number;
  heading: string;
  subtitle: string;
  /** Override footer text — defaults to "Step X of N" */
  footerNote?: string;
  children: React.ReactNode;
  /** Optional timer element rendered in the rail footer area */
  timer?: React.ReactNode;
  /** Lock viewport for exam screens (fixed, no body scroll). */
  fillViewport?: boolean;
  /**
   * `exam` — light curved rail for module screens (collapsible).
   * `onboarding` — light curved rail for study-plan setup.
   */
  variant?: "exam" | "onboarding";
};

/** Horizontal offset along a gentle arc (peaks mid-list). */
function curveOffsetX(index: number, total: number, amp: number): number {
  if (total <= 1) return 0;
  const t = index / (total - 1);
  return amp * Math.sin(Math.PI * t);
}

const RING_GRADIENT =
  "linear-gradient(145deg, #26C6DA 0%, #00ACC1 48%, #00838F 100%)";
const RING_SHADOW = "0 8px 20px rgba(0, 151, 167, 0.32)";

function RailLogo() {
  return <BandForgeLogoLink href="/" size="lg" />;
}

/** Teal SVG curve on the rail’s right edge — separation only, no fill/shadow */
function CurvedRailEdge() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 -right-px z-0 hidden h-full w-[72px] lg:block"
      viewBox="0 0 72 900"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M2 0 C58 180 70 360 70 450 C70 540 58 720 2 900"
        fill="none"
        stroke="url(#ob-curve-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="ob-curve-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4DD0E1" />
          <stop offset="50%" stopColor="#00BCD4" />
          <stop offset="100%" stopColor="#00838F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Exam stepper — light rail, same language as onboarding ─── */

function ExamVerticalStepper({
  steps,
  currentStep,
  collapsed = false,
}: {
  steps: SplitShellStep[];
  currentStep: number;
  collapsed?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const prevStepRef = useRef(currentStep);
  const amp = collapsed ? 0 : 28;
  const ringSize = collapsed ? 28 : 34;

  const applyPath = () => {
    const root = listRef.current;
    const track = pathRef.current;
    const svg = svgRef.current;
    if (!root || !track || collapsed) {
      if (track) track.setAttribute("d", "");
      return;
    }

    const rings = root.querySelectorAll<HTMLElement>("[data-exam-ring]");
    if (rings.length < 2) {
      track.setAttribute("d", "");
      return;
    }

    const w = root.offsetWidth;
    const h = root.offsetHeight;
    if (svg && w > 0 && h > 0) {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
    }

    const padY = 14;
    const itemH = padY * 2 + ringSize;
    const pts = steps.map((_, i) => ({
      x: curveOffsetX(i, steps.length, amp) + ringSize / 2,
      y: i * itemH + padY + ringSize / 2,
    }));

    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      d += ` C ${(a.x + dx * 0.15).toFixed(2)} ${(a.y + dy * 0.4).toFixed(2)}, ${(a.x + dx * 0.85).toFixed(2)} ${(a.y + dy * 0.6).toFixed(2)}, ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    }
    track.setAttribute("d", d);
  };

  useGSAP(
    () => {
      const root = listRef.current;
      if (!root) return;

      const items = Array.from(
        root.querySelectorAll<HTMLElement>("[data-exam-step]"),
      );
      if (!items.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const prev = prevStepRef.current;
      const advanced = currentStep > prev;
      const firstPaint = prev === currentStep && currentStep === 0;
      prevStepRef.current = currentStep;

      gsap.set(items, { x: 0, y: 0 });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => applyPath());
      });

      if (reduce) {
        gsap.set(items, { clearProps: "opacity,transform,filter" });
        return;
      }

      // First visit: stagger steps in along the curve (same feel as onboarding)
      if (firstPaint || (prev === 0 && currentStep === 0 && !advanced)) {
        const already = root.dataset.examAnimated === "1";
        if (!already) {
          root.dataset.examAnimated = "1";
          gsap.fromTo(
            items,
            { opacity: 0, filter: "blur(8px)" },
            {
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.55,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "filter",
              motionPath: {
                path: [
                  { x: -12, y: 22 },
                  { x: 4, y: 8 },
                  { x: 0, y: 0 },
                ],
                curviness: 1.35,
                autoRotate: false,
              },
              onComplete: () => {
                gsap.set(items, { x: 0, y: 0, clearProps: "transform" });
                applyPath();
              },
            },
          );
          return;
        }
      }

      if (!advanced) return;

      const completed = items[currentStep - 1];
      const active = items[currentStep];
      const completedRing = completed?.querySelector<HTMLElement>("[data-exam-ring]");
      const activeRing = active?.querySelector<HTMLElement>("[data-exam-ring]");

      if (completedRing) {
        gsap.fromTo(
          completedRing,
          { scale: 1 },
          { scale: 1.06, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" },
        );
      }

      if (active) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          active,
          { opacity: 0.65, filter: "blur(6px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.5,
            clearProps: "filter",
            motionPath: {
              path: [
                { x: -8, y: 18 },
                { x: 3, y: 6 },
                { x: 0, y: 0 },
              ],
              curviness: 1.3,
              autoRotate: false,
            },
            onComplete: () => {
              gsap.set(active, { x: 0, y: 0, clearProps: "transform" });
              applyPath();
            },
          },
        );
        if (activeRing) {
          tl.fromTo(
            activeRing,
            { scale: 0.82 },
            { scale: 1, duration: 0.45, ease: "back.out(1.6)" },
            0,
          );
        }
      }
    },
    {
      scope: listRef,
      dependencies: [currentStep, collapsed, amp, ringSize, steps.length],
    },
  );

  useGSAP(
    () => {
      const onResize = () => applyPath();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: listRef, dependencies: [currentStep, collapsed, steps.length] },
  );

  return (
    <div ref={listRef} className="relative overflow-visible">
      {!collapsed ? (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute top-0 left-0 z-0 overflow-visible"
          aria-hidden
        >
          <path
            ref={pathRef}
            fill="none"
            stroke="#00BCD4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2.5 7"
            opacity={0.85}
          />
        </svg>
      ) : (
        <div
          className="pointer-events-none absolute top-[14px] bottom-[14px] left-1/2 z-0 w-0 -translate-x-1/2 border-l-[1.5px] border-dotted border-cyan/35"
          aria-hidden
        />
      )}

      <div className="relative z-10 flex flex-col">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;
          const offset = collapsed ? 0 : curveOffsetX(idx, steps.length, amp);

          return (
            <div
              key={step.id}
              data-exam-step
              className={cn(
                "relative z-10 flex w-full items-center will-change-[transform,opacity,filter]",
                collapsed ? "justify-center py-2.5" : "gap-3.5 py-3.5",
              )}
              style={
                collapsed
                  ? undefined
                  : { marginLeft: offset, maxWidth: `calc(100% - ${offset}px)` }
              }
              title={collapsed ? step.label : undefined}
            >
              <div
                data-exam-ring
                className={cn(
                  "relative z-20 flex shrink-0 items-center justify-center rounded-full",
                  (isComplete || isCurrent) && "text-white",
                  !isComplete && !isCurrent && "bg-white text-[#94A3B8]",
                )}
                style={{
                  width: ringSize,
                  height: ringSize,
                  background:
                    isComplete || isCurrent ? RING_GRADIENT : "#FFFFFF",
                  boxShadow:
                    isCurrent
                      ? "0 6px 16px rgba(0,151,167,0.28)"
                      : isComplete
                        ? "0 3px 10px rgba(0,151,167,0.16)"
                        : "none",
                  border:
                    !isComplete && !isCurrent
                      ? "1.5px solid #CBD5E1"
                      : "none",
                }}
              >
                {isComplete ? (
                  <Check className="size-[15px]" strokeWidth={3} aria-hidden />
                ) : (
                  <span className="font-mono text-[13px] font-semibold">{idx + 1}</span>
                )}
              </div>
              {!collapsed ? (
                <>
                  <span
                    className={cn(
                      "relative z-10 min-w-0 flex-1 truncate text-[15px] tracking-[-0.01em] transition-colors duration-300",
                      isCurrent && "font-semibold text-cyan",
                      isComplete && "font-medium text-[#64748B]",
                      !isComplete && !isCurrent && "font-medium text-[#94A3B8]",
                    )}
                  >
                    {step.label}
                  </span>
                  <ChevronRight
                    className={cn(
                      "relative z-10 size-4 shrink-0 transition-colors duration-300",
                      isCurrent ? "text-cyan/80" : "text-[#CBD5E1]",
                    )}
                    aria-hidden
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExamMobileStepper({
  steps,
  currentStep,
}: {
  steps: SplitShellStep[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3">
      {steps.map((step, idx) => {
        const isComplete = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5",
              isCurrent && "bg-cyan/10 ring-1 ring-cyan/25",
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-[10px] font-bold",
                isComplete && "bg-cyan/15 text-cyan",
                isCurrent &&
                  "bg-[linear-gradient(145deg,#26C6DA_0%,#00ACC1_48%,#00838F_100%)] text-white",
                !isComplete && !isCurrent && "bg-[#EEF3F7] text-[#94A3B8]",
              )}
            >
              {isComplete ? (
                <Check className="size-3" strokeWidth={3} aria-hidden />
              ) : (
                idx + 1
              )}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                isCurrent
                  ? "text-navy"
                  : isComplete
                    ? "text-[#5A6B82]"
                    : "text-[#94A3B8]",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Onboarding stepper — curved alignment + premium GSAP reveal ─── */

/** Exact ring-center points from layout math (margin curve + padding). */
function onboardingRingCenters(
  count: number,
  totalSteps: number,
  amp: number,
  ringSize: number,
  compact: boolean,
): { x: number; y: number }[] {
  const padY = compact ? 10 : 14; // py-2.5 / py-3.5
  const itemH = padY * 2 + ringSize;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const offset = curveOffsetX(i, totalSteps, amp);
    pts.push({
      x: offset + ringSize / 2,
      y: i * itemH + padY + ringSize / 2,
    });
  }
  return pts;
}

/** Smooth cubic through ring centers — always hits each center exactly. */
function connectorPathThroughCenters(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    // Control points stay on the vertical flow so the stroke reads centered in each ring
    const c1x = a.x + dx * 0.15;
    const c1y = a.y + dy * 0.4;
    const c2x = a.x + dx * 0.85;
    const c2y = a.y + dy * 0.6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return d;
}

function OnboardingVerticalStepper({
  steps,
  currentStep,
  compact = false,
}: {
  steps: SplitShellStep[];
  currentStep: number;
  compact?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const prevStepRef = useRef(currentStep);
  const amp = compact ? 22 : 42;
  const visibleSteps = steps.slice(0, Math.min(currentStep + 1, steps.length));
  const ringSize = compact ? 32 : 36;

  const applyConnectorPath = (animatedDraw: boolean, fromPct = 0) => {
    const root = listRef.current;
    const track = pathRef.current;
    const svg = svgRef.current;
    if (!root || !track) return;

    const count = root.querySelectorAll("[data-ob-ring]").length;
    if (count < 2) {
      track.setAttribute("d", "");
      gsap.set(track, { drawSVG: "0% 0%" });
      return;
    }

    // Size SVG to the list so path coords map 1:1 to layout
    const w = root.offsetWidth;
    const h = root.offsetHeight;
    if (svg && w > 0 && h > 0) {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
    }

    const pts = onboardingRingCenters(count, steps.length, amp, ringSize, compact);
    track.setAttribute("d", connectorPathThroughCenters(pts));

    if (animatedDraw) {
      gsap.fromTo(
        track,
        { drawSVG: `0% ${fromPct}%` },
        { drawSVG: "0% 100%", duration: 0.55, ease: "power2.inOut" },
      );
    } else {
      gsap.set(track, { drawSVG: "0% 100%" });
    }
  };

  useGSAP(
    () => {
      const root = listRef.current;
      if (!root) return;

      const items = Array.from(
        root.querySelectorAll<HTMLElement>("[data-ob-step]"),
      );
      if (!items.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const prev = prevStepRef.current;
      const advanced = currentStep > prev;
      prevStepRef.current = currentStep;

      // Always clear transforms before path math / settle
      gsap.set(items, { x: 0, y: 0 });

      if (reduce) {
        gsap.set(items, { clearProps: "opacity,transform,filter" });
        applyConnectorPath(false);
        return;
      }

      const newest = items[items.length - 1];
      const shouldEnter =
        Boolean(newest) &&
        ((items.length === 1 && currentStep === 0 && prev === 0) || advanced);

      if (!shouldEnter) {
        gsap.set(items, { opacity: 1, filter: "none" });
        applyConnectorPath(false);
        return;
      }

      if (advanced && items.length >= 2) {
        const completedRing = items[items.length - 2]?.querySelector<HTMLElement>(
          "[data-ob-ring]",
        );
        if (completedRing) {
          gsap.fromTo(
            completedRing,
            { scale: 1 },
            { scale: 1.05, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" },
          );
        }
      }

      // Keep newest in final layout position while invisible — path stays centered
      gsap.set(newest, { opacity: 0, filter: "blur(10px)" });

      const segmentCount = Math.max(items.length - 1, 1);
      const fromPct =
        advanced && items.length > 2
          ? ((items.length - 2) / segmentCount) * 100
          : 0;

      // Double-rAF so layout (margin offsets) is committed before path + draw
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          applyConnectorPath(items.length >= 2, fromPct);

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          // Enter along a soft arc without leaving residual x/y that skews the line
          tl.fromTo(
            newest,
            { opacity: 0, filter: "blur(10px)" },
            {
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.65,
              clearProps: "filter",
              motionPath: {
                path: [
                  { x: -10, y: 28 },
                  { x: 4, y: 10 },
                  { x: 0, y: 0 },
                ],
                curviness: 1.35,
                autoRotate: false,
              },
              onComplete: () => {
                gsap.set(newest, { x: 0, y: 0, clearProps: "transform" });
                applyConnectorPath(false);
              },
            },
            items.length >= 2 ? 0.12 : 0,
          );

          const ring = newest.querySelector<HTMLElement>("[data-ob-ring]");
          const label = newest.querySelector<HTMLElement>("[data-ob-label]");
          const chevron = newest.querySelector<HTMLElement>("[data-ob-chevron]");

          if (ring) {
            tl.fromTo(
              ring,
              { scale: 0.78 },
              { scale: 1, duration: 0.5, ease: "back.out(1.6)" },
              "-=0.5",
            );
          }
          if (label) {
            tl.fromTo(
              label,
              { opacity: 0, x: -6 },
              { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
              "-=0.35",
            );
          }
          if (chevron) {
            tl.fromTo(
              chevron,
              { opacity: 0, x: -4 },
              { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" },
              "-=0.3",
            );
          }
        });
      });
    },
    {
      scope: listRef,
      dependencies: [currentStep, amp, steps.length, compact, visibleSteps.length, ringSize],
    },
  );

  useGSAP(
    () => {
      const onResize = () => applyConnectorPath(false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: listRef, dependencies: [currentStep, visibleSteps.length, amp, compact, ringSize] },
  );

  return (
    <div ref={listRef} className="relative overflow-visible pr-1 sm:pr-3">
      <svg
        ref={svgRef}
        className="pointer-events-none absolute top-0 left-0 z-0 overflow-visible"
        aria-hidden
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="#00BCD4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      </svg>

      <ol className="relative z-[1] flex flex-col">
        {visibleSteps.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;
          const offset = curveOffsetX(idx, steps.length, amp);

          return (
            <li
              key={step.id}
              data-ob-step
              className={cn(
                "flex w-full items-center will-change-[transform,opacity,filter]",
                compact ? "gap-3 py-2.5" : "gap-3.5 py-3.5",
              )}
              style={{ marginLeft: offset, maxWidth: `calc(100% - ${offset}px)` }}
            >
              <div
                data-ob-ring
                className="relative z-[1] flex shrink-0 items-center justify-center rounded-full text-white"
                style={{
                  width: ringSize,
                  height: ringSize,
                  background: RING_GRADIENT,
                  boxShadow: isCurrent
                    ? "0 6px 16px rgba(0,151,167,0.28)"
                    : "0 3px 10px rgba(0,151,167,0.16)",
                }}
              >
                {isComplete ? (
                  <Check className={compact ? "size-3.5" : "size-4"} strokeWidth={3} aria-hidden />
                ) : (
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      compact ? "text-[12px]" : "text-[13px]",
                    )}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>

              <span
                data-ob-label
                className={cn(
                  "min-w-0 flex-1 truncate tracking-[-0.01em] transition-colors duration-300",
                  compact ? "text-[13px]" : "text-[15px]",
                  isCurrent && "font-semibold text-cyan",
                  isComplete && "font-medium text-[#64748B]",
                )}
              >
                {step.label}
              </span>

              <ChevronRight
                data-ob-chevron
                className={cn(
                  "shrink-0 transition-colors duration-300",
                  compact ? "size-3.5" : "size-4",
                  isCurrent ? "text-cyan/80" : "text-[#CBD5E1]",
                )}
                aria-hidden
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OnboardingRailFooter() {
  return (
    <nav className="mt-auto flex items-center pt-6 lg:pt-8" aria-label="Quick links">
      <Link
        href="/"
        className="flex size-10 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-navy"
        aria-label="Home"
      >
        <Home className="size-[18px]" strokeWidth={1.75} />
      </Link>
    </nav>
  );
}

/** Mobile / tablet — steps in a horizontal row with premium reveal */
function OnboardingHorizontalStepper({
  steps,
  currentStep,
}: {
  steps: SplitShellStep[];
  currentStep: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);
  const visibleSteps = steps.slice(0, Math.min(currentStep + 1, steps.length));

  useGSAP(
    () => {
      const root = rowRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>("[data-ob-h-step]"),
      );
      if (!items.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const prev = prevStepRef.current;
      const advanced = currentStep > prev;
      prevStepRef.current = currentStep;

      if (reduce) {
        gsap.set(items, { clearProps: "opacity,transform,filter" });
        return;
      }

      const newest = items[items.length - 1];
      if (!newest) return;
      const shouldEnter =
        (items.length === 1 && currentStep === 0 && prev === 0) || advanced;
      if (!shouldEnter) {
        gsap.set(items, { opacity: 1, x: 0, scale: 1, filter: "none" });
        return;
      }

      if (advanced && items.length >= 2) {
        const completed = items[items.length - 2];
        const completedRing = completed?.querySelector<HTMLElement>("[data-ob-h-ring]");
        const connector = completed?.querySelector<HTMLElement>("[data-ob-h-connector]");
        if (completedRing) {
          gsap.fromTo(
            completedRing,
            { scale: 1 },
            { scale: 1.08, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" },
          );
        }
        if (connector) {
          gsap.fromTo(
            connector,
            { scaleX: 0, opacity: 0 },
            {
              scaleX: 1,
              opacity: 1,
              duration: 0.5,
              ease: "power2.inOut",
              transformOrigin: "left center",
            },
          );
        }
      }

      const ring = newest.querySelector<HTMLElement>("[data-ob-h-ring]");
      const label = newest.querySelector<HTMLElement>("[data-ob-h-label]");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        newest,
        { opacity: 0, x: -18, scale: 0.92, filter: "blur(8px)" },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.55,
          clearProps: "filter",
        },
        0.06,
      );

      if (ring) {
        tl.fromTo(
          ring,
          { scale: 0.75 },
          { scale: 1, duration: 0.45, ease: "back.out(1.6)" },
          0.14,
        );
      }
      if (label) {
        tl.fromTo(
          label,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
          0.24,
        );
      }
    },
    { scope: rowRef, dependencies: [currentStep, steps.length, visibleSteps.length] },
  );

  return (
    <div ref={rowRef} className="w-full">
      <div className="flex items-start justify-between gap-1">
        {visibleSteps.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isLast = idx === visibleSteps.length - 1;

          return (
            <div
              key={step.id}
              data-ob-h-step
              className="relative flex min-w-0 flex-1 flex-col items-center will-change-[transform,opacity,filter]"
            >
              {!isLast ? (
                <div
                  data-ob-h-connector
                  className="pointer-events-none absolute top-[14px] left-[calc(50%+14px)] right-[calc(-50%+14px)] h-0 origin-left border-t-2 border-dashed border-cyan"
                  aria-hidden
                />
              ) : null}

              <div
                data-ob-h-ring
                className="relative z-[1] flex size-7 items-center justify-center rounded-full text-white sm:size-8"
                style={{
                  background: RING_GRADIENT,
                  boxShadow: isCurrent ? RING_SHADOW : "0 4px 10px rgba(0,151,167,0.2)",
                }}
              >
                {isComplete ? (
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                ) : (
                  <span className="font-mono text-[11px] font-semibold sm:text-[12px]">
                    {idx + 1}
                  </span>
                )}
              </div>

              <span
                data-ob-h-label
                className={cn(
                  "mt-1.5 w-full px-0.5 text-center text-[10px] leading-tight font-medium sm:text-[11px]",
                  isCurrent ? "text-cyan" : "text-[#64748B]",
                )}
              >
                <span className="line-clamp-2">{step.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OnboardingHeading({
  heading,
  subtitle,
  headingRef,
  subtitleRef,
}: {
  heading: string;
  subtitle: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
}) {
  // Highlight trailing phrase when present (e.g. "your study plan.")
  const highlightMatch = heading.match(/^(.*?)(your study plan\.?)$/i);
  return (
    <>
      <h2
        ref={headingRef}
        className="font-display text-[26px] leading-[1.18] font-bold tracking-[-0.02em] text-navy sm:text-[30px]"
      >
        {highlightMatch ? (
          <>
            {highlightMatch[1]}
            <span className="bg-gradient-to-r from-[#26C6DA] to-[#00838F] bg-clip-text text-transparent">
              {highlightMatch[2]}
            </span>
          </>
        ) : (
          heading
        )}
      </h2>
      <p
        ref={subtitleRef}
        className="mt-3 max-w-[34ch] text-[14px] leading-[1.6] text-[#64748B] sm:text-[15px]"
      >
        {subtitle}
      </p>
    </>
  );
}

export function DiagnosticSplitShell({
  steps,
  currentStep,
  heading,
  subtitle,
  footerNote,
  children,
  timer,
  fillViewport = false,
  variant = "exam",
}: Props) {
  const isOnboarding = variant === "onboarding";
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [railCollapsed, setRailCollapsed] = useState(false);

  useEffect(() => {
    // Lock page to viewport for every diagnostic shell (onboarding + exam)
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // Soft crossfade heading/subtitle when copy changes (onboarding)
  useEffect(() => {
    if (!isOnboarding) return;
    const els = [headingRef.current, subtitleRef.current].filter(Boolean);
    if (!els.length) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.fromTo(
      els,
      { opacity: 0, y: 8, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
      },
    );
  }, [heading, subtitle, isOnboarding]);

  if (isOnboarding) {
    return (
      <div
        className={cn(
          "flex h-dvh max-h-dvh flex-col overflow-hidden bg-white lg:flex-row",
          fillViewport && "fixed inset-0 z-40",
        )}
      >
        {/* Desktop light rail — curved edge, no drop shadow */}
        <aside
          className={cn(
            "relative z-[1] hidden h-full w-[min(100%,400px)] shrink-0 flex-col overflow-hidden bg-white xl:w-[440px]",
            "lg:flex",
            "lg:rounded-tr-[28px] lg:rounded-br-[140px]",
            "lg:p-[40px_40px_32px_40px]",
          )}
        >
          <CurvedRailEdge />

          <div className="relative z-[1] mb-8 shrink-0 lg:mb-10">
            <RailLogo />
          </div>

          <div className="relative z-[1] shrink-0">
            <OnboardingHeading
              heading={heading}
              subtitle={subtitle}
              headingRef={headingRef}
              subtitleRef={subtitleRef}
            />
          </div>

          <div className="relative z-[1] mt-6 min-h-0 flex-1 overflow-x-hidden overflow-y-auto lg:mt-8">
            <OnboardingVerticalStepper
              key="desktop-stepper"
              steps={steps}
              currentStep={currentStep}
            />
          </div>

          {timer ? <div className="relative z-[1] mt-6 shrink-0">{timer}</div> : null}

          <div className="relative z-[1] shrink-0">
            <OnboardingRailFooter />
          </div>
        </aside>

        {/* Mobile / tablet top panel — horizontal step row */}
        <div className="shrink-0 border-b border-transparent bg-white lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 pt-3 sm:px-5">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center"
              aria-label="BandForge home"
            >
              <BandForgeLogoMark size="sm" />
            </Link>
            <div className="flex items-center gap-2.5">
              <p className="font-mono text-[11px] tracking-wide text-[#94A3B8]">
                {footerNote ??
                  `Step ${Math.min(currentStep + 1, steps.length)} of ${steps.length}`}
              </p>
              <Link
                href="/"
                className="flex size-9 items-center justify-center rounded-xl text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-navy"
                aria-label="Home"
              >
                <Home className="size-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>

          <div className="px-4 pt-2.5 sm:px-5">
            <p className="font-display text-[17px] leading-snug font-bold tracking-[-0.02em] text-navy sm:text-[20px]">
              {heading}
            </p>
            <p className="mt-1 max-w-[42ch] text-[12px] leading-snug text-[#64748B] sm:text-[13px]">
              {subtitle}
            </p>
          </div>

          <div className="px-3 pt-3 pb-3.5 sm:px-5">
            <OnboardingHorizontalStepper
              steps={steps}
              currentStep={currentStep}
            />
          </div>
        </div>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            {children}
          </div>
        </main>
      </div>
    );
  }

  /* ─── Exam shell — light curved rail, collapsible ─── */
  return (
    <div
      className={cn(
        "flex h-dvh max-h-dvh flex-col overflow-hidden bg-white lg:flex-row",
        fillViewport && "fixed inset-0 z-40",
      )}
    >
      <aside
        className={cn(
          "relative z-[1] hidden h-full shrink-0 flex-col overflow-hidden bg-white transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex",
          railCollapsed ? "w-[72px]" : "w-[min(100%,320px)] xl:w-[340px]",
          "lg:rounded-tr-[28px] lg:rounded-br-[120px]",
        )}
      >
        {!railCollapsed ? <CurvedRailEdge /> : null}

        <div
          className={cn(
            "relative z-10 flex h-full flex-col",
            railCollapsed ? "items-center px-2.5 py-5" : "p-[36px_32px_28px_36px]",
          )}
        >
          <div
            className={cn(
              "relative z-20 mb-7 flex w-full shrink-0 items-center bg-white",
              railCollapsed ? "flex-col gap-3" : "justify-between gap-3",
            )}
          >
            {railCollapsed ? (
              <Link href="/" aria-label="BandForge home" className="relative z-20 shrink-0">
                <BandForgeLogoMark size="mark" />
              </Link>
            ) : (
              <RailLogo />
            )}
            <button
              type="button"
              onClick={() => setRailCollapsed((v) => !v)}
              className="relative z-20 flex size-9 cursor-pointer items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#94A3B8] transition-colors hover:border-cyan/40 hover:bg-[#F1F5F9] hover:text-navy"
              aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!railCollapsed}
            >
              {railCollapsed ? (
                <PanelLeftOpen className="size-4" aria-hidden />
              ) : (
                <PanelLeftClose className="size-4" aria-hidden />
              )}
            </button>
          </div>

          {!railCollapsed ? (
            <>
              <h2 className="shrink-0 font-display text-[26px] leading-[1.16] font-bold tracking-[-0.02em] text-navy xl:text-[28px]">
                {heading}
              </h2>
              <p className="mt-2.5 shrink-0 text-[13.5px] leading-[1.6] text-[#64748B] xl:text-[14.5px]">
                {subtitle}
              </p>
            </>
          ) : null}

          <div
            className={cn(
              "min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
              railCollapsed ? "mt-5 w-full" : "mt-8",
            )}
          >
            <ExamVerticalStepper
              steps={steps}
              currentStep={currentStep}
              collapsed={railCollapsed}
            />
          </div>

          {timer ? (
            <div className={cn("shrink-0", railCollapsed ? "mt-3" : "mt-6")}>
              {timer}
            </div>
          ) : null}

          {!railCollapsed ? (
            <div className="mt-auto shrink-0 pt-5 font-mono text-[12px] text-[#94A3B8]">
              {footerNote ??
                `Step ${Math.min(currentStep + 1, steps.length)} of ${steps.length}`}
            </div>
          ) : (
            <p className="mt-auto pt-3 text-center font-mono text-[10px] text-[#94A3B8]">
              {Math.min(currentStep + 1, steps.length)}/{steps.length}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile top chrome — light, matches canvas */}
      <div className="shrink-0 border-b border-transparent bg-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center"
            aria-label="BandForge home"
          >
            <BandForgeLogoMark size="sm" />
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            {timer ? <div className="shrink-0">{timer}</div> : null}
            <p className="font-mono text-[11px] text-[#94A3B8]">
              {footerNote ??
                `Step ${Math.min(currentStep + 1, steps.length)} of ${steps.length}`}
            </p>
          </div>
        </div>
        <ExamMobileStepper steps={steps} currentStep={currentStep} />
      </div>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden bg-white",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
