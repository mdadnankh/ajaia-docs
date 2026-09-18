# AI workflow note

## Tools

- **Cursor** (Grok 4.6 agent) for scaffolding Next.js App Router code, Prisma schema, TipTap wiring, and first-pass copy.
- Next.js 16 docs under `node_modules/next/dist/docs/` and Prisma 7 docs for adapter/client setup, because this stack has changed relative to older tutorials.

## Where AI sped things up

- Boilerplate: Prisma 7 `prisma.config.ts` + adapter client, Server Action forms, TipTap toolbar.
- First draft of markdown-to-HTML conversion and access-control helpers, which were then covered with Vitest.
- README / architecture structure so the submission is reviewable without extra hours of writing.

## What I changed or rejected

- Rejected a heavier auth stack (NextAuth, OAuth). Seeded cookie login is enough for the sharing demo and stays free.
- Rejected storing TipTap JSON plus a second renderer. HTML is simpler to persist, import into, and sanitize.
- Rejected DOCX parsing and real-time CRDT libraries. They would consume the timebox without strengthening the core story.
- Tightened AI-generated Prisma usage: every mutation re-checks role in the data access layer, not only in the UI.
- Replaced a generic dark create-next-app shell with a light, document-first layout.

## How I verified

- `npm test` for access rules and import conversion.
- Manual review of login, create, edit/refresh, import, share, and the owned vs shared lists (Alex and Jordan).
- Production `next build` after migrate against local Postgres.

AI drafted quickly; the product cuts, permission model, and what to leave out were human decisions.
