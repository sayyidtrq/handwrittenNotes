# Run and deploy

## Frontend preview

Requires Node.js 20.9+ (tested with 24).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The dev server binds to all interfaces for same-Wi-Fi phone testing. Use the computer's LAN IPv4 address with port 3000. Windows Firewall and Wi-Fi client isolation may prevent phone access. Do not disable the firewall.

Without Supabase environment variables the app shows a clearly labeled local preview. Example notes and Unsplash photos are not private user data. Browser-local persistence is for trying the UI only. Both preview accounts share the same browser and are not real authentication.

## Supabase Free

1. Create a Supabase Free project.
2. Run `supabase/schema.sql` once in its SQL Editor.
3. Disable public signup in Authentication settings. Exactly two app membership slots are independently enforced by database constraints.
4. Copy `.env.example` to `.env.local`. Set project URL, anon key, service-role key, and two strong distinct seed passwords. Keep secrets out of chat and Git.
5. Run `npm run seed`. It creates `bf` and `gf` using internal Auth email aliases. These aliases are not inboxes. The owner must reset a lost password through Supabase. The script preserves existing passwords.
6. Restart the dev server. Login with bf/gf and their configured passwords. The app stops preview mode when you set the URL and anon key.

The app uses the Supabase browser SDK against Auth, PostgREST, and private Storage. Row-level policies enforce access independently of the UI. The app does not use the service-role key. Password changes are available on the profile page. Profile scope is name, bio, and password. Custom avatar uploads are not implemented.

## Vercel Hobby

1. Push the repository to GitHub.
2. Import it in Vercel. Choose Next.js. Use the build command from `vercel.json`: `npm run build:deploy`.
3. Set only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project. Do not upload seed passwords or the service-role key.
4. Deploy and use the generated HTTPS URL on phone or desktop. See [Deployment and CI](DEPLOYMENT.md) for branch previews and build checks.
5. Check both accounts, refresh persistence, and access policies before using personal content.

Free plan quotas apply. Supabase may pause inactive projects. No paid services or domain required.

## Verification checklist for connected deployment

- Anonymous reads of notes/profiles/photos return no protected records.
- Both seeded users can log in/out.
- Other Auth users cannot read/write app data even if mistakenly created.
- bf cannot edit/delete gf notes, and vice versa.
- Favorites are account-specific.
- Notes/profile/photo changes survive reload on a second device.
- Photo bucket is private. Unsigned object URLs fail.
- Test uploads are JPEG/PNG/WebP and no larger than 5 MB.
- Photo signed URLs expire after an hour. Reload renews them.
- No password reset email flow: owner can recover accounts through Supabase Auth.
