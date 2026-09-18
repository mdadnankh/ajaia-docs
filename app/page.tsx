import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createDocument } from "@/app/actions/documents";
import { ImportForm } from "@/components/import-form";
import { getCurrentUser } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/dal";
import { redirect } from "next/navigation";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function DocumentList({
  title,
  empty,
  badge,
  documents,
}: {
  title: string;
  empty: string;
  badge: string;
  documents: {
    id: string;
    title: string;
    updatedAt: Date;
    importedFrom: string | null;
    owner: { name: string; email: string };
  }[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{documents.length}</span>
      </div>
      {documents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-8 text-sm text-zinc-500">
          {empty}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/docs/${doc.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow"
              >
                <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  {badge}
                </span>
                <h3 className="mt-2 truncate text-base font-semibold text-zinc-900">{doc.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {doc.owner.name} · {formatDate(doc.updatedAt)}
                </p>
                {doc.importedFrom ? (
                  <p className="mt-2 text-xs text-sky-700">Imported from {doc.importedFrom}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { owned, shared } = await listDocumentsForUser(user.id);

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">Ajaia Docs</p>
            <p className="text-sm text-zinc-500">
              Signed in as {user.name} ({user.email})
            </p>
          </div>
          <form action={logout}>
            <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form action={createDocument}>
            <button
              type="submit"
              className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700"
            >
              New document
            </button>
          </form>
          <ImportForm />
          <p className="text-xs text-zinc-500 sm:ml-2">
            Imports accept <strong>.txt</strong> and <strong>.md</strong> only, max 1 MB. Content becomes an editable document.
          </p>
        </div>
        <DocumentList
          title="Owned by you"
          badge="Owner"
          empty="You have not created a document yet."
          documents={owned}
        />
        <DocumentList
          title="Shared with you"
          badge="Shared"
          empty="Nothing has been shared with this account yet. Sign in as Jordan to see Alex's starter note."
          documents={shared}
        />
      </main>
    </div>
  );
}
