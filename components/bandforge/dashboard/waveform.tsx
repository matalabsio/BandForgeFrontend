const BARS = 12;

export function Waveform({ active = false }: { active?: boolean }) {
  return (
    <div
      className="flex h-10 items-end justify-center gap-[3px]"
      aria-hidden={!active}
      role={active ? "img" : undefined}
      aria-label={active ? "Audio activity" : undefined}
    >
      {Array.from({ length: BARS }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-[#06B6D4] ${
            active ? "bf-dash-wave" : "opacity-40"
          }`}
          style={{
            height: `${28 + (i % 4) * 10}%`,
            ...(active ? { animationDelay: `${(i % 6) * 0.1}s` } : {}),
          }}
        />
      ))}
    </div>
  );
}
