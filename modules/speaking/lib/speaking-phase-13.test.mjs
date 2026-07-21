import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const actions = await import(
  pathToFileURL(path.join(here, "speaking-report-actions.ts"))
);
const preferences = await import(
  pathToFileURL(path.join(here, "speaking-notification-preferences.ts"))
);

const reportUrl =
  "https://bandforge.example/test/4/speaking/results?attempt=attempt-1";
assert.deepEqual(actions.speakingSharePayload(reportUrl), {
  title: "BandForge Speaking feedback",
  text: "Private BandForge Speaking report. Only the same BandForge account can open this link.",
  url: reportUrl,
});

let sharedPayload;
assert.equal(
  await actions.shareSpeakingReport(reportUrl, {
    share: async (payload) => {
      sharedPayload = payload;
    },
    writeText: async () => assert.fail("clipboard should not be used"),
  }),
  "shared",
);
assert.equal(sharedPayload.url, reportUrl);

let copiedUrl;
assert.equal(
  await actions.shareSpeakingReport(reportUrl, {
    writeText: async (url) => {
      copiedUrl = url;
    },
  }),
  "copied",
);
assert.equal(copiedUrl, reportUrl);

const cancelled = new Error("cancelled");
cancelled.name = "AbortError";
assert.equal(
  await actions.shareSpeakingReport(reportUrl, {
    share: async () => {
      throw cancelled;
    },
  }),
  "cancelled",
);

const denied = new Error("denied");
await assert.rejects(
  actions.shareSpeakingReport(reportUrl, {
    share: async () => {
      throw denied;
    },
  }),
  denied,
);
await assert.rejects(
  actions.shareSpeakingReport(reportUrl, {}),
  /not supported/,
);

let printCalls = 0;
actions.printSpeakingReport(() => {
  printCalls += 1;
});
assert.equal(printCalls, 1);
assert.equal(actions.SPEAKING_COACHING_PATH, "/pricing");

assert.deepEqual(preferences.speakingWhatsAppPreferencePatch(true), {
  whatsapp_enabled: true,
  consent_confirmation: "speaking_release_whatsapp_v1",
});
assert.deepEqual(preferences.speakingWhatsAppPreferencePatch(false), {
  whatsapp_enabled: false,
});
assert.equal(
  preferences.canEnableSpeakingWhatsApp({ whatsapp_eligible: true }),
  true,
);
assert.equal(
  preferences.canEnableSpeakingWhatsApp({ whatsapp_eligible: false }),
  false,
);

console.log("OK Phase 13 share, print, coaching, and WhatsApp helpers");
