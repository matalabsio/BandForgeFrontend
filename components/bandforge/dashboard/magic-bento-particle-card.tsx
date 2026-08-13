"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import "./magic-bento.css";

export const DEFAULT_PARTICLE_COUNT = 12;
/** BandForge SIGNAL_CYAN as RGB triplet */
export const DEFAULT_GLOW_COLOR = "0, 188, 212";
const SPARKLE_COUNT = 5;

export type ParticleCardProps = {
  children: ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
};

export function createParticleElement(
  x: number,
  y: number,
  color: string = DEFAULT_GLOW_COLOR,
) {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
}

export function updateCardGlowProperties(
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
}

export function ParticleCard({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = false,
  clickEffect = false,
  enableMagnetism = false,
}: ParticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<{ kill: () => void } | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor),
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" },
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          rotation: Math.random() * 180,
          duration: 2.4 + Math.random() * 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.35,
          duration: 1.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 90);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        },
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

function canHoverFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function createSparkle(x: number, y: number) {
  const el = document.createElement("span");
  el.className = "bf-sparkle";
  el.setAttribute("aria-hidden", "true");
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  return el;
}

type BentoHoverCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Greeting / header cards — soft cyan shadow + minimal star sparkles. No spotlight. */
export function BentoHoverCard({
  children,
  className,
  style,
}: BentoHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hoveredRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const clearSparkles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    sparklesRef.current.forEach((sparkle) => {
      gsap.to(sparkle, {
        scale: 0,
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          sparkle.parentNode?.removeChild(sparkle);
        },
      });
    });
    sparklesRef.current = [];
  }, []);

  const spawnSparkles = useCallback(() => {
    const card = cardRef.current;
    if (!card || !hoveredRef.current) return;

    const { width, height } = card.getBoundingClientRect();
    const padX = Math.min(28, width * 0.12);
    const padY = Math.min(20, height * 0.18);
    const areaW = Math.max(8, width - padX * 2);
    const areaH = Math.max(8, height - padY * 2);

    for (let i = 0; i < SPARKLE_COUNT; i += 1) {
      const timeoutId = setTimeout(() => {
        if (!hoveredRef.current || !cardRef.current) return;

        const sparkle = createSparkle(
          padX + Math.random() * areaW,
          padY + Math.random() * areaH,
        );
        cardRef.current.appendChild(sparkle);
        sparklesRef.current.push(sparkle);

        gsap.fromTo(
          sparkle,
          { scale: 0, opacity: 0, rotate: 0 },
          { scale: 1, opacity: 0.9, duration: 0.32, ease: "power2.out" },
        );
        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 28,
          y: (Math.random() - 0.5) * 20,
          rotation: 45 + Math.random() * 40,
          duration: 2.1 + Math.random() * 0.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(sparkle, {
          opacity: 0.45,
          duration: 0.9 + Math.random() * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, i * 100);

      timeoutsRef.current.push(timeoutId);
    }
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || reduceMotion) return;

    const handleEnter = () => {
      if (!canHoverFinePointer()) return;
      hoveredRef.current = true;
      spawnSparkles();
    };

    const handleLeave = () => {
      hoveredRef.current = false;
      clearSparkles();
    };

    card.addEventListener("mouseenter", handleEnter);
    card.addEventListener("mouseleave", handleLeave);

    return () => {
      hoveredRef.current = false;
      card.removeEventListener("mouseenter", handleEnter);
      card.removeEventListener("mouseleave", handleLeave);
      clearSparkles();
    };
  }, [clearSparkles, reduceMotion, spawnSparkles]);

  return (
    <div
      ref={cardRef}
      className={cn("bf-bento-hover-card", className)}
      style={style}
    >
      {children}
    </div>
  );
}
