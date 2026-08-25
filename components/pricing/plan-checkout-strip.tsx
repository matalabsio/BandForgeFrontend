"use client";

import { useReducedMotion } from "motion/react";
import { CheckoutPosGraphic } from "@/components/pricing/checkout-pos-graphic";
import { formatInr } from "@/lib/payments";
import { cn } from "@/lib/utils";
import styles from "./plan-checkout-strip.module.css";

type PlanCheckoutStripProps = {
  amountPaise: number;
  label: string;
  disabled: boolean;
  onCheckout: () => void;
};

export function PlanCheckoutStrip({
  amountPaise,
  label,
  disabled,
  onCheckout,
}: PlanCheckoutStripProps) {
  const reduceMotion = useReducedMotion();
  const price = formatInr(amountPaise);
  const interactive = !disabled && !reduceMotion;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onCheckout}
      aria-label={`${label} — ${price}`}
      className={cn(
        styles.container,
        interactive && styles.interactive,
        interactive && "posInteractiveHost",
        disabled && styles.disabled,
      )}
    >
      <div className={styles.leftSide}>
        <CheckoutPosGraphic
          amountPaise={amountPaise}
          mode="interactive"
          muted={disabled}
        />
      </div>
      <div className={styles.rightSide}>
        <span className={styles.label}>{label}</span>
        <svg
          viewBox="0 0 451.846 451.847"
          className={styles.arrow}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
          />
        </svg>
      </div>
    </button>
  );
}
