"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { motion, useAnimation, useMotionValue } from "motion/react";

import "./circular-text.css";

type HoverMode = "slowDown" | "speedUp" | "pause" | "goBonkers";

type CircularTextProps = {
  text: string;
  spinDuration?: number;
  onHover?: HoverMode;
  className?: string;
  /** Static center content (does not rotate with the ring). Defaults to a gold open book. */
  center?: ReactNode;
  showCenter?: boolean;
};

const getRotationTransition = (
  duration: number,
  from: number,
  loop = true,
) => ({
  from,
  to: from + 360,
  ease: "linear" as const,
  duration,
  type: "tween" as const,
  repeat: loop ? Infinity : 0,
});

const getTransition = (duration: number, from: number) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
  },
});

const GoldOpenBook = () => (
  <BookOpen
    className="circular-text-book"
    strokeWidth={2.15}
    aria-hidden
  />
);

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
  center,
  showCenter = true,
}: CircularTextProps) {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [spinDuration, text, onHover, controls, rotation]);

  const handleHoverStart = () => {
    const start = rotation.get();
    if (!onHover) return;

    let transitionConfig;
    let scaleVal = 1;

    switch (onHover) {
      case "slowDown":
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case "speedUp":
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case "pause":
        transitionConfig = {
          rotate: { type: "spring" as const, damping: 20, stiffness: 300 },
          scale: { type: "spring" as const, damping: 20, stiffness: 300 },
        };
        scaleVal = 1;
        break;
      case "goBonkers":
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }

    void controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  return (
    <div className={`circular-text-wrap ${className}`.trim()}>
      <motion.div
        className="circular-text"
        style={{ rotate: rotation }}
        initial={{ rotate: 0 }}
        animate={controls}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        aria-hidden
      >
        {letters.map((letter, i) => {
          const rotationDeg = (360 / letters.length) * i;
          const factor = Math.PI / letters.length;
          const x = factor * i;
          const y = factor * i;
          const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

          return (
            <span
              key={`${letter}-${i}`}
              style={{ transform, WebkitTransform: transform }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          );
        })}
      </motion.div>

      {showCenter ? (
        <div className="circular-text-center" aria-hidden>
          {center ?? <GoldOpenBook />}
        </div>
      ) : null}
    </div>
  );
}
