# Project brief

Recorded: 2026-11-07, Asia/Jakarta.

## Intent

A personal website for letters to a girlfriend. The letters should feel like handwritten notes. The design should feel personal.

## User requirements

- Frontend and backend.
- Allow at most two users. Create accounts named `bf` and `gf`.
- Login and profile management.
- Notes: create, read, update, delete.
- Favorite notes.
- Gallery.
- Mobile first, usable on desktop.
- Writing should feel like typing a real handwritten note.
- Interesting sections with 3D art or similarly tactile visual treatment.
- Use free plans. The hosting budget is zero.
- Use Vercel and Supabase, as the user selected.
- Aim to finish in under 45 minutes. Report actual progress.
- Use simple English throughout the site and docs. Follow the linked ASD-STE100 skill for clarity.

## Required sequence

1. Record project context in Markdown.
2. Show design inspiration and ask the user to choose.
3. Implement in small engineering loops.
4. Finish with a clearly visible frontend and checked core behavior.

The user selected design A with the gallery from B before development started.

## Product behavior

- Both accounts can read shared notes. Only the author can edit or delete a note.
- Favorites belong to each account.
- Profile: name, short bio, avatar, password change.
- Share photos with captions. Only the person who adds a photo can delete it.
- No public registration. Provision exactly two accounts securely.
- Handwritten text is selectable/editable text, not rasterized text or handwriting recognition.
- Passwords and service secrets never enter Git or public client code.

## Acceptance criteria

- Anonymous visitors cannot read notes, profiles, or private photos.
- `bf` and `gf` can log in and log out. The app cannot create a third account.
- Profile edits, note CRUD, favorites, and photo uploads persist across reloads.
- The database enforces ownership rules for both users.
- Visible and usable at 375px mobile and 1440px desktop widths, without horizontal overflow.
- Composer has handwriting typography, paper texture, readable line spacing, visible save state, and keyboard focus.
- Loading, empty, error, and success states are present.
- Respect reduced motion settings. Art must not block the editor.
- Clearly distinguish a local demo from a connected production backend.
