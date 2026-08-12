import type { PracticeSkill } from "@/lib/practice-types";
import { isPracticeSkill } from "@/lib/practice-types";
import { shortModuleExamPath } from "@/lib/mock-catalog";
import { writingTaskPath } from "@/lib/writing-test";

export type SubmitConfig = {
  type?: string;
  module?: string;
  href?: string;
  submit_route?: string;
  catalog_number?: number;
  part?: number;
  hub_id?: string;
};

function catalogNumber(config: SubmitConfig): 1 | 2 {
  const n = Number(config.catalog_number);
  return n === 2 ? 2 : 1;
}

function partNumber(config: SubmitConfig, fallback = 1): number {
  const n = Number(config.part);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** True when hub should open mock module UI instead of thin bank exercise. */
export function isModuleSubmitTarget(
  submitConfig: SubmitConfig | Record<string, unknown> | null | undefined,
): boolean {
  const config = (submitConfig ?? {}) as SubmitConfig;
  if (config.type === "module") return true;
  if (typeof config.href === "string" && config.href.includes("/test/")) {
    return true;
  }
  if (config.catalog_number != null) return true;
  return false;
}

/** Build mock module path from submit_config (no plan query params). */
export function moduleHrefFromSubmitConfig(
  submitConfig: SubmitConfig | Record<string, unknown> | null | undefined,
  skill: PracticeSkill,
): string | null {
  const config = (submitConfig ?? {}) as SubmitConfig;
  if (config.href && typeof config.href === "string" && config.href.includes("/test/")) {
    return config.href;
  }
  if (!isModuleSubmitTarget(config) && config.type === "bank") {
    return null;
  }
  if (!isModuleSubmitTarget(config) && config.type && config.type !== "module") {
    return null;
  }

  const catalog = catalogNumber(config);
  const part = partNumber(config);

  switch (skill) {
    case "listening":
      return `/test/${catalog}/listening?part=${part}&auto=1&skill_context=listening`;
    case "reading":
      return `/test/${catalog}/reading?passage=${part}&auto=1&skill_context=reading`;
    case "writing": {
      const task = part >= 2 ? 2 : 1;
      const mock = catalog === 2 ? "m02" : "m01";
      return `/test/writing/task/${task}?auto=1&skill_context=writing&mock=${mock}`;
    }
    case "speaking":
      return `/test/${catalog}/speaking?auto=1&skill_context=speaking`;
    default:
      return null;
  }
}

export function resolveSubmitHref(
  submitConfig: SubmitConfig | Record<string, unknown> | null | undefined,
  skill: PracticeSkill,
): string {
  const config = (submitConfig ?? {}) as SubmitConfig;
  const moduleHref = moduleHrefFromSubmitConfig(config, skill);
  if (moduleHref) return moduleHref;

  if (config.href && typeof config.href === "string") {
    return config.href;
  }
  if (config.type === "bank") {
    return `/practice/${skill}`;
  }

  switch (skill) {
    case "writing":
      return writingTaskPath(1, { auto: true });
    case "speaking":
      return shortModuleExamPath(1, "speaking");
    case "listening":
      return shortModuleExamPath(1, "listening");
    case "reading":
      return shortModuleExamPath(1, "reading");
    default:
      return `/practice/${skill}`;
  }
}

export function skillMockPath(skill: PracticeSkill): string {
  return `/practice/${skill}/mock`;
}

export function parseSkillContext(
  value: string | null | undefined,
): PracticeSkill | null {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed || !isPracticeSkill(trimmed)) return null;
  return trimmed;
}

export function appendSkillContext(href: string, skill: PracticeSkill): string {
  const url = new URL(href, "http://localhost");
  url.searchParams.set("skill_context", skill);
  const path = `${url.pathname}${url.search}`;
  return path;
}

export type VideoEmbed =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "stream"; embedUrl: string }
  | { kind: "direct"; embedUrl: string }
  | { kind: "none" };

export function parseVideoEmbed(url: string): VideoEmbed {
  const trimmed = url.trim();
  if (!trimmed) return { kind: "none" };

  const ytMatch =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/) ??
    trimmed.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (ytMatch?.[1]) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  const streamMatch = trimmed.match(
    /(?:https?:\/\/)?(customer-[a-z0-9]+)\.cloudflarestream\.com\/([a-zA-Z0-9]+)(?:\/(?:iframe|watch|manifest\/video\.m3u8))?/i,
  );
  if (streamMatch?.[1] && streamMatch[2]) {
    return {
      kind: "stream",
      embedUrl: `https://${streamMatch[1]}.cloudflarestream.com/${streamMatch[2]}/iframe`,
    };
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/api/")) {
    return {
      kind: "direct",
      embedUrl: trimmed,
    };
  }

  return { kind: "none" };
}
