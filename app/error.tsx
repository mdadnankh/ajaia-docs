"use client";

import Link from "next/link";

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#f8fafc] px-4">
      <h1 className="text-xl font-semibold text-zinc-900">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-zinc-600">{error.message}</p>
      <Link href="/" className="text-sm font-medium text-sky-700 hover:underline">
        Back to documents
      </Link>
    </div>
  );
}
