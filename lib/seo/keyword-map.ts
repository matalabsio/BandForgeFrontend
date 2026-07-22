/**
 * Playbook Section 2 — Keyword map (canonical targeting reference).
 * Use for page metadata, blog planning, llms.txt, and internal SEO tooling.
 * Do not publish tier-3 head terms as primary H1 targets in year 1.
 */

export type KeywordTier =
  | 1
  | 2
  | 3
  | "telugu-transliterated"
  | "urdu-corridor";

export type KeywordPriority = "P1" | "P2" | "P3";

export type KeywordEntry = {
  /** Search phrase (lowercase, playbook wording). */
  phrase: string;
  tier: KeywordTier;
  /** Primary URL path to rank (e.g. `/telugu`). */
  targetPath?: string;
  /** Content priority within tier (P3 = highest-intent retaker cluster). */
  priority?: KeywordPriority;
  /** Ops / product blocker before building dedicated copy. */
  confirmRequired?: boolean;
  notes?: string;
};

/** Tier 1 — winnable now; build pages/posts against these first. */
export const TIER_1_KEYWORDS: KeywordEntry[] = [
  { phrase: "ielts for telugu speakers", tier: 1, targetPath: "/telugu", priority: "P1" },
  { phrase: "ielts coaching in telugu", tier: 1, targetPath: "/telugu", priority: "P1" },
  { phrase: "ielts telugu", tier: 1, targetPath: "/telugu", priority: "P1" },
  { phrase: "ielts coaching in urdu", tier: 1, targetPath: "/urdu", priority: "P1" },
  { phrase: "ielts for urdu speakers", tier: 1, targetPath: "/urdu", priority: "P1" },
  {
    phrase: "free ielts diagnostic test",
    tier: 1,
    targetPath: "/diagnostic",
    priority: "P1",
  },
  {
    phrase: "ielts mock test online free",
    tier: 1,
    targetPath: "/diagnostic",
    priority: "P1",
  },
  {
    phrase: "check ielts band score online",
    tier: 1,
    targetPath: "/diagnostic",
    priority: "P1",
  },
  {
    phrase: "ielts online coaching hyderabad",
    tier: 1,
    targetPath: "/hyderabad",
    priority: "P1",
  },
  {
    phrase: "ielts coaching gachibowli",
    tier: 1,
    targetPath: "/hyderabad",
    priority: "P1",
  },
  {
    phrase: "ielts writing evaluation online",
    tier: 1,
    targetPath: "/writing",
    priority: "P1",
  },
  {
    phrase: "ielts speaking evaluation online",
    tier: 1,
    targetPath: "/speaking",
    priority: "P1",
  },
  {
    phrase: "ielts band score calculator",
    tier: 1,
    targetPath: "/diagnostic",
    priority: "P1",
    notes: "Diagnostic delivers section-wise bands; dedicated calculator tool optional later.",
  },
  {
    phrase: "ielts retake preparation",
    tier: 1,
    targetPath: "/blog/ielts-retake-preparation",
    priority: "P3",
    notes: "Blog post #1 + Writing/Speaking sprint pages.",
  },
  {
    phrase: "ielts 6.5 to 7",
    tier: 1,
    targetPath: "/writing",
    priority: "P3",
    notes: "Blog post #1 + sprint pages.",
  },
  {
    phrase: "ielts score not improving",
    tier: 1,
    targetPath: "/writing",
    priority: "P3",
    notes: "Blog post #1 + sprint pages.",
  },
  {
    phrase: "improve ielts score second attempt",
    tier: 1,
    targetPath: "/speaking",
    priority: "P3",
    notes: "Blog post #1 + sprint pages. Highest-intent retaker cluster.",
  },
];

/** Tier 2 — 3–6 month targets. */
export const TIER_2_KEYWORDS: KeywordEntry[] = [
  {
    phrase: "best ielts online coaching india",
    tier: 2,
    targetPath: "/vs-coaching-centres",
    priority: "P2",
  },
  {
    phrase: "ielts online classes telugu",
    tier: 2,
    targetPath: "/telugu",
    priority: "P2",
  },
  {
    phrase: "ielts preparation for indian students",
    tier: 2,
    targetPath: "/",
    priority: "P2",
  },
  {
    phrase: "ielts coaching hyderabad fees",
    tier: 2,
    targetPath: "/hyderabad",
    priority: "P2",
  },
  {
    phrase: "ielts general training preparation online",
    tier: 2,
    confirmRequired: true,
    notes: "[CONFIRM GT support]",
  },
  {
    phrase: "ielts for nurses uk",
    tier: 2,
    targetPath: "/urdu",
    confirmRequired: true,
    notes: "Urdu-corridor healthcare route — [CONFIRM GT]",
  },
];

/** Tier 3 — head terms; rank via local pack + GEO in year 1, not blue-link H1s. */
export const TIER_3_KEYWORDS: KeywordEntry[] = [
  {
    phrase: "best ielts coaching in hyderabad",
    tier: 3,
    targetPath: "/hyderabad",
    notes: "GBP + GEO; not primary organic H1 in year 1.",
  },
  {
    phrase: "best ielts test prep",
    tier: 3,
    targetPath: "/",
    notes: "GEO / brand mentions; not primary H1 in year 1.",
  },
  {
    phrase: "ielts coaching near me",
    tier: 3,
    targetPath: "/hyderabad",
    notes: "Local pack + GBP; not primary organic H1 in year 1.",
  },
];

