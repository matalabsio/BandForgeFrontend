"use client";

import {
  useRef,
  useEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import type { MagicBentoCardData } from "@/components/bandforge/dashboard/magic-bento-types";
import { MagicBentoCardVisual } from "@/components/bandforge/dashboard/magic-bento-visual";
import {
  MagicBentoCalendarIcon,
  MagicBentoIcon,
} from "@/components/bandforge/dashboard/magic-bento-icon";
import {
  DEFAULT_GLOW_COLOR,
  DEFAULT_PARTICLE_COUNT,
  ParticleCard,
  updateCardGlowProperties,
} from "@/components/bandforge/dashboard/magic-bento-particle-card";
import "./magic-bento.css";

export type { MagicBentoCardData } from "@/components/bandforge/dashboard/magic-bento-types";

const DEFAULT_SPOTLIGHT_RADIUS = 300;
const MOBILE_BREAKPOINT = 768;
const DEFAULT_CARD_BG = "#ffffff";

function calculateSpotlightValues(radius: number) {
  return {
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75,
  };
}

function GlobalSpotlight({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: {
  gridRef: RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}) {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.22) 0%,
        rgba(${glowColor}, 0.12) 18%,
        rgba(${glowColor}, 0.06) 35%,
        rgba(${glowColor}, 0.02) 55%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: multiply;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        !!rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll<HTMLElement>(".magic-bento-card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          card.style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          card,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius,
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.18,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.75
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.75
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.28 : 0.45,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll<HTMLElement>(".magic-bento-card").forEach((card) => {
        card.style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
}

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

function CardInner({ card }: { card: MagicBentoCardData }) {
  if (card.empty) {
    return <div className="magic-bento-card__body" aria-hidden />;
  }
  const titleInVisual =
    card.visual?.kind === "cta" ||
    card.visual?.kind === "gap" ||
    card.visual?.kind === "writing";
  const hideTitle =
    titleInVisual ||
    card.visual?.kind === "streak";
  const showExamMeta = Boolean(card.examLabel || card.metaLabel);
  const showStartCta = Boolean(card.ctaLabel && card.href);

  return (
    <div className="magic-bento-card__body">
      <div className="magic-bento-card__header">
        <div className="magic-bento-card__label-row">
          {card.icon ? (
            <span className="magic-bento-card__icon" aria-hidden>
              <MagicBentoIcon name={card.icon} className="magic-bento-card__icon-svg" />
            </span>
          ) : null}
          <div className="magic-bento-card__label">{card.label}</div>
        </div>
      </div>
      {card.visual ? (
        <MagicBentoCardVisual
          visual={card.visual}
          title={titleInVisual ? card.title : undefined}
        />
      ) : null}
      <div className="magic-bento-card__content">
        {!hideTitle ? (
          <h2 className="magic-bento-card__title">{card.title}</h2>
        ) : null}
        {card.description ? (
          <p className="magic-bento-card__description">{card.description}</p>
        ) : null}
      </div>
      {showExamMeta ? (
        <div className="magic-bento-card__footer">
          {card.examLabel ? (
            <span className="magic-bento-card__exam">
              <MagicBentoCalendarIcon className="magic-bento-card__exam-icon" />
              <span className="magic-bento-card__exam-text">{card.examLabel}</span>
            </span>
          ) : (
            <span />
          )}
          {card.metaLabel ? (
            <span className="magic-bento-card__meta">{card.metaLabel}</span>
          ) : null}
        </div>
      ) : null}
      {showStartCta ? (
        <div className="magic-bento-card__footer magic-bento-card__footer--cta">
          <Link
            href={card.href!}
            className={[
              "magic-bento-card__cta",
              "magic-bento-card__cta--wide",
              card.visual?.kind === "cta" && card.visual.ready
                ? "magic-bento-card__cta--live"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="magic-bento-card__cta-label">
              {card.icon === "practice" || card.icon === "writing" ? (
                <MagicBentoIcon
                  name={card.icon}
                  className="magic-bento-card__cta-icon"
                />
              ) : null}
              {card.ctaLabel}
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function StaticInteractiveCard({
  className,
  style,
  card,
  shouldDisableAnimations,
  enableTilt,
  enableMagnetism,
  clickEffect,
  glowColor,
}: {
  className: string;
  style: CSSProperties;
  card: MagicBentoCardData;
  shouldDisableAnimations: boolean;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  glowColor: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || shouldDisableAnimations) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(el, {
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
        gsap.to(el, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      if (enableTilt) {
        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      if (enableMagnetism) {
        gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = el.getBoundingClientRect();
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

      el.appendChild(ripple);

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

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("click", handleClick);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("click", handleClick);
    };
  }, [
    shouldDisableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  const inner = <CardInner card={card} />;

  return (
    <div
      ref={elRef}
      className={className}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {inner}
    </div>
  );
}

export type MagicBentoProps = {
  cards: MagicBentoCardData[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
};

export default function MagicBento({
  cards,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = false,
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const reduceMotion = useReducedMotion();
  const shouldDisableAnimations =
    disableAnimations || isMobile || Boolean(reduceMotion);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cardEls = grid.querySelectorAll<HTMLElement>(".magic-bento-card");
    if (cardEls.length === 0) return;

    if (shouldDisableAnimations) {
      gsap.set(cardEls, { clearProps: "opacity,transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardEls,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "transform",
        },
      );
    }, grid);

    return () => ctx.revert();
  }, [shouldDisableAnimations, cards]);

  return (
    <div className="bf-magic-bento">
      {enableSpotlight ? (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      ) : null}

      <div className="card-grid bento-section" ref={gridRef}>
        {cards.map((card, index) => {
          const baseClassName = [
            "magic-bento-card",
            textAutoHide ? "magic-bento-card--text-autohide" : "",
            enableBorderGlow && !card.empty ? "magic-bento-card--border-glow" : "",
            card.empty ? "magic-bento-card--empty" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const style: CSSProperties = {
            backgroundColor: card.color ?? DEFAULT_CARD_BG,
            ["--glow-color" as string]: glowColor,
          };

          const inner = <CardInner card={card} />;

          if (enableStars && !card.empty) {
            return (
              <ParticleCard
                key={`${card.label}-${index}`}
                className={baseClassName}
                style={style}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                {inner}
              </ParticleCard>
            );
          }

          return (
            <StaticInteractiveCard
              key={`${card.label}-${index}`}
              className={baseClassName}
              style={style}
              card={card}
              shouldDisableAnimations={shouldDisableAnimations}
              enableTilt={enableTilt}
              enableMagnetism={enableMagnetism}
              clickEffect={clickEffect && !card.empty}
              glowColor={glowColor}
            />
          );
        })}
      </div>
    </div>
  );
}
