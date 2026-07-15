"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import {
  fetchTutorSuggestions,
  loadTutorTurns,
  saveTutorTurns,
  tutorChat,
} from "@/lib/tutor-api";
import type { TutorSuggestion, TutorTurn } from "@/lib/tutor-types";
import { cn } from "@/lib/utils";

const FALLBACK_CHIPS: TutorSuggestion[] = [
  {
    id: "why_band",
    label: "Why this band?",
    message: "Why did I get this band on my essay?",
  },
  {
    id: "grammar",
    label: "Explain grammar",
    message: "Explain this grammar mistake from my report.",
  },
  {
    id: "rewrite",
    label: "Rewrite paragraph",
    message: "Rewrite my last paragraph more clearly.",
  },
  {
    id: "band8",
    label: "Band 8 version",
    message: "Give a Band 8 version of my essay opening.",
  },
  {
    id: "vocab",
    label: "Stronger vocabulary",
    message: "Suggest stronger vocabulary for the weak words in my essay.",
  },
  {
    id: "coherence",
    label: "Explain coherence",
    message: "Explain my coherence score and how to improve it in this essay.",
  },
];

type Props = {
  attemptId: string;
  selection?: string | null;
  onClearSelection?: () => void;
  defaultOpen?: boolean;
};

export function TutorChatPanel({
  attemptId,
  selection = null,
  onClearSelection,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [turns, setTurns] = useState<TutorTurn[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<TutorSuggestion[]>(FALLBACK_CHIPS);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setTurns(loadTutorTurns(attemptId));
  }, [attemptId]);

  useEffect(() => {
    if (selection) setOpen(true);
  }, [selection]);

  useEffect(() => {
    let cancelled = false;
    void fetchTutorSuggestions(attemptId)
      .then((res) => {
        if (!cancelled && res.suggestions?.length) {
          setSuggestions(res.suggestions);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const send = useCallback(
    (message: string, withSelection?: string | null) => {
      const text = message.trim();
      if (!text || pending) return;
      setError(null);
      const prior = loadTutorTurns(attemptId);
      const nextUser: TutorTurn = { role: "user", content: text };
      const optimistic = [...prior, nextUser];
      setTurns(optimistic);
      saveTutorTurns(attemptId, optimistic);
      setInput("");

      startTransition(async () => {
        try {
          const res = await tutorChat({
            attemptId,
            message: text,
            selection: withSelection ?? selection,
            turns: prior,
          });
          const withAssistant: TutorTurn[] = [
            ...optimistic,
            { role: "assistant", content: res.reply },
          ];
          setTurns(withAssistant);
          saveTutorTurns(attemptId, withAssistant);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Coach unavailable");
          setTurns(prior);
          saveTutorTurns(attemptId, prior);
        }
      });
    },
    [attemptId, pending, selection],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-3",
          "text-sm font-semibold text-white shadow-lg shadow-cyan/25 transition hover:bg-teal",
          "md:bottom-8 md:right-8",
          open && "hidden",
        )}
      >
        <MessageCircle className="size-4" />
        Ask coach
      </button>

      {open ? (
        <aside
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border border-ink/10 bg-white shadow-2xl",
            "md:inset-y-4 md:right-4 md:left-auto md:w-[400px] md:max-h-none md:rounded-2xl",
          )}
          aria-label="AI writing coach"
        >
          <header className="flex items-start gap-3 border-b border-ink/8 px-4 py-3">
            <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-cyan/12 text-cyan">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[16px] font-bold text-navy">MATA Coach</h2>
              <p className="text-[11px] text-ink/50">
                Using your essay &amp; score report
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-ink/50 hover:bg-ink/5 hover:text-ink"
              aria-label="Close coach"
            >
              <X className="size-4" />
            </button>
          </header>

          {selection ? (
            <div className="flex items-start gap-2 border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-[12px] text-amber-900">
              <p className="min-w-0 flex-1 line-clamp-2">
                Selection: &ldquo;{selection}&rdquo;
              </p>
              {onClearSelection ? (
                <button
                  type="button"
                  className="shrink-0 font-semibold underline"
                  onClick={onClearSelection}
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5 border-b border-ink/6 px-3 py-2">
            {suggestions.slice(0, 6).map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={pending}
                onClick={() => {
                  setOpen(true);
                  send(s.message);
                }}
                className="rounded-full border border-cyan/25 bg-cyan/5 px-2.5 py-1 text-[11px] font-semibold text-teal hover:bg-cyan/10 disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-ink/60">
                Ask why you got this band, explain a grammar mistake, rewrite a
                paragraph, get a Band 8 version, stronger vocabulary, or
                coherence tips — answers use this attempt&apos;s evaluation.
              </p>
            ) : null}
            {turns.map((t, i) => (
              <div
                key={`${t.role}-${i}`}
                className={cn(
                  "rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                  t.role === "user"
                    ? "ml-6 bg-cyan/10 text-navy"
                    : "mr-4 border border-ink/8 bg-surface text-ink/85",
                )}
              >
                {t.content}
              </div>
            ))}
            {pending ? (
              <p className="text-[12px] font-medium text-cyan">Coach is thinking…</p>
            ) : null}
            {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
          </div>

          <form
            className="flex gap-2 border-t border-ink/8 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this essay…"
              disabled={pending}
              className="min-h-[44px] flex-1 rounded-xl border border-ink/12 bg-white px-3 text-[13px] outline-none focus:border-cyan"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="inline-flex size-11 items-center justify-center rounded-xl bg-cyan text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </aside>
      ) : null}
    </>
  );
}
