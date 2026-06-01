import assert from "node:assert";

/** Keep in sync with lib/bootstrap-next-path.ts */
function bootstrapNextPath(pathname, search) {
  return search ? `${pathname}${search}` : pathname;
}

assert.strictEqual(
  bootstrapNextPath("/mock/m01/reading", "?mock_attempt=abc&section_start=1"),
  "/mock/m01/reading?mock_attempt=abc&section_start=1",
);
assert.strictEqual(bootstrapNextPath("/mock/m01/listening", ""), "/mock/m01/listening");

console.log("bootstrap-next-path: ok");
