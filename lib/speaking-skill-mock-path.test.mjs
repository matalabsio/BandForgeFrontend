/**
 * Speaking skill mock exam path — must use skill_context only, never from=plan.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(
  path.join(here, "speaking-skill-mock-path.ts"),
  "utf8",
);

test("speakingSkillMockExamPath source includes skill_context=speaking", () => {
  assert.match(src, /skill_context=speaking/);
});

test("speakingSkillMockExamPath return values do not append from=plan", () => {
  const returns = [...src.matchAll(/return `\$\{base\}\$\{sep\}([^`]+)`/g)].map(
    (m) => m[1],
  );
  assert.ok(returns.length >= 1);
  for (const qs of returns) {
    assert.equal(qs.includes("from=plan"), false);
    assert.match(qs, /skill_context=speaking/);
  }
});
