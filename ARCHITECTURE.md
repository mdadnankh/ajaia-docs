# Architecture

## Product slice

The assignment is open-ended. The coherent slice is a **single-user-at-a-time docs workspace**: create, edit, import, share, persist. Depth went into access rules and a usable TipTap editor rather than Google Docs parity.

## Stack

- **Next.js 16 App Router** — Server Components for lists and authorization, Server Actions for mutations, one Client Component for the editor.
- **PostgreSQL + Prisma 7** — documents, users, shares. Prisma uses the `pg` driver adapter (`@prisma/adapter-pg`).
- **TipTap** — HTML rich text stored as a string so formatting survives refresh without a custom document model.
- **Signed httpOnly cookie** — HMAC session, not a full auth product. Enough to switch reviewer identities.

## Data model

- `User` owns many `Document`s.
- `Share` is a unique `(documentId, userId)` grant. Presence of a row means **edit** access.
- Document `content` is sanitized HTML. `importedFrom` records the original filename when a file created the doc.

Authorization is resolved in `lib/access.ts` and enforced again in every Server Action (`lib/dal.ts`). Proxy only redirects when the session cookie is missing; it is not the security boundary.

## Request flow

1. `proxy.ts` sends anonymous traffic to `/login`.
2. Login verifies scrypt password hashes and sets `ajaia_session`.
3. Home loads owned vs shared lists through Prisma.
4. `/docs/[id]` loads the document only if the user is owner or a share row exists; otherwise `notFound()`.
5. TipTap autosaves HTML through `saveDocument`. Share/rename/delete check role before writing.

## Priorities

1. Editing that feels like a real draft (toolbar, headings, lists, autosave).
2. Sharing that is visible and testable with two accounts.
3. File import that is product-relevant (turn a notes file into a document) with explicit type limits.
4. Persistence that reviewers can run locally with Docker.

Deprioritized: live collaboration, comments, version history, DOCX, billed cloud extras.
