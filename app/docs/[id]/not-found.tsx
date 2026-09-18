import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#f8fafc] px-4">
      <h1 className="text-xl font-semibold text-zinc-900">Document not found</h1>
      <p className="text-sm text-zinc-600">It may have been deleted, or you do not have access.</p>
      <Link href="/" className="text-sm font-medium text-sky-700 hover:underline">
        Back to documents
      </Link>
    </div>
  );
}
