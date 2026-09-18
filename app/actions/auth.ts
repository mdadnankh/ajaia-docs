"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { isValidEmail } from "@/lib/access";
import { verifyPassword } from "@/lib/password";

export type AuthState = { error?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email) || password.length < 6) {
    return { error: "Enter a valid email and password (at least 6 characters)." };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return {
      error:
        "Cannot reach Postgres. Start the database, run `npx prisma migrate deploy` and `npm run db:seed`, then try again.",
    };
  }
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Those credentials do not match a seeded reviewer account." };
  }

  await setSessionCookie(user.id);
  redirect("/");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
