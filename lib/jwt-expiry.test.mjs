/**
 * Node test runner for jwt-expiry (keep in sync with jwt-expiry.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function accessTokenExpired(token, skewSeconds = 30) {
  try {
    const part = token.split(".")[1];
    if (!part) return true;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    if (typeof json.exp !== "number") return true;
    return Date.now() / 1000 >= json.exp - skewSeconds;
  } catch {
    return true;
  }
}

function makeJwt(expUnix) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ exp: expUnix })).toString("base64url");
  return `${header}.${payload}.sig`;
}

test("accessTokenExpired is false before exp minus skew", () => {
  const exp = Math.floor(Date.now() / 1000) + 120;
  assert.equal(accessTokenExpired(makeJwt(exp)), false);
});

test("accessTokenExpired is true after exp", () => {
  const exp = Math.floor(Date.now() / 1000) - 60;
  assert.equal(accessTokenExpired(makeJwt(exp)), true);
});

test("accessTokenExpired respects skew window", () => {
  const exp = Math.floor(Date.now() / 1000) + 20;
  assert.equal(accessTokenExpired(makeJwt(exp), 30), true);
  assert.equal(accessTokenExpired(makeJwt(exp), 10), false);
});

test("proactive exam margin treats near-expiry as stale", () => {
  const marginSec = 6 * 60;
  const exp = Math.floor(Date.now() / 1000) + 5 * 60;
  assert.equal(accessTokenExpired(makeJwt(exp), marginSec), true);
  const expFar = Math.floor(Date.now() / 1000) + 10 * 60;
  assert.equal(accessTokenExpired(makeJwt(expFar), marginSec), false);
});
