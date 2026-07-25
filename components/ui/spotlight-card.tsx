"use client";

import React, { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * EaseMize Spotlight Card (21st.dev / easemize/spotlight-card)
 * Exact pointer-tracking glow animation; brand hues added for BandForge.
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
  /** When true, ignores size prop and uses width/height or className */
  customSize?: boolean;
  /** Frosted liquid-glass surface (pricing / premium cards). */
  glass?: boolean;
  /** Minimal black hairline on glass cards (How stage, etc.). */
  inkBorder?: boolean;
  /** Pointer-tracking spotlight. Off on coarse pointers / when false. */
  spotlight?: boolean;
}

const glowColorMap: Record<GlowColor, { base: number; spread: number }> = {
  // Brand primaries — teal #0097a7 · cyan #00bcd4 · navy #0d1f3c
  teal: { base: 186, spread: 200 },
  cyan: { base: 187, spread: 200 },
  navy: { base: 216, spread: 200 },
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
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

  useEffect(() => {
    if (!spotlight) return;

    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduce) return;

    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;

      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", x.toFixed(2));
        cardRef.current.style.setProperty(
          "--xp",
          (x / window.innerWidth).toFixed(2),
        );
        cardRef.current.style.setProperty("--y", y.toFixed(2));
        cardRef.current.style.setProperty(
          "--yp",
          (y / window.innerHeight).toFixed(2),
        );
      }
    };

    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, [spotlight]);

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
      "--size": glass ? "240" : "200",
      "--outer": "1",
      "--bg-spot-opacity": glass ? "0.14" : "0.1",
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
            calc(var(--x, 0) * 1px)
            calc(var(--y, 0) * 1px),
            hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.14)),
            transparent
          )
        `
        : `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize:
        "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: glass ? "scroll" : "fixed",
      border: "var(--border-size) solid var(--backup-border)",
      position: "relative",
      touchAction: "none",
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
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
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
      >
        <div ref={innerRef} data-glow />
        {children}
      </div>
    </>
  );
};

export { GlowCard };
