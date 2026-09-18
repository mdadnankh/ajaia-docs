"use client";

import { useActionState, useEffect, useRef } from "react";
import { renameDocument, type DocumentActionState } from "@/app/actions/documents";

const initial: DocumentActionState = {};

export function TitleEditor({
  documentId,
  title,
  canRename,
}: {
  documentId: string;
  title: string;
  canRename: boolean;
}) {
  const [state, action, pending] = useActionState(renameDocument, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.querySelector("input")?.blur();
    }
  }, [state.ok]);

  if (!canRename) {
    return <h1 className="truncate text-lg font-semibold text-zinc-900">{title}</h1>;
  }

  return (
    <form ref={formRef} action={action} className="min-w-0 flex-1">
      <input type="hidden" name="documentId" value={documentId} />
      <input
        name="title"
        defaultValue={title}
        maxLength={120}
        aria-label="Document title"
        className="w-full truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold text-zinc-900 outline-none hover:border-zinc-200 focus:border-sky-400 focus:bg-white"
        onBlur={() => formRef.current?.requestSubmit()}
      />
      {pending ? <p className="px-2 text-xs text-zinc-500">Saving title…</p> : null}
      {state.error ? <p className="px-2 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
