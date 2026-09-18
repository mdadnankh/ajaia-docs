"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue="alex@ajaia.dev"
          className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base font-normal text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          defaultValue="demo123"
          className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base font-normal text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </label>
      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
