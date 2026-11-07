# Architecture proposal

The user selected Vercel and Supabase. Both projects are configured. The repo includes the database schema, access rules, and seed script. Live backend checks pass. Vercel uses the native GitHub integration for deployments.

## Recommended deployment

Use Next.js and TypeScript on Vercel Hobby. Use Supabase Free for the database, login, and private photos. Keep the code in one repo. Use the free Vercel address.

Vercel Hobby supports personal, noncommercial use. Supabase Free has usage caps and may pause projects with low activity over a seven-day period. These are free-tier tradeoffs, not a promise of unlimited or permanent free service.

Sources checked 2026-11-07:

- https://vercel.com/docs/plans/hobby
- https://vercel.com/pricing
- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/free-project-pausing

Do not store production data in temporary server files. Use Supabase for letters and photos.

## Identity

Expose usernames `bf` and `gf`. Map to internal email aliases `bf@selembar.local` and `gf@selembar.local` for Supabase Auth. Disable signup. Restrict application membership to those two identities, independently of Auth signup settings. Passwords supplied through environment/provisioning, never committed or defaulted to public example passwords. The browser SDK manages tokens and refresh. Postgres row-level policies independently enforce all data access. The app checks login before it loads content. The server does not render private data.

## Data model

- members: two allowed Auth IDs and unique username constrained to bf/gf.
- profiles: member ID, username, name, bio. Avatars show account initials. Custom avatar uploads are not ready.
- notes: ID, author ID, title, body, paper color, creation time.
- favorites: member ID + note ID unique pair.
- photos: ID, uploader ID, private storage path, caption, created timestamp.

Both members can read shared letters and photos. Only the author can edit or delete a letter. Each member has separate favorites. Only the person who adds a photo can delete it. Private photos use signed links that expire. The app checks photo type and size. Automatic photo compression is not ready.

## Setup dependencies

Local UI can be previewed before cloud provisioning. Real persistent login/upload testing requires a Supabase project, seeded users, migrations and environment variables. Vercel publication requires an accessible account and repository import/deployment. Never describe a fixture-driven preview as the completed backend.

## Open choices

- Supabase project and Vercel account availability.
- Actual seed passwords, set outside chat and Git.
- Both accounts can write letters. The user can request a different rule.
