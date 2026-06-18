import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function BfSectionHeading({
  children,
  className,
  as: Tag = "h2",
}: Props) {
  return (
    <Tag
      className={cn(
        "font-display text-[1.625rem] leading-[1.1] font-bold tracking-[-0.025em] text-navy lg:text-[2.375rem] lg:leading-[1.08] lg:tracking-[-0.03em]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
