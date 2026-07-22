type Props = {
  children: string;
  className?: string;
};

/** Visible AEO lead answer — keep copy ≤50 words in the first sentence. */
export function BfSeoLeadAnswer({ children, className }: Props) {
  return (
    <p
      className={
        className ??
        "text-base leading-relaxed text-ink/75 sm:text-lg"
      }
    >
      {children}
    </p>
  );
}
