# Portal paste (keep under 1000 lines)

Use this in the assignment **Submission (Markdown)** field. Replace the two URLs after you deploy and record.

---

## Live app

- URL: `https://YOUR-APP.vercel.app`
- Video: see `WALKTHROUGH_URL.txt` / paste Loom here

## Reviewer accounts

- Owner: `alex@ajaia.dev` / `demo123`
- Collaborator: `jordan@ajaia.dev` / `demo123`

Alex owns a seeded document already shared with Jordan. Sign in as both users to see **Owned** vs **Shared**.

## What I built

Ajaia Docs is a scoped Google Docs slice: create/rename/edit documents, import `.txt`/`.md`, share by email, persist in Postgres.

Stack: Next.js 16 App Router, PostgreSQL, Prisma 7, TipTap, cookie login.

## Working

- Rich text: bold, italic, underline, H1–H3, bullets, numbered lists, autosave
- File import: `.txt` and `.md` only, max 1 MB (stated in the UI)
- Sharing: owner grants access; collaborators can edit; they cannot rename, share, or delete
- Persistence across refresh
- Seeded users, local Docker/Postgres setup, Vitest coverage of access + import
- Architecture and AI notes in the repo

## Incomplete on purpose

No realtime collab, comments, version history, DOCX, or PDF export.

With 2–4 more hours: presence + Markdown export.

## Local run

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Full details: `README.md`, `ARCHITECTURE.md`, `AI_WORKFLOW.md`.
