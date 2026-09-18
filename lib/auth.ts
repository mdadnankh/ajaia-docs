import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "ajaia_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}

function sign(userId: string): string {
  const payload = `${userId}.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  const hmac = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

function verify(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiry, hmac] = parts;
  const expected = createHmac("sha256", secret())
    .update(`${userId}.${expiry}`)
    .digest("hex");
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expiry) < Date.now()) return null;
  return userId;
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function readUserIdFromCookieValue(token: string | undefined): string | null {
  if (!token) return null;
  return verify(token);
}

export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const userId = readUserIdFromCookieValue(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
});
