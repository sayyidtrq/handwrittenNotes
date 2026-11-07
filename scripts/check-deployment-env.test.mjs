import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(
  new URL("./check-deployment-env.mjs", import.meta.url),
);
function check(values) {
  const dir = mkdtempSync(join(tmpdir(), "selembar-env-"));
  try {
    const env = { ...process.env };
    delete env.NEXT_PUBLIC_SUPABASE_URL;
    delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Isolate the test from private .env files in the checkout.
    return spawnSync(process.execPath, [script], {
      cwd: dir,
      env: { ...env, ...values },
      encoding: "utf8",
    });
  } finally {
    rmdirSync(dir);
  }
}
const url = { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" };
test("missing configuration cannot deploy local demo mode", () => {
  const result = check({});
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Deployment stopped: set NEXT_PUBLIC_SUPABASE_URL/,
  );
});
test("public variable rejects a Supabase secret key", () => {
  const result = check({
    ...url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_test-only",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /never use a secret key/);
  assert.ok(!result.stderr.includes("sb_secret_test-only"));
});
test("public variable rejects a legacy service-role key", () => {
  const key = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
  assert.equal(check({ ...url, NEXT_PUBLIC_SUPABASE_ANON_KEY: key }).status, 1);
});
test("public configuration accepts a publishable key", () => {
  assert.equal(
    check({ ...url, NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_test-only" })
      .status,
    0,
  );
});
test("public configuration accepts a legacy anon key", () => {
  const key = `header.${Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url")}.signature`;
  assert.equal(check({ ...url, NEXT_PUBLIC_SUPABASE_ANON_KEY: key }).status, 0);
});
test("public configuration requires HTTPS", () => {
  assert.equal(
    check({
      NEXT_PUBLIC_SUPABASE_URL: "http://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_test-only",
    }).status,
    1,
  );
});
