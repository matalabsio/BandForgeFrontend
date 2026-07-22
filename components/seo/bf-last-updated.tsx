type Props = {
  date: string;
  className?: string;
};

export function BfLastUpdated({ date, className }: Props) {
  return (
    <p
      className={
        className ??
        "text-meta font-medium text-ink/50"
      }
    >
      Last updated: {date}
    </p>
  );
}
