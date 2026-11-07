import { createClient } from "@supabase/supabase-js";
const {
  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_SERVICE_ROLE_KEY: key,
  SEED_BF_PASSWORD: bf,
  SEED_GF_PASSWORD: gf,
} = process.env;
if (!url || !key || !bf || !gf)
  throw new Error(
    "Set the URL, service role key, and both seed passwords in .env.local.",
  );
if (bf.length < 8 || gf.length < 8)
  throw new Error("Each seed password must have at least 8 characters.");
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
for (const [username, password, display_name] of [
  ["bf", bf, "Me"],
  ["gf", gf, "You"],
]) {
  const existing = await client
    .from("members")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing.error) throw existing.error;
  let id = existing.data?.id;
  if (!id) {
    // Recover an Auth user if a previous seed failed after creating it.
    let found;
    let page = 1;
    do {
      const r = await client.auth.admin.listUsers({ page, perPage: 100 });
      if (r.error) throw r.error;
      found = r.data.users.find(
        (u) => u.email === `${username}@selembar.local`,
      );
      if (found || r.data.users.length < 100) break;
      page++;
    } while (page < 100);
    if (found) id = found.id;
    else {
      const r = await client.auth.admin.createUser({
        email: `${username}@selembar.local`,
        password,
        email_confirm: true,
      });
      if (r.error) throw r.error;
      id = r.data.user.id;
    }
    const r = await client.from("members").insert({ id, username });
    if (r.error) throw r.error;
  }
  const r = await client
    .from("profiles")
    .upsert(
      { id, username, display_name, bio: "" },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (r.error) throw r.error;
  console.log(
    `Provisioned ${username}. Existing passwords and profiles preserved.`,
  );
}
