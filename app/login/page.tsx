import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-sky-700">Ajaia Docs</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Sign in to review</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Lightweight cookie auth with two seeded accounts. Use these to demonstrate owned vs shared documents.
        </p>
        <dl className="mt-5 space-y-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
          <div>
            <dt className="font-medium">Alex (owner)</dt>
            <dd>alex@ajaia.dev / demo123</dd>
          </div>
          <div>
            <dt className="font-medium">Jordan (collaborator)</dt>
            <dd>jordan@ajaia.dev / demo123</dd>
          </div>
        </dl>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
