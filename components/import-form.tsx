"use client";

import { useActionState, useRef } from "react";
import { importDocument, type DocumentActionState } from "@/app/actions/documents";

const initial: DocumentActionState = {};

export function ImportForm() {
  const [state, action, pending] = useActionState(importDocument, initial);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={(event) => {
          if (event.currentTarget.files?.length) {
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending ? "Importing…" : "Import .txt / .md"}
      </button>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
