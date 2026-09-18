"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageSharing, isValidEmail } from "@/lib/access";
import { assertDocumentRole, requireCurrentUser } from "@/lib/dal";

export type ShareState = { error?: string; ok?: boolean };

export async function shareDocument(
  _prev: ShareState,
  formData: FormData,
): Promise<ShareState> {
  const user = await requireCurrentUser();
  const documentId = String(formData.get("documentId") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  const role = await assertDocumentRole(documentId, user.id);
  if (!canManageSharing(role)) {
    return { error: "Only the owner can share this document." };
  }

  const recipient = await prisma.user.findUnique({ where: { email } });
  if (!recipient) {
    return { error: "No seeded user exists with that email. Try jordan@ajaia.dev." };
  }

  if (recipient.id === user.id) {
    return { error: "You already own this document." };
  }

  try {
    await prisma.share.create({
      data: { documentId, userId: recipient.id },
    });
  } catch {
    return { error: "That person already has access." };
  }

  revalidatePath(`/docs/${documentId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function revokeShare(formData: FormData) {
  const user = await requireCurrentUser();
  const documentId = String(formData.get("documentId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const role = await assertDocumentRole(documentId, user.id);
  if (!canManageSharing(role)) {
    throw new Error("Only the owner can change sharing.");
  }

  await prisma.share.delete({
    where: { documentId_userId: { documentId, userId } },
  });

  revalidatePath(`/docs/${documentId}`);
  revalidatePath("/");
}
