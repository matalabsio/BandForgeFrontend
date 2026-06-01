import type { ReactNode } from "react";

type TestHeaderProps = {
  /** Timer slot — always top-right during timed modules (4.3) */
  timer?: ReactNode;
};

export function TestHeader({ timer }: TestHeaderProps) {
  return (
    <header className="relative flex h-12 shrink-0 items-center border-b border-surface bg-white px-4 md:h-14 md:px-6">
      {timer ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 md:right-6">
          {timer}
        </div>
      ) : null}
    </header>
  );
}