/** Telugu-transliterated queries (people type these). */
export const TELUGU_TRANSLITERATED_KEYWORDS: KeywordEntry[] = [
  { phrase: "ielts telugu lo", tier: "telugu-transliterated", targetPath: "/telugu" },
  {
    phrase: "ielts ela prepare avvali",
    tier: "telugu-transliterated",
    targetPath: "/telugu",
  },
  {
    phrase: "ielts band ela penchali",
    tier: "telugu-transliterated",
    targetPath: "/telugu",
  },
  {
    phrase: "ielts speaking telugu",
    tier: "telugu-transliterated",
    targetPath: "/telugu",
  },
  {
    phrase: "study abroad telugu",
    tier: "telugu-transliterated",
    targetPath: "/telugu",
  },
];

/** Urdu / Roman-Urdu + Hyderabad corridor queries. */
export const URDU_CORRIDOR_KEYWORDS: KeywordEntry[] = [
  { phrase: "ielts coaching urdu", tier: "urdu-corridor", targetPath: "/urdu" },
  { phrase: "ielts ki tayari", tier: "urdu-corridor", targetPath: "/urdu" },
  { phrase: "ielts urdu me", tier: "urdu-corridor", targetPath: "/urdu" },
  {
    phrase: "ielts coaching mehdipatnam",
    tier: "urdu-corridor",
    targetPath: "/hyderabad",
  },
  {
    phrase: "ielts coaching tolichowki",
    tier: "urdu-corridor",
    targetPath: "/hyderabad",
  },
  {
    phrase: "ielts coaching old city hyderabad",
    tier: "urdu-corridor",
    targetPath: "/hyderabad",
  },
  {
    phrase: "ielts for canada pr",
    tier: "urdu-corridor",
    targetPath: "/urdu",
    confirmRequired: true,
    notes: "[CONFIRM GT]",
  },
  {
    phrase: "ielts for uk nursing",
    tier: "urdu-corridor",
    targetPath: "/urdu",
    confirmRequired: true,
    notes: "[CONFIRM GT]",
  },
];

/** Full playbook Section 2 map — single export for tooling. */
export const KEYWORD_MAP = {
  tier1: TIER_1_KEYWORDS,
  tier2: TIER_2_KEYWORDS,
  tier3: TIER_3_KEYWORDS,
  teluguTransliterated: TELUGU_TRANSLITERATED_KEYWORDS,
  urduCorridor: URDU_CORRIDOR_KEYWORDS,
} as const;

export const ALL_KEYWORDS: KeywordEntry[] = [
  ...TIER_1_KEYWORDS,
  ...TIER_2_KEYWORDS,
  ...TIER_3_KEYWORDS,
  ...TELUGU_TRANSLITERATED_KEYWORDS,
  ...URDU_CORRIDOR_KEYWORDS,
];

/** Retaker cluster — P3 highest-intent; blog post #1 + sprint pages own these. */
export const RETAKER_CLUSTER_KEYWORDS = TIER_1_KEYWORDS.filter(
  (entry) => entry.priority === "P3",
);

/** Primary sprint page paths that share retaker-cluster ownership with blog #1. */
export const RETAKER_CLUSTER_TARGET_PATHS = [
  "/writing",
  "/speaking",
  "/blog/ielts-retake-preparation",
] as const;

export function getKeywordsForPath(path: string): KeywordEntry[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return ALL_KEYWORDS.filter((entry) => entry.targetPath === normalized);
}

export function getPrimaryKeywordsForPath(path: string): string[] {
  return getKeywordsForPath(path).map((entry) => entry.phrase);
}

type LlmsKeywordSection = {
  title: string;
  intro?: string;
  entries: KeywordEntry[];
};

const LLMS_KEYWORD_SECTIONS: LlmsKeywordSection[] = [
  {
    title: "Tier 1 — winnable now",
    intro:
      "Build pages and posts against these first. Retaker cluster (P3) is highest-intent — blog post #1 and sprint pages.",
    entries: TIER_1_KEYWORDS,
  },
  {
    title: "Tier 2 — 3–6 month targets",
    entries: TIER_2_KEYWORDS,
  },
  {
    title: "Tier 3 — head terms (year 1 via local pack + GEO)",
    intro: "Do not target as primary blue-link H1s in year 1.",
    entries: TIER_3_KEYWORDS,
  },
  {
    title: "Telugu-transliterated queries",
    entries: TELUGU_TRANSLITERATED_KEYWORDS,
  },
  {
    title: "Urdu / Roman-Urdu + corridor queries",
    entries: URDU_CORRIDOR_KEYWORDS,
  },
];

function formatKeywordLine(entry: KeywordEntry): string {
  const parts = [`- ${entry.phrase}`];
  if (entry.targetPath) parts.push(`→ ${entry.targetPath}`);
  if (entry.priority) parts.push(`(${entry.priority})`);
  if (entry.confirmRequired) parts.push("[CONFIRM]");
  if (entry.notes) parts.push(`— ${entry.notes}`);
  return parts.join(" ");
}

/** Markdown block for llms.txt / AI crawler context (playbook Section 2). */
export function buildKeywordMapLlmsSection(): string {
  return [
    "## Keyword map (Section 2)",
    "",
    ...LLMS_KEYWORD_SECTIONS.flatMap(({ title, intro, entries }, index) => [
      `### ${title}`,
      "",
      ...(intro ? [intro, ""] : []),
      ...entries.map(formatKeywordLine),
      ...(index < LLMS_KEYWORD_SECTIONS.length - 1 ? [""] : []),
    ]),
  ].join("\n");
}
