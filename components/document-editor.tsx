"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { saveDocument } from "@/app/actions/documents";

type Status = "idle" | "saving" | "saved" | "error";

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-sm ${
        active ? "bg-sky-100 font-semibold text-sky-800" : "text-zinc-700 hover:bg-zinc-100"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function DocumentEditor({
  documentId,
  initialHtml,
  editable,
}: {
  documentId: string;
  initialHtml: string;
  editable: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class:
          "prose-docs min-h-[520px] px-8 py-10 text-[16px] leading-7 text-zinc-900 focus:outline-none",
      },
    },
  });

  const persist = useCallback(async () => {
    if (!editor || !editable) return;
    setStatus("saving");
    setError(null);
    const result = await saveDocument(documentId, editor.getHTML());
    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("saved");
  }, [documentId, editable, editor]);

  useEffect(() => {
    if (!editor || !editable) return;
    let timer: ReturnType<typeof setTimeout>;
    const onUpdate = () => {
      setStatus("idle");
      clearTimeout(timer);
      timer = setTimeout(() => {
        void persist();
      }, 900);
    };
    editor.on("update", onUpdate);
    return () => {
      clearTimeout(timer);
      editor.off("update", onUpdate);
    };
  }, [editor, editable, persist]);

  if (!editor) {
    return <div className="min-h-[520px] rounded-xl bg-white shadow-sm" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </ToolbarButton>
        <ToolbarButton
          disabled={!editable}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbers
        </ToolbarButton>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            {status === "saving"
              ? "Saving…"
              : status === "saved"
                ? "Saved"
                : status === "error"
                  ? "Save failed"
                  : editable
                    ? "Autosaves as you type"
                    : "View only"}
          </span>
          {editable ? (
            <button
              type="button"
              onClick={() => void persist()}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
            >
              Save now
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
