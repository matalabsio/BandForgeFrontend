import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function BfSectionEyebrow({ children, className }: Props) {
  return (
    <p
      className={cn(
        "font-mono text-[0.6875rem] tracking-[0.16em] text-cyan uppercase lg:text-xs",
        className,
      )}
    >
      {children}
    </p>
  );
}
