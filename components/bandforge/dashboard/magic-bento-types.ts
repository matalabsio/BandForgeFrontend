export type MagicBentoSkillBar = {
  key: string;
  label: string;
  /** Band score or null if unscored */
  value: number | null;
  /** 0–100 fill */
  pct: number;
};

export type MagicBentoWeekBar = {
  letter: string;
  pct: number;
  isToday: boolean;
};

export type MagicBentoHubBar = {
  key: string;
  label: string;
  pct: number;
  unlocked: boolean;
};

export type MagicBentoHeatDay = {
  key: string;
  count: number;
  empty: boolean;
  isToday: boolean;
  future: boolean;
};

export type MagicBentoVisual =
  | {
      kind: "cta";
      /** 0–100 today completion hint */
      progress: number;
      ready: boolean;
    }
  | {
      kind: "gap";
      current: number | null;
      target: number;
      /** current/target as 0–100 */
      pct: number;
      gap: number;
    }
  | {
      kind: "skills";
      bars: MagicBentoSkillBar[];
      scoredCount: number;
    }
  | {
      kind: "week";
      bars: MagicBentoWeekBar[];
      done: number;
      total: number;
      /** Overall week completion 0–100 */
      pct: number;
    }
  | {
      kind: "hubs";
      bars: MagicBentoHubBar[];
      completed: number;
      total: number;
    }
  | {
      kind: "streak";
      current: number;
      longest: number;
      /** Progress toward next milestone, 0–100 */
      pct: number;
      nextMilestone: number;
      monthLabel: string;
      days: MagicBentoHeatDay[];
    }
  | {
      kind: "writing";
      completed: number;
      total: number;
      /** 0–100 hub completion */
      pct: number;
      mockUnlocked: boolean;
    };

export type MagicBentoCardIcon =
  | "practice"
  | "progress"
  | "skills"
  | "focus"
  | "hubs"
  | "streak"
  | "writing";

export type MagicBentoCardData = {
  label: string;
  title: string;
  description: string;
  color?: string;
  /** When set with ctaLabel, only the CTA chip navigates — never the whole card. */
  href?: string;
  /** Action chip (e.g. Start now) — only real button on the card. */
  ctaLabel?: string;
  /** Soft exam-date meta shown beside Progress meta chip */
  examLabel?: string;
  /** Non-click liquid chip (e.g. “60 days left”) — not a button. */
  metaLabel?: string;
  icon?: MagicBentoCardIcon;
  visual?: MagicBentoVisual;
  /** Placeholder slot — no content, link, or hover chrome. */
  empty?: boolean;
};
