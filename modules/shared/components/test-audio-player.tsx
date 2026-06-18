"use client";

import { useRef, useState } from "react";
import { IconPause, IconPlay } from "@/components/icons";
import { cn } from "@/lib/utils";

type TestAudioPlayerProps = {
  src: string;
  className?: string;
};

/**
 * Listening-module audio — thumb-friendly controls (4.4).
 */
export function TestAudioPlayer({ src, className }: TestAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      await el.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-surface bg-white p-4",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        preload="metadata"
        aria-label="Listening test audio"
      />
      <button
        type="button"
        onClick={toggle}
        className="touch-target flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-teal text-white transition-colors duration-200 hover:bg-cyan-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 motion-reduce:transition-none"
        aria-label={playing ? "Pause audio" : "Play audio"}
      >
        {playing ? (
          <IconPause className="size-6" />
        ) : (
          <IconPlay className="size-6" />
        )}
      </button>
      <p className="text-body text-ink/80">
        Tap to play or pause the recording. Controls are sized for one-thumb use.
      </p>
    </div>
  );
}
