"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import {
  WRITING_PRACTICE_PATH,
  probeWritingSkillTrackState,
  selectWritingSkillTrack,
} from "@/lib/writing-skill-track";
import type { WritingSkillExamModule } from "@/lib/practice-api";
import { cn } from "@/lib/utils";

const TRACKS: Array<{
  id: WritingSkillExamModule;
  title: string;
  subtitle: string;
  points: string[];
  /** No GT PCI inventory yet — keep selectable Academic only. */
  available: boolean;
  comingSoonHint?: string;
}> = [
  {
    id: "academic",
    title: "Academic",
    subtitle: "Education / university / academic context",
    points: [
      "Task 1 charts, graphs, maps, and processes",
      "Task 2 academic-style essays",
      "Matched to university and professional study goals",
    ],
    available: true,
  },
  {
    id: "general_training",
    title: "General Training",
    subtitle: "Immigration / work / general training context",
    points: [
      "Task 1 letters for everyday and workplace situations",
      "Task 2 essays for general training",
      "Matched to visa, work, and migration goals",
    ],
    available: false,
    comingSoonHint: "Coming soon — GT practice sets are not available yet",
  },
];

export function WritingSkillOnboardingClient() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState<WritingSkillExamModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const state = await probeWritingSkillTrackState();
        if (!active) return;
        if (state === "ready") {
          router.replace(WRITING_PRACTICE_PATH);
          return;
        }
        if (state === "forbidden") {
          router.replace("/pricing");
          return;
        }
      } catch {
        /* show picker */
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const onSelect = useCallback(
    async (examModule: WritingSkillExamModule) => {
      const track = TRACKS.find((t) => t.id === examModule);
      if (!track?.available) return;

      setError(null);
      setBusy(examModule);
      try {
        const { path } = await selectWritingSkillTrack(examModule);
        router.replace(path);
      } catch (e) {
        setError(
          e instanceof ApiError
            ? e.message
            : "Could not save your exam track. Please try again.",
        );
        setBusy(null);
      }
    },
    [router],
  );

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center px-4 py-16">
        <p className="text-sm text-muted">Checking your Writing Skill access…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Writing Skill
        </p>
        <h1 className="font-display mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
          Choose your exam track
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Academic Writing sets are ready now. General Training will unlock when
          its practice inventory ships — pick Academic to start practising.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const selectedBusy = busy === track.id;
          const disabled = !track.available || busy !== null;
          return (
            <button
              key={track.id}
              type="button"
              disabled={disabled}
              onClick={() => void onSelect(track.id)}
              title={
                !track.available ? track.comingSoonHint : undefined
              }
              className={cn(
                "rounded-2xl border border-border-soft bg-white p-6 text-left shadow-soft transition",
                track.available &&
                  "hover:border-cyan/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
                track.available
                  ? "disabled:cursor-wait disabled:opacity-70"
                  : "cursor-not-allowed opacity-55",
                selectedBusy && "border-cyan ring-1 ring-cyan/30",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-navy">
                  {track.title}
                </h2>
                {!track.available ? (
                  <span className="shrink-0 rounded-full bg-[#F1F4F8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#5A6B82]">
                    Coming soon
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium text-cyan">{track.subtitle}</p>
              <ul className="mt-4 space-y-2">
                {track.points.map((point) => (
                  <li
                    key={point}
                    className="text-sm leading-snug text-muted before:mr-2 before:text-cyan before:content-['·']"
                  >
                    {point}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex text-sm font-semibold text-navy">
                {!track.available
                  ? track.comingSoonHint
                  : selectedBusy
                    ? "Saving…"
                    : `Continue with ${track.title}`}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-6 text-center text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
