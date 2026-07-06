type Props = {
  rawScore: number;
  total: number;
  caption?: string;
};

export function ModuleScoreHero({ rawScore, total, caption = "correct" }: Props) {
  return (
    <section className="rounded-2xl border border-[#E3E9F1] bg-white px-4 py-6 text-center shadow-[0_12px_40px_rgba(13,31,60,0.06)] sm:py-7">
      <div className="font-mono text-3xl font-medium leading-none text-cyan sm:text-4xl">
        {rawScore} <span className="text-[#94A3B8]">/</span> {total}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#94A3B8]">
        {caption}
      </div>
    </section>
  );
}
