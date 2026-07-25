import { cn } from "@/lib/utils";

type BfSectionDotBridgeProps = {
  /** Which edge the soft semi-circle anchors to */
  side?: "left" | "right";
  /**
   * `center` — middle of the relative parent (Modules↔Pricing).
   * `seam` — top of the parent, half above / half below (How↔Modules).
   */
  anchor?: "center" | "seam";
  /** Extra vertical shift in px (positive = down) */
  offsetY?: number;
  className?: string;
};

/**
 * Soft teal stipple for section joins.
 * Uniform dots in a soft semi-circle — teal #0097a7 only.
 * Parent needs a white fill; sibling sections should be transparent so dots show through.
 */
export function BfSectionDotBridge({
  side = "right",
  anchor = "center",
  offsetY = 60,
  className,
}: BfSectionDotBridgeProps) {
  const atLeft = side === "left";
  const top =
    anchor === "seam"
      ? `calc(0px + ${offsetY}px)`
      : `calc(50% + ${offsetY}px)`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-[1] hidden -translate-y-1/2 sm:block",
        /* Near-square so the mask reads as a true soft semi-circle */
        "aspect-square h-auto w-[min(36vw,300px)] md:w-[min(34vw,380px)] lg:w-[min(32vw,460px)]",
        atLeft ? "left-0" : "right-0",
        className,
      )}
      style={{ top }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(0 151 167 / 0.16) 2.2px, transparent 2.2px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "center",
          /* True circle anchored on the edge → soft semi-circle into the page */
          maskImage: atLeft
            ? "radial-gradient(circle at 0% 50%, #000 0%, #000 42%, transparent 68%)"
            : "radial-gradient(circle at 100% 50%, #000 0%, #000 42%, transparent 68%)",
          WebkitMaskImage: atLeft
            ? "radial-gradient(circle at 0% 50%, #000 0%, #000 42%, transparent 68%)"
            : "radial-gradient(circle at 100% 50%, #000 0%, #000 42%, transparent 68%)",
        }}
      />
    </div>
  );
}
