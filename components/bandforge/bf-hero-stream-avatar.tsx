"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type MutableRefObject,
} from "react";
import Hls from "hls.js";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  streamUid: string;
  customerCode: string;
  posterUrl?: string | null;
  title?: string;
};

type QualityOption = {
  index: number;
  label: string;
  height: number;
};

function normalizeCustomer(code: string): string {
  return code
    .trim()
    .replace(/^https?:\/\//, "")
    .split(".cloudflarestream.com")[0]
    .replace(/\/$/, "");
}

/**
 * Hero Stream player:
 * - Autoplay muted (browser-safe)
 * - Small speaker chip to unmute
 * - Tap video to pause / play
 * - Quality toggle only on hover
 */
export function BfHeroStreamAvatar({
  className,
  streamUid,
  customerCode,
  posterUrl,
  title = "Avatar demo",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [muted, setMuted] = useState(true);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [qualityIndex, setQualityIndex] = useState(-1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const customer = useMemo(
    () => normalizeCustomer(customerCode),
    [customerCode],
  );

  const poster =
    posterUrl?.trim() ||
    (customer && streamUid
      ? `https://${customer}.cloudflarestream.com/${streamUid}/thumbnails/thumbnail.jpg?time=2s&height=720`
      : "");

  const hlsSrc = useMemo(() => {
    if (!customer || !streamUid) return "";
    return `https://${customer}.cloudflarestream.com/${streamUid}/manifest/video.m3u8`;
  }, [customer, streamUid]);

  const attachHls = useCallback(
    (video: HTMLVideoElement, store: MutableRefObject<Hls | null>) => {
      store.current?.destroy();
      store.current = null;

      const startMuted = async () => {
        video.muted = true;
        setMuted(true);
        try {
          await video.play();
        } catch {
          /* user can tap to start */
        }
      };

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: -1,
          capLevelToPlayerSize: true,
        });
        store.current = hls;
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const options: QualityOption[] = hls.levels
            .map((level, index) => ({
              index,
              height: level.height || 0,
              label: level.height ? `${level.height}p` : `L${index + 1}`,
            }))
            .sort((a, b) => b.height - a.height);
          setQualities(options);
          void startMuted();
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
          if (hls.autoLevelEnabled) setQualityIndex(-1);
          else setQualityIndex(data.level);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsSrc;
        void startMuted();
      }
    },
    [hlsSrc],
  );

  useEffect(() => {
    if (!hlsSrc || !mounted) return;
    const video = videoRef.current;
    if (!video) return;
    attachHls(video, hlsRef);
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [hlsSrc, mounted, attachHls]);

  const unmute = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    try {
      await video.play();
    } catch {
      /* ignore */
    }
  }, []);

  const mute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    setMuted(true);
  }, []);

  const onSpeakerClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (muted) void unmute();
      else mute();
    },
    [muted, unmute, mute],
  );

  const onVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      return;
    }
    video.pause();
  }, []);

  const onQualityChange = useCallback((value: string) => {
    const hls = hlsRef.current;
    if (!hls) return;
    const next = Number(value);
    if (next < 0) {
      hls.currentLevel = -1;
      setQualityIndex(-1);
      return;
    }
    hls.currentLevel = next;
    setQualityIndex(next);
  }, []);

  if (!customer || !streamUid) return null;

  return (
    <div
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-[16px] border border-[#94A3B8]/55 bg-black sm:rounded-[18px]",
        className,
      )}
      style={{ aspectRatio: "16 / 10" }}
      aria-label={title}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
        loop
        poster={poster || undefined}
        onClick={onVideoClick}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      />

      {/* Small speaker — unmute / mute */}
      <button
        type="button"
        onClick={onSpeakerClick}
        aria-label={muted ? "Unmute" : "Mute"}
        title={muted ? "Unmute" : "Mute"}
        className={cn(
          "pointer-events-auto absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2.5 py-1.5 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40",
          muted && "ring-1 ring-cyan/35",
        )}
      >
        {muted ? (
          <VolumeX className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <Volume2 className="size-3.5 shrink-0" aria-hidden />
        )}
        {muted ? (
          <span className="text-[0.65rem] font-medium leading-none">
            Unmute
          </span>
        ) : null}
      </button>

      {/* Quality — hover only */}
      {qualities.length > 0 ? (
        <div
          className={cn(
            "pointer-events-auto absolute bottom-3 right-3 z-20 transition-opacity duration-150",
            hovering ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <select
            value={qualityIndex}
            onChange={(e) => onQualityChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Quality"
            className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[0.7rem] font-medium text-white backdrop-blur-sm outline-none transition hover:bg-black/70 focus:ring-2 focus:ring-cyan/40"
          >
            <option value={-1}>Auto</option>
            {qualities.map((q) => (
              <option key={q.index} value={q.index}>
                {q.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
