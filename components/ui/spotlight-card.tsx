"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * EaseMize Spotlight Card — brand hues for BandForge.
 * Glow tracks the whole card surface (capture-phase). touch-action: pan-y so scroll isn't trapped.
 */
export type GlowColor =
  | "teal"
  | "cyan"
  | "navy"
  | "blue"
  | "purple"
  | "green"
  | "red"
  | "orange";

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
  glass?: boolean;
  inkBorder?: boolean;
  spotlight?: boolean;
}

const glowColorMap: Record<GlowColor, { base: number; spread: number }> = {
  /* Tight spread — keeps glow on brand teal/cyan/navy (no magenta drift) */
  teal: { base: 186, spread: 28 },
  cyan: { base: 187, spread: 28 },
  navy: { base: 210, spread: 24 },
  blue: { base: 210, spread: 40 },
  purple: { base: 280, spread: 40 },
  green: { base: 120, spread: 40 },
  red: { base: 0, spread: 40 },
  orange: { base: 30, spread: 40 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
} as const;

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  width,
  height,
  customSize = false,
  glass = false,
  inkBorder = false,
  spotlight = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackRef.current = Boolean(spotlight && !coarse && !reduce);

    /* Default glow anchor — visible border light without hover */
    card.style.setProperty("--x", "72%");
    card.style.setProperty("--y", "28%");
    card.style.setProperty("--xp", "0.72");
    card.style.setProperty("--yp", "0.28");
  }, [spotlight]);

  const syncFromEvent = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--x", `${x.toFixed(2)}px`);
    card.style.setProperty("--y", `${y.toFixed(2)}px`);
    card.style.setProperty(
      "--xp",
      Math.min(1, Math.max(0, x / Math.max(rect.width, 1))).toFixed(3),
    );
    card.style.setProperty(
      "--yp",
      Math.min(1, Math.max(0, y / Math.max(rect.height, 1))).toFixed(3),
    );
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size];
  };

  const getInlineStyles = (): CSSProperties => {
    const baseStyles: CSSProperties & Record<string, string | number> = {
      "--base": base,
      "--spread": spread,
      "--radius": glass ? "20" : "14",
      "--border": glass ? "1" : "3",
      "--backdrop": glass
        ? "hsl(0 0% 100% / 0.55)"
        : "hsl(0 0% 60% / 0.12)",
      "--backup-border": glass
        ? inkBorder
          ? "rgb(0 0 0 / 0.1)"
          : "hsl(210 30% 90% / 0.55)"
        : "var(--backdrop)",
      "--size": glass ? "220" : "180",
      "--outer": "1",
      "--bg-spot-opacity": glass ? "0.12" : "0.1",
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      backgroundImage: glass
        ? `
          linear-gradient(
            145deg,
            hsl(0 0% 100% / 0.55) 0%,
            hsl(0 0% 100% / 0.18) 42%,
            hsl(186 80% 96% / 0.28) 100%
          ),
          radial-gradient(
            var(--spotlight-size) var(--spotlight-size) at
            var(--x, 72%) var(--y, 28%),
            hsl(var(--hue, 186) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.12)),
            transparent
          )
        `
        : `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        var(--x, 72%) var(--y, 28%),
        hsl(var(--hue, 186) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize:
        "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: "scroll",
      border: "var(--border-size) solid var(--backup-border)",
      position: "relative",
      touchAction: "pan-y",
      ...(glass
        ? {
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            backdropFilter: "blur(22px) saturate(180%)",
          }
        : null),
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === "number" ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none !important;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: scroll;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
      -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      -webkit-mask-clip: padding-box, border-box;
      -webkit-mask-composite: source-in;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        var(--x, 72%) var(--y, 28%),
        hsl(var(--hue, 186) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 48) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
      );
      filter: brightness(1.85);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        var(--x, 72%) var(--y, 28%),
        hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
    
    [data-glow] > [data-glow] {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none !important;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      border: none;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={cn(
          getSizeClasses(),
          !customSize && "aspect-[3/4]",
          "relative grid grid-rows-[1fr_auto] gap-4 rounded-2xl p-4",
          glass
            ? inkBorder
              ? "shadow-[0_12px_40px_-18px_rgb(0_0_0/0.16),0_4px_14px_-6px_rgb(0_0_0/0.08),inset_0_1px_0_rgb(255_255_255/0.78)] backdrop-blur-[22px]"
              : "shadow-[0_4px_24px_-10px_rgb(13_31_60/0.1),inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur-[22px]"
            : "shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]",
          className,
        )}
        onPointerMove={syncFromEvent}
        onPointerEnter={syncFromEvent}
      >
        <div ref={innerRef} data-glow aria-hidden />
        <div className="relative z-[1] min-h-0 min-w-0">{children}</div>
      </div>
    </>
  );
};

export { GlowCard };
