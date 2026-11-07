import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (
  !url ||
  !key ||
  !process.env.SEED_BF_PASSWORD ||
  !process.env.SEED_GF_PASSWORD
) {
  throw new Error("Set the backend settings and seed passwords in .env.local.");
}
const client = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const anonymous = client();
const bf = client();
const gf = client();
const noteId = randomUUID();
let photoPath;
let originalProfile;
let bfId;
try {
  for (const [name, db] of [
    ["bf", bf],
    ["gf", gf],
  ]) {
    const { data, error } = await db.auth.signInWithPassword({
      email: `${name}@selembar.local`,
      password: process.env[`SEED_${name.toUpperCase()}_PASSWORD`],
    });
    assert.ifError(error);
    assert.ok(data.user);
    if (name === "bf") bfId = data.user.id;
  }
  console.log("PASS: both accounts can log in.");
  const settings = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
  }).then((r) => r.json());
  assert.equal(settings.disable_signup, true);
  for (const table of ["notes", "profiles", "photos", "members", "favorites"]) {
    const r = await anonymous.from(table).select("*");
    assert.ok(
      r.error || r.data.length === 0,
      `${table} exposes data to anonymous users`,
    );
  }
  console.log(
    "PASS: public signup is disabled and anonymous reads are blocked.",
  );
  const members = await bf.from("members").select("*");
  assert.ifError(members.error);
  assert.equal(members.data.length, 2);
  let r = await bf.from("notes").insert({
    id: noteId,
    author_id: bfId,
    title: "Deployment check",
    body: "Temporary test content.",
    paper: "cream",
  });
  assert.ifError(r.error);
  r = await gf.from("notes").select("id").eq("id", noteId).single();
  assert.ifError(r.error);
  r = await gf
    .from("notes")
    .update({ title: "Not permitted" })
    .eq("id", noteId)
    .select();
  assert.ok(r.error || r.data.length === 0);
  r = await gf.from("notes").delete().eq("id", noteId).select();
  assert.ok(r.error || r.data.length === 0);
  r = await bf
    .from("notes")
    .update({ title: "Edited deployment check" })
    .eq("id", noteId)
    .select()
    .single();
  assert.ifError(r.error);
  assert.equal(r.data.title, "Edited deployment check");
  console.log(
    "PASS: shared reads work and only authors can edit or delete notes.",
  );
  r = await bf.from("favorites").insert({ member_id: bfId, note_id: noteId });
  assert.ifError(r.error);
  r = await gf.from("favorites").select("*").eq("note_id", noteId);
  assert.ifError(r.error);
  assert.equal(r.data.length, 0);
  r = await bf.from("profiles").select("*").eq("id", bfId).single();
  assert.ifError(r.error);
  originalProfile = r.data;
  r = await bf
    .from("profiles")
    .update({ bio: "Temporary deployment check." })
    .eq("id", bfId)
    .select()
    .single();
  assert.ifError(r.error);
  r = await gf
    .from("profiles")
    .update({ bio: "Not permitted" })
    .eq("id", bfId)
    .select();
  assert.ok(r.error || r.data.length === 0);
  console.log(
    "PASS: favorites are separate and profile ownership is enforced.",
  );
  photoPath = `${bfId}/${randomUUID()}.png`;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=",
    "base64",
  );
  r = await bf.storage
    .from("memories")
    .upload(photoPath, png, { contentType: "image/png" });
  assert.ifError(r.error);
  r = await gf.storage.from("memories").createSignedUrl(photoPath, 60);
  assert.ifError(r.error);
  assert.ok((await fetch(r.data.signedUrl)).ok);
  const publicResponse = await fetch(
    `${url}/storage/v1/object/public/memories/${photoPath}`,
  );
  assert.ok(!publicResponse.ok);
  const illegalPath = `${bfId}/${randomUUID()}.png`;
  r = await gf.storage
    .from("memories")
    .upload(illegalPath, png, { contentType: "image/png" });
  assert.ok(r.error, "Other account can upload into bf folder");
  console.log(
    "PASS: private photo upload/read works and public access is blocked.",
  );
} finally {
  if (originalProfile) {
    const r = await bf
      .from("profiles")
      .update({ bio: originalProfile.bio })
      .eq("id", bfId);
    assert.ifError(r.error);
  }
  if (photoPath) {
    const r = await bf.storage.from("memories").remove([photoPath]);
    assert.ifError(r.error);
  }
  const r = await bf.from("notes").delete().eq("id", noteId);
  assert.ifError(r.error);
  await Promise.all([bf.auth.signOut(), gf.auth.signOut()]);
}
console.log("PASS: temporary test data removed.");
