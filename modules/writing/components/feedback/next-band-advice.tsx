type Props = {
  advice: string;
  reviewerNotes?: string | null;
  showExaminerNotes?: boolean;
};

export function NextBandAdvice({
  advice,
  reviewerNotes,
  showExaminerNotes = true,
}: Props) {
  return (
    <section className="rounded-2xl border border-cyan/20 bg-cyan-soft/30 p-5 shadow-sm sm:p-6">
      <h3 className="font-display text-[18px] font-bold text-[#0D1F3C]">
        Next Band Advice
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#334155]">{advice}</p>
      {showExaminerNotes && reviewerNotes ? (
        <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[12px] text-[#475569]">
          Examiner note: {reviewerNotes}
        </p>
      ) : null}
    </section>
  );
}
