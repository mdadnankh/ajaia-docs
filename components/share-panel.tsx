"use client";

import { useActionState } from "react";
import { revokeShare, shareDocument, type ShareState } from "@/app/actions/share";

const initial: ShareState = {};

type Person = { id: string; name: string; email: string };

export function SharePanel({
  documentId,
  owner,
  collaborators,
  canShare,
}: {
  documentId: string;
  owner: Person;
  collaborators: Person[];
  canShare: boolean;
}) {
  const [state, action, pending] = useActionState(shareDocument, initial);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-900">Sharing</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Owner: {owner.name} ({owner.email})
      </p>
      <ul className="mt-3 space-y-2">
        {collaborators.length === 0 ? (
          <li className="text-sm text-zinc-500">Not shared with anyone yet.</li>
        ) : (
          collaborators.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {person.name}{" "}
                <span className="text-zinc-500">({person.email})</span>
              </span>
              {canShare ? (
                <form action={revokeShare}>
                  <input type="hidden" name="documentId" value={documentId} />
                  <input type="hidden" name="userId" value={person.id} />
                  <button className="text-xs font-medium text-red-600 hover:underline" type="submit">
                    Remove
                  </button>
                </form>
              ) : null}
            </li>
          ))
        )}
      </ul>
      {canShare ? (
        <form action={action} className="mt-4 flex flex-col gap-2">
          <input type="hidden" name="documentId" value={documentId} />
          <label className="text-xs font-medium text-zinc-600">
            Grant access by email
            <input
              name="email"
              type="email"
              required
              placeholder="jordan@ajaia.dev"
              className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-sky-500"
            />
          </label>
          {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
          {state.ok ? <p className="text-xs text-emerald-700">Access granted.</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-sky-600 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {pending ? "Sharing…" : "Share"}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-zinc-500">You can edit this document, but only the owner can change sharing.</p>
      )}
    </section>
  );
}
