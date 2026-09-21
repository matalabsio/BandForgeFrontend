/**
 * Cookie-only access auth — no bf_access_token persistence (Issue #3).
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LS_ACCESS_TOKEN = "bf_access_token";
const SESSION_HINT_COOKIE = "bf_has_session";
const __dirname = dirname(fileURLToPath(import.meta.url));

function mockLocalStorage() {
  const store = new Map();
  const ls = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };
  globalThis.localStorage = ls;
  globalThis.window = globalThis;
  return store;
}

const {
  persistAuthTokens,
  getAccessToken,
  clearAccessToken,
  clearAuthStorage,
  clearLegacyAccessToken,
  hasLikelyClientSession,
  setAccessToken,
} = await import("./session.ts");

test("persistAuthTokens does not write bf_access_token to localStorage", () => {
  const store = mockLocalStorage();
  clearAuthStorage();
  persistAuthTokens("jwt-access-abc");
  assert.equal(store.has(LS_ACCESS_TOKEN), false);
  assert.equal(getAccessToken(), "jwt-access-abc");
});

test("legacy bf_access_token is scrubbed and never trusted as auth", () => {
  const store = mockLocalStorage();
  store.set(LS_ACCESS_TOKEN, "stale-legacy-jwt");
  clearAccessToken();
  assert.equal(getAccessToken(), null);
  // Re-seed legacy without going through setAccessToken
  store.set(LS_ACCESS_TOKEN, "stale-legacy-jwt");
  assert.equal(getAccessToken(), null);
  assert.equal(store.has(LS_ACCESS_TOKEN), false);
});

test("clearAuthStorage clears legacy bf_access_token (logout)", () => {
  const store = mockLocalStorage();
  store.set(LS_ACCESS_TOKEN, "leftover");
  setAccessToken("mem");
  clearAuthStorage();
  assert.equal(getAccessToken(), null);
  assert.equal(store.has(LS_ACCESS_TOKEN), false);
});

test("hasLikelyClientSession does not depend on bf_access_token", () => {
  mockLocalStorage();
  globalThis.document = { cookie: "" };
  clearAuthStorage();
  globalThis.localStorage.setItem(LS_ACCESS_TOKEN, "should-not-count");
  assert.equal(hasLikelyClientSession(), false);
  assert.equal(globalThis.localStorage.getItem(LS_ACCESS_TOKEN), null);

  globalThis.document = { cookie: `${SESSION_HINT_COOKIE}=1` };
  assert.equal(hasLikelyClientSession(), true);
});

test("exam-api-call source does not attach Authorization from getAccessToken", () => {
  const src = readFileSync(join(__dirname, "exam-api-call.ts"), "utf8");
  assert.equal(src.includes("getAccessToken"), false);
  assert.equal(src.includes("Authorization"), false);
  assert.match(src, /credentials:\s*"include"/);
});

test("speaking-api source does not attach localStorage Bearer", () => {
  const src = readFileSync(
    join(__dirname, "../modules/speaking/services/speaking-api.ts"),
    "utf8",
  );
  assert.equal(src.includes("getAccessToken"), false);
  assert.equal(/Authorization:\s*`Bearer|Bearer \$\{/.test(src), false);
  assert.match(src, /credentials:\s*"include"/);
});

test("diagnostic-sync source does not send localStorage Bearer", () => {
  const src = readFileSync(join(__dirname, "diagnostic-sync.ts"), "utf8");
  assert.equal(src.includes("getAccessToken"), false);
  assert.equal(src.includes("Authorization"), false);
  assert.match(src, /credentials:\s*"include"/);
  assert.match(src, /getMe/);
});

test("diagnostic-session guest path does not persistAuthTokens", () => {
  const src = readFileSync(join(__dirname, "diagnostic-session.ts"), "utf8");
  assert.equal(src.includes("persistAuthTokens"), false);
  assert.match(src, /clearLegacyAccessToken/);
});

test("auth.ts clientAuthHeaders does not attach Bearer from mirror", () => {
  const src = readFileSync(join(__dirname, "auth.ts"), "utf8");
  assert.equal(/Bearer \$\{/.test(src), false);
  assert.match(src, /credentials:\s*"include"/);
});

test("clearLegacyAccessToken is idempotent", () => {
  const store = mockLocalStorage();
  store.set(LS_ACCESS_TOKEN, "x");
  clearLegacyAccessToken();
  clearLegacyAccessToken();
  assert.equal(store.has(LS_ACCESS_TOKEN), false);
});
