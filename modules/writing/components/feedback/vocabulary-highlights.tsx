import type { WritingVocabTag } from "@/modules/writing/types";

type Props = {
  strongWords: string[];
  weakWords: WritingVocabTag[];
  onWeakWordClick?: (word: string) => void;
};

export function VocabularyHighlights({
  strongWords,
  weakWords,
  onWeakWordClick,
}: Props) {
  if (strongWords.length === 0 && weakWords.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
        Vocabulary highlights
      </p>

      {strongWords.length > 0 ? (
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#64748B]">
            Strong words you used
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {strongWords.map((word) => (
              <span
                key={word}
                className="rounded-full bg-[#ECFEFF] px-3 py-1 text-[12px] font-semibold text-teal"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {weakWords.length > 0 ? (
        <div className="mt-5">
          <p className="text-[12px] font-semibold text-[#64748B]">
            Repeated / weak — try instead
          </p>
          <ul className="mt-2 space-y-2">
            {weakWords.map(({ word, alternatives }) => (
              <li
                key={word}
                className="flex flex-wrap items-center gap-2 text-[12px]"
              >
                {onWeakWordClick ? (
                  <button
                    type="button"
                    onClick={() => onWeakWordClick(word)}
                    className="rounded-full bg-surface px-2.5 py-1 font-medium text-[#64748B] line-through decoration-[#94A3B8] hover:ring-1 hover:ring-cyan/40"
                  >
                    {word}
                  </button>
                ) : (
                  <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-[#64748B] line-through decoration-[#94A3B8]">
                    {word}
                  </span>
                )}
                <span className="text-[#94A3B8]" aria-hidden>
                  →
                </span>
                {alternatives?.map((alt) => (
                  <span
                    key={alt}
                    className="rounded-full bg-[#ECFEFF] px-2.5 py-1 font-semibold text-teal"
                  >
                    {alt}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
