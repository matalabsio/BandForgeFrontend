import type { PracticeSkill } from "@/lib/practice-types";
import { isPracticeSkill } from "@/lib/practice-types";
import { shortModuleExamPath } from "@/lib/mock-catalog";
import { writingTaskPath } from "@/lib/writing-test";

type SubmitConfig = {
  type?: string;
  module?: string;
  href?: string;
  submit_route?: string;
};

export function resolveSubmitHref(
  submitConfig: SubmitConfig | Record<string, unknown> | null | undefined,
  skill: PracticeSkill,
): string {
  const config = (submitConfig ?? {}) as SubmitConfig;
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

  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: "direct", embedUrl: trimmed };
  }

  return { kind: "none" };
}
