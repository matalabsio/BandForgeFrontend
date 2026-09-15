import assert from "node:assert/strict";
import test from "node:test";

import { playRecordingBeep } from "./play-beep.ts";

test("playRecordingBeep resolves when AudioContext stays suspended", async () => {
  class SuspendedAudioContext {
    state = "suspended";
    currentTime = 0;
    async resume() {
      /* stay suspended — Safari without gesture */
    }
    createOscillator() {
      return {
        type: "sine",
        frequency: { value: 0 },
        connect() {},
        start() {},
        stop() {},
        onended: null,
      };
    }
    createGain() {
      return {
        gain: { value: 0 },
        connect() {},
      };
    }
    async close() {}
  }

  const previous = globalThis.window;
  globalThis.window = {
    AudioContext: SuspendedAudioContext,
    webkitAudioContext: SuspendedAudioContext,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };

  try {
    const started = Date.now();
    await playRecordingBeep();
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 500, `beep hung for ${elapsed}ms`);
  } finally {
    globalThis.window = previous;
  }
});

test("playRecordingBeep resolves when AudioContext is missing", async () => {
  const previous = globalThis.window;
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };

  try {
    const started = Date.now();
    await playRecordingBeep();
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 500, `beep hung for ${elapsed}ms`);
  } finally {
    globalThis.window = previous;
  }
});
