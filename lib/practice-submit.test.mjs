/**
 * Node test runner for practice-submit helpers.
 */
import assert from "node:assert/strict";
import test from "node:test";

function resolveSubmitHref(submitConfig, skill) {
  const config = submitConfig ?? {};
  if (config.href && typeof config.href === "string") {
    return config.href;
  }
  switch (skill) {
    case "writing":
      return "/test/writing/task/1?auto=true";
    case "speaking":
      return "/test/1/speaking";
    case "listening":
      return "/test/1/listening";
    case "reading":
      return "/test/1/reading";
    default:
      return `/practice/${skill}`;
  }
}

function appendSkillContext(href, skill) {
  const url = new URL(href, "http://localhost");
  url.searchParams.set("skill_context", skill);
  return `${url.pathname}${url.search}`;
}

function parseVideoEmbed(url) {
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

const PRACTICE_SKILLS = ["listening", "reading", "writing", "speaking"];

function parseSkillContext(value) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed || !PRACTICE_SKILLS.includes(trimmed)) return null;
  return trimmed;
}

test("resolveSubmitHref prefers config href", () => {
  assert.equal(
    resolveSubmitHref({ href: "/test/1/listening" }, "listening"),
    "/test/1/listening",
  );
});

test("resolveSubmitHref falls back per skill", () => {
  assert.equal(resolveSubmitHref({}, "reading"), "/test/1/reading");
  assert.equal(resolveSubmitHref(null, "writing"), "/test/writing/task/1?auto=true");
});

test("appendSkillContext adds query param", () => {
  assert.equal(
    appendSkillContext("/test/1/speaking", "speaking"),
    "/test/1/speaking?skill_context=speaking",
  );
  assert.equal(
    appendSkillContext("/test/1/reading?passage=2", "reading"),
    "/test/1/reading?passage=2&skill_context=reading",
  );
});

test("parseVideoEmbed detects providers", () => {
  assert.deepEqual(parseVideoEmbed(""), { kind: "none" });
  assert.equal(
    parseVideoEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ").kind,
    "youtube",
  );
  assert.equal(parseVideoEmbed("https://vimeo.com/12345").kind, "vimeo");
});

test("parseSkillContext validates skill", () => {
  assert.equal(parseSkillContext("listening"), "listening");
  assert.equal(parseSkillContext(" LISTENING "), "listening");
  assert.equal(parseSkillContext("invalid"), null);
  assert.equal(parseSkillContext(undefined), null);
});
