# Ajaia Docs

Lightweight collaborative documents for the Ajaia LLC AI-native full stack take-home. Users can create, rename, edit, import `.txt`/`.md` files, share with seeded accounts, and reopen work after refresh.

## Reviewer accounts

| Role | Email | Password |
| --- | --- | --- |
| Owner (Alex) | `alex@ajaia.dev` | `demo123` |
| Collaborator (Jordan) | `jordan@ajaia.dev` | `demo123` |

Sign in as Alex, then as Jordan, to see **Owned by you** vs **Shared with you**. Alex already owns a seeded starter note shared with Jordan.

## Supported file import

- `.txt` — imported as paragraphs
- `.md` — headings (`#`–`###`), bullets, numbered lists, bold, italic, inline code
- Max size: 1 MB
- `.docx` and other types are **not** supported

## Local setup

Requirements: Node 20+ and npm. Docker is optional.

```bash
cp .env.example .env
npm install
npm run db:start
```

Keep that process running, then in another terminal:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run db:start` runs a local Postgres 18 binary in `data/postgres` (no Docker, no sudo). If you already have Docker, `docker compose up -d` still works instead.

Useful scripts:

```bash
npm test          # access-control and import conversion tests
npm run lint
npm run build     # production build
```

If Docker is not available, install Postgres another way and point `DATABASE_URL` at it, then run migrate and seed:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Deploy (free path)

1. Create a free [Neon](https://neon.tech) Postgres database.
2. Push this repo to GitHub.
3. Import the project on [Vercel](https://vercel.com).
4. Set environment variables:
   - `DATABASE_URL` — Neon connection string (require SSL)
   - `SESSION_SECRET` — long random string
5. In the Vercel build command use `prisma migrate deploy && prisma db seed && next build`, or run migrate/seed once from your machine against the Neon URL:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

Reviewers should not need a paid service.

## What works

- Cookie login with seeded users
- Create / rename / delete (owner) / edit rich text / autosave
- Import `.txt` and `.md` into a new document
- Share by email, revoke access, owned vs shared lists
- Persistence in PostgreSQL (TipTap HTML)

## Intentionally out of scope

- Real-time multiplayer cursors
- Comments, suggestions, version history
- Google-account SSO
- `.docx` import / PDF export
- Role finer than owner vs collaborator (collaborators can edit, owners manage sharing)

With another 2–4 hours I would add presence indicators and Markdown export.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md). AI usage is in [AI_WORKFLOW.md](./AI_WORKFLOW.md). Submission checklist is in [SUBMISSION.md](./SUBMISSION.md).
