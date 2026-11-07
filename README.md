# Handwritten Notes

A private website for two people: `bf` and `gf`. Write letters, mark favorites, and keep photos together. The design works on phones and computers. Letters use a handwriting font on paper.

Repository: https://github.com/sayyidtrq/handwrittenNotes.git

Live site: https://handwritten-notes-mu.vercel.app

## Context

- [Product brief](docs/PROJECT.md)
- [Design directions](docs/DESIGN.md)
- [Architecture and deployment proposal](docs/ARCHITECTURE.md)
- [Engineering loops and current state](docs/PLAN.md)
- [Deployment and CI](docs/DEPLOYMENT.md)

The frontend works in a local preview. It uses design A with the gallery from design B. All site text uses simple English.

Vercel connects to this repo. Supabase is configured with two accounts and private storage. The live backend checks pass. See [Deployment and CI](docs/DEPLOYMENT.md) for release status and commands.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Without Supabase configuration, this is a labeled browser-local preview. See [setup and deployment](docs/SETUP.md) for Supabase + Vercel.
