"use client";

import dynamic from "next/dynamic";

const BfHeroDiagnosticCard = dynamic(
  () =>
    import("@/components/bandforge/bf-hero-diagnostic-card").then(
      (m) => m.BfHeroDiagnosticCard,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[17.5rem] w-[90%] max-w-md rounded-[1.125rem] border border-[#e9edf2] bg-white sm:min-h-[19rem] lg:w-full lg:max-w-lg"
        aria-hidden
      />
    ),
  },
);

type Props = {
  className?: string;
};

/** Hero card deferred client-side so headline text wins LCP on mobile. */
export function BfHeroDiagnosticCardDeferred({ className }: Props) {
  return <BfHeroDiagnosticCard className={className} />;
}
