import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * Very faint diagonal seam — straddles the section join (~50% above / below).
 * Logo teal #0097a7 + cyan #00bcd4 only, low density.
 */
export function BfSectionSeam({ className }: Props) {
  return (
    <div
      className={cn("pointer-events-none relative z-[4] h-0 w-full", className)}
      aria-hidden
    >
      <div className="absolute top-0 left-1/2 h-[min(20vw,140px)] w-[min(120vw,1200px)] -translate-x-1/2 -translate-y-1/2 -rotate-[14deg]">
        <div
          className="size-full"
          style={{
            background:
              "radial-gradient(ellipse 88% 40% at 50% 50%, rgb(0 151 167 / 0.02) 0%, rgb(0 188 212 / 0.015) 40%, transparent 72%)",
            filter: "blur(32px)",
          }}
        />
      </div>
    </div>
  );
}
