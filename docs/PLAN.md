# Engineering plan and state

## Current state

- Repository cloned into C:/Users/ThinkPad/Documents/work/handWritten.
- Remote repository was empty.
- Context documentation created.
- A + gallery B selected. Vercel + Supabase selected.
- Interactive Next.js frontend implemented with handwriting composer, CRUD, favorites, gallery and editable profiles.
- Preview served at localhost:3000, bound to LAN for phone access.
- Supabase client integration, schema with RLS, private bucket and seed script implemented.
- Vercel and Supabase projects are configured. Live login, data access, and private storage checks pass.
- Production build and TypeScript passed.
- Browser QA at 375px and 1440px: visually inspected letters, composer, gallery and profile. Mobile had no horizontal overflow. Create, reload persistence, edit, favorite, account favorite isolation, and delete exercised with disposable local preview data.
- Fixed preview UUID generation for HTTP LAN phone access. Native randomUUID requires a secure context, while getRandomValues works on LAN HTTP.
- Each section starts at the top. The Next.js development button no longer covers phone navigation.
- Rewrote site text, sample letters, captions, labels, forms, errors, and metadata in simple English.
- Used the ASD-STE100 skill for clear sentences and consistent actions. Kept the product name `selembar`.
- The preview translates exact original sample text. It preserves user edits and new content.

## Timebox

Target: under 45 minutes total active work. Design decision and external account setup may affect elapsed time. Do not claim the target was met without measuring. Prefer a complete small implementation over unnecessary infrastructure or a heavy 3D engine.

## Mini engineering loops after design choice

1. Scaffold and visible frontend: shell, letters list, paper composer, mobile navigation, gallery. Run locally and show a recognizable preview immediately.
2. Backend: schema/policies, two seeded users, session handling, note CRUD, favorites, profile and gallery persistence.
3. Integration: replace fixtures with real data, add loading/errors/empty states, check authorization and persistence.
4. Visual QA: inspect mobile and desktop, fix concrete layout problems, check primary controls.
5. Delivery: production build, deployment if accounts/configuration are available, concise setup instructions and known limitations.

## Loop break conditions

Stop the frontend loop when the design is clear on phones and computers. All sections must be reachable. Fix any layout defect that blocks use. A visible frontend does not by itself complete the backend scope.

The task is complete when the requested features work with real storage and login. Report any missing setup clearly.

## Meaningful checks

- Production build/typecheck.
- Login/logout for both users. Anonymous data access denied.
- Create/read/update/delete a note and reload to check persistence.
- Favorite/unfavorite isolation between accounts.
- Cross-author mutation denied.
- Profile update and gallery upload/delete with ownership enforcement.
- Browser inspection at mobile and desktop widths.

## Next action

Push the setup commit and check the first Vercel production build. Custom avatar upload, automatic photo compression and an email password-recovery flow are not implemented.
