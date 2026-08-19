"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

const DEFAULT_LENGTH = 4;

type OtpInputRowProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  /** Number of OTP digits (default 4 for phone). */
  length?: number;
  /** Increment when the OTP step mounts to autofocus first cell */
  focusToken?: number;
};

export function OtpInputRow({
  value,
  onChange,
  disabled,
  idPrefix = "otp",
  length = DEFAULT_LENGTH,
  focusToken = 0,
}: OtpInputRowProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const clean = value.replace(/\D/g, "").slice(0, length);

  const focusAt = useCallback((i: number) => {
    requestAnimationFrame(() => {
      const el = refs.current[Math.max(0, Math.min(length - 1, i))];
      el?.focus();
      el?.select();
    });
  }, [length]);

  useEffect(() => {
    if (!disabled) focusAt(0);
  }, [disabled, focusToken, focusAt]);

  const applyString = useCallback(
    (raw: string) => {
      const next = raw.replace(/\D/g, "").slice(0, length);
      onChange(next);
      focusAt(Math.min(next.length, length - 1));
    },
    [onChange, focusAt, length],
  );

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      applyString(e.clipboardData.getData("text"));
    },
    [applyString],
  );

  const onKeyDown = useCallback(
    (i: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (clean[i]) {
          onChange(clean.slice(0, i) + clean.slice(i + 1));
        } else {
          onChange(clean.slice(0, Math.max(0, i - 1)) + clean.slice(i));
          focusAt(i - 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusAt(i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusAt(i + 1);
      }
    },
    [clean, onChange, focusAt],
  );

  return (
    <div
      className="flex justify-center gap-2 sm:gap-2.5"
      role="group"
      aria-label="One-time password"
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={clean[i] ?? ""}
          className="h-12 w-10 rounded-xl border border-border bg-white text-center font-mono text-lg font-semibold text-navy shadow-[var(--shadow-soft)] transition-colors duration-200 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/25 disabled:opacity-50 sm:h-14 sm:w-11 sm:text-xl"
          aria-label={`Digit ${i + 1} of ${length}`}
          onPaste={i === 0 ? onPaste : undefined}
          onKeyDown={(e) => onKeyDown(i, e)}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            if (!d) {
              onChange(clean.slice(0, i) + clean.slice(i + 1));
              return;
            }
            const next = (clean.slice(0, i) + d + clean.slice(i + 1)).slice(
              0,
              length,
            );
            onChange(next);
            if (i < length - 1) focusAt(i + 1);
          }}
        />
      ))}
    </div>
  );
}
