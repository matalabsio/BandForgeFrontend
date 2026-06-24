/**
 * Validates the generated diagnostic pack.json structure and counts.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseDiagnosticPack(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid diagnostic pack: not an object.");
  }
  const root = data;
  const listening = root.listening;
  const reading = root.reading;
  const writing = root.writing;
  const speaking = root.speaking;

  if (!listening?.questions?.length) throw new Error("missing listening questions");
  if (!reading?.questions?.length) throw new Error("missing reading questions");
  if (!writing?.tasks?.length) throw new Error("missing writing tasks");
  if (!speaking?.part1?.questions?.length) throw new Error("missing speaking questions");

  return {
    listeningCount: listening.questions.length,
    readingCount: reading.questions.length,
    writingCount: writing.tasks.length,
    speakingCount: speaking.part1.questions.length,
    readingTitle: reading.title,
    part2Enabled: speaking.part2?.enabled,
    listeningTypes: new Set(listening.questions.map((q) => q.type)),
  };
}

test("pack.json has Test 1 marketing slice counts", () => {
  const packPath = path.join(__dirname, "../public/diagnostic/pack.json");
  const raw = JSON.parse(fs.readFileSync(packPath, "utf8"));
  const pack = parseDiagnosticPack(raw);

  assert.equal(pack.listeningCount, 10);
  assert.equal(pack.readingCount, 13);
  assert.equal(pack.writingCount, 1);
  assert.equal(pack.speakingCount, 1);
  assert.equal(pack.readingTitle, "The Hidden Forces Behind Everyday Choices");
  assert.equal(pack.part2Enabled, false);
  assert.ok(pack.listeningTypes.has("form_completion"));
  assert.equal(raw.listening.audioUrl, "/diagnostic/audio/listening.mp3");
});
