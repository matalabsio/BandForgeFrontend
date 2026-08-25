/** Static pricing FAQ — separate module so SSR/client always share one source. */
export const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: "Which plan should I pick?",
    a: "Take the free diagnostic first. One skill gap → that pack. Writing + Speaking → Dual. All four → Full Skill Program.",
  },
  {
    q: "Why Coming soon?",
    a: "Some packs are listed ahead of launch. Only active plans can checkout.",
  },
  {
    q: "When does access start?",
    a: "Right after payment is verified.",
  },
  {
    q: "Is payment secure?",
    a: "Yes — Razorpay handles checkout. We don't store card or UPI details.",
  },
];
