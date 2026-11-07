import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const fail = (message) => {
  console.error(message);
  process.exit(1);
};
if (!url || !key)
  fail(
    "Deployment stopped: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
let parsed;
try {
  parsed = new URL(url);
} catch {
  fail("Deployment stopped: the Supabase URL is invalid.");
}
if (parsed.protocol !== "https:" || parsed.username || parsed.password)
  fail("Deployment stopped: use an HTTPS Supabase URL without credentials.");
if (key.startsWith("sb_secret_"))
  fail(
    "Deployment stopped: never use a secret key in a public environment variable.",
  );
if (!key.startsWith("sb_publishable_")) {
  let payload;
  try {
    payload = JSON.parse(
      Buffer.from(key.split(".")[1], "base64url").toString(),
    );
  } catch {
    fail(
      "Deployment stopped: use a Supabase publishable key or legacy anon key.",
    );
  }
  if (payload.role !== "anon")
    fail(
      "Deployment stopped: the public Supabase key must have the anon role.",
    );
}
console.log("Deployment environment checks passed.");
