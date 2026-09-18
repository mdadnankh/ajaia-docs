import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { deleteDocument } from "@/app/actions/documents";
import { DocumentEditor } from "@/components/document-editor";
import { SharePanel } from "@/components/share-panel";
import { TitleEditor } from "@/components/title-editor";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser } from "@/lib/dal";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const document = await getDocumentForUser(id, user.id);
  if (!document) notFound();

  return (
    <div className="min-h-full bg-[#f1f5f9]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="text-sm font-medium text-sky-700 hover:underline">
            All docs
          </Link>
          <TitleEditor
            documentId={document.id}
            title={document.title}
            canRename={document.permissions.rename}
          />
          <span className="hidden rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 sm:inline">
            {document.role === "owner" ? "You own this" : "Shared with you"}
          </span>
          <form action={logout}>
            <button className="text-sm text-zinc-500 hover:text-zinc-800" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {document.importedFrom ? (
            <p className="mb-3 text-xs text-zinc-500">Imported from {document.importedFrom}</p>
          ) : null}
          <DocumentEditor
            documentId={document.id}
            initialHtml={document.content}
            editable={document.permissions.edit}
          />
        </div>
        <aside className="flex flex-col gap-4">
          <SharePanel
            documentId={document.id}
            owner={document.owner}
            collaborators={document.collaborators}
            canShare={document.permissions.share}
          />
          {document.permissions.delete ? (
            <form
              action={deleteDocument}
              className="rounded-xl border border-red-100 bg-white p-4"
            >
              <input type="hidden" name="documentId" value={document.id} />
              <p className="text-sm font-medium text-zinc-900">Delete document</p>
              <p className="mt-1 text-xs text-zinc-500">This cannot be undone.</p>
              <button
                type="submit"
                className="mt-3 text-sm font-medium text-red-600 hover:underline"
              >
                Delete
              </button>
            </form>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
