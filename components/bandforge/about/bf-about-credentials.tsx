import type { AboutCredentialIcon } from "@/lib/brand-mock-data";
import { BRAND_ABOUT_CREDENTIALS } from "@/lib/brand-mock-data";
import { cn } from "@/lib/utils";

function CredentialIcon({ icon }: { icon: AboutCredentialIcon }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-cyan",
  };

  switch (icon) {
    case "star":
      return (
        <svg {...props}>
          <path d="M12 2l2.4 6.9H22l-6 4.6 2.3 7L12 16.9 5.7 20.5l2.3-7-6-4.6h7.6z" />
        </svg>
      );
    case "medal":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="6" />
          <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" />
        </svg>
      );
    case "graduation":
      return (
        <svg {...props}>
          <path d="M22 10L12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
  }
}

function CredentialValue({
  value,
  mono,
}: {
  value: string;
  mono?: boolean;
}) {
  if (mono) {
    return (
      <p className="font-mono text-2xl leading-none font-medium text-cyan lg:text-[1.625rem]">
        {value}
      </p>
    );
  }
  return (
    <p className="font-display text-[1.0625rem] leading-tight font-bold text-navy lg:text-base">
      {value}
    </p>
  );
}

export function BfAboutCredentials() {
  return (
    <section className="border-y border-border-soft bg-surface-alt">
      {/* Desktop: horizontal strip */}
      <div className="bf-container hidden py-11 lg:grid lg:grid-cols-4 lg:gap-6">
        {BRAND_ABOUT_CREDENTIALS.map((item) => (
          <div key={item.label} className="flex items-center gap-[18px]">
            <div className="flex size-[54px] shrink-0 items-center justify-center rounded-[0.875rem] bg-cyan-soft">
              <CredentialIcon icon={item.icon} />
            </div>
            <div>
              <CredentialValue value={item.value} mono={item.mono} />
              <p className="mt-1 text-sm leading-snug text-muted">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: 2×2 card grid */}
      <div className="bf-container grid grid-cols-2 gap-3 px-7 py-11 lg:hidden">
        {BRAND_ABOUT_CREDENTIALS.map((item) => (
          <article
            key={item.label}
            className="rounded-[0.875rem] bg-white p-5 shadow-[0_6px_20px_rgb(13_31_60/0.06)]"
          >
            <div className="mb-3.5 flex size-10 items-center justify-center rounded-[11px] bg-cyan-soft">
              <CredentialIcon icon={item.icon} />
            </div>
            <CredentialValue value={item.value} mono={item.mono} />
            <p className={cn("text-[0.8125rem] leading-snug text-muted", item.mono ? "mt-1.5" : "mt-1.5")}>
              {item.label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
