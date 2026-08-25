"use client";

import { useReducedMotion } from "motion/react";
import { formatInr } from "@/lib/payments";
import { cn } from "@/lib/utils";
import styles from "./checkout-pos-graphic.module.css";

export type CheckoutPosGraphicMode = "interactive" | "loader";

type Props = {
  amountPaise?: number;
  mode: CheckoutPosGraphicMode;
  muted?: boolean;
  className?: string;
};

export function CheckoutPosGraphic({
  amountPaise,
  mode,
  muted = false,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();
  const price =
    amountPaise != null && amountPaise > 0 ? formatInr(amountPaise) : null;

  return (
    <div
      className={cn(
        styles.panel,
        mode === "loader" && styles.panelLoader,
        mode === "loader" && !reduceMotion && styles.loaderLoop,
        muted && styles.panelMuted,
        reduceMotion && styles.reduceMotion,
        className,
      )}
      aria-hidden
    >
      <div className={styles.card}>
        <div className={styles.cardLine} />
        <div className={styles.buttons} />
      </div>
      <div className={styles.post}>
        <div className={styles.postLine} />
        <div className={styles.screen}>
          {price ? <span className={styles.price}>{price}</span> : null}
        </div>
        <div className={styles.numbers} />
        <div className={styles.numbersLine2} />
      </div>
    </div>
  );
}
