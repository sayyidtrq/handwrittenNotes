# Deployment and CI

## How changes reach the site

1. Create a branch from main.
2. Open a pull request.
3. GitHub Actions checks types, builds the app, and tests the deployment guard.
4. After the Vercel connection, Vercel creates a preview for the branch.
5. Merge the pull request after checks pass.
6. Vercel builds main and updates production after a successful build.

Vercel uses its native GitHub integration. No Vercel token belongs in GitHub Actions.
The Vercel build also checks types and requires Supabase settings.
GitHub CI and Vercel builds run separately. Require the CI check on main to enforce merge order.

## First setup

1. Create a Supabase Free project.
2. Complete the database and account steps in [SETUP.md](SETUP.md).
3. Import `sayyidtrq/handwrittenNotes` into your Vercel Hobby account.
4. Select Next.js and Node.js 24.x. Use main as the production branch.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
6. Select Production and Preview for these settings.
7. Deploy the project.
8. Check both logins and private data access on the deployed site.

The public key can be a Supabase publishable key or legacy anon key.
Never place the service-role key or seed passwords in Vercel or GitHub.
Vercel reads the install and build commands from `vercel.json`.
The deployment stops when public backend settings are missing or contain a secret key.
This check does not prove that the project exists or that its database rules are correct.

For stronger separation, use a second Supabase Free project for previews.
If both environments use one project, preview changes can affect production data after login.
Do not add private data until the database access checks pass.

## CI details

- Use Node.js 24 and the committed package lock.
- Run CI on main pushes, pull requests, and manual requests.
- Give CI read-only repository access.
- Pin third-party actions to commit hashes.
- Use no backend secrets in pull request builds.
- Let Dependabot propose weekly dependency and action updates.

## Recovery

Use Vercel to promote the previous working deployment if a release fails.
Alternatively, revert the bad commit through a pull request.
Database changes are manual. Do not run destructive migrations from a pull request build.

## Current state

The Vercel project `handwritten-notes` connects to this GitHub repo.
It uses Next.js, Node.js 24, and the build commands in `vercel.json`.
The Supabase project `xmbsuawewaaiemqiozxw` runs in Singapore under the confirmed Free organization.
Public signup is disabled. Both accounts exist.
Production and preview builds use the same Supabase project.
Only the public URL and anon key are stored in Vercel.

The live backend checks passed on 2026-11-07.
They covered login, blocked anonymous reads, note ownership, separate favorites, profile ownership, and private photo storage.
Run `npm run test:backend` to repeat these checks. The script removes its test data.
Keep the database password, seed passwords, and service-role key in the ignored `.env.local` file.
Never include their values in commits or CI logs.

The first production build is pending the setup commit push.
