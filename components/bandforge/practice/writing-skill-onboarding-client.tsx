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
          Academic and General Training use different Writing Task 1 content.
          Pick the track that matches your IELTS goal — this cannot be changed
          after you start practising.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const selectedBusy = busy === track.id;
          return (
            <button
              key={track.id}
              type="button"
              disabled={busy !== null}
              onClick={() => void onSelect(track.id)}
              className={cn(
                "rounded-2xl border border-border-soft bg-white p-6 text-left shadow-soft transition",
                "hover:border-cyan/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
                "disabled:cursor-wait disabled:opacity-70",
                selectedBusy && "border-cyan ring-1 ring-cyan/30",
              )}
            >
              <h2 className="font-display text-xl font-bold text-navy">
                {track.title}
              </h2>
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
                {selectedBusy ? "Saving…" : `Continue with ${track.title}`}
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
