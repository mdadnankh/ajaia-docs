"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canDelete, canEdit, canRename } from "@/lib/access";
import { assertDocumentRole, requireCurrentUser } from "@/lib/dal";
import {
  importFileToHtml,
  isAllowedImportName,
  MAX_IMPORT_BYTES,
  sanitizeDocumentHtml,
} from "@/lib/import-file";

const EMPTY_DOC = "<p></p>";

export type DocumentActionState = { error?: string; ok?: boolean };

export async function createDocument() {
  const user = await requireCurrentUser();
  const document = await prisma.document.create({
    data: {
      title: "Untitled document",
      content: EMPTY_DOC,
      ownerId: user.id,
    },
  });
  redirect(`/docs/${document.id}`);
}

export async function importDocument(
  _prev: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const user = await requireCurrentUser();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .txt or .md file to import." };
  }

  if (file.size > MAX_IMPORT_BYTES) {
    return { error: "File is too large. Maximum size is 1 MB." };
  }

  if (!isAllowedImportName(file.name)) {
    return { error: "Only .txt and .md files are supported." };
  }

  const text = await file.text();
  const imported = importFileToHtml(file.name, text);

  const document = await prisma.document.create({
    data: {
      title: imported.title,
      content: sanitizeDocumentHtml(imported.html),
      importedFrom: file.name,
      ownerId: user.id,
    },
  });

  redirect(`/docs/${document.id}`);
}

export async function saveDocument(
  documentId: string,
  html: string,
): Promise<DocumentActionState> {
  const user = await requireCurrentUser();
  const role = await assertDocumentRole(documentId, user.id);
  if (!canEdit(role)) {
    return { error: "You do not have permission to edit this document." };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { content: sanitizeDocumentHtml(html) },
  });

  revalidatePath(`/docs/${documentId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function renameDocument(
  _prev: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const user = await requireCurrentUser();
  const documentId = String(formData.get("documentId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!documentId) return { error: "Missing document." };
  if (title.length < 1 || title.length > 120) {
    return { error: "Title must be between 1 and 120 characters." };
  }

  const role = await assertDocumentRole(documentId, user.id);
  if (!canRename(role)) {
    return { error: "Only the owner can rename this document." };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { title },
  });

  revalidatePath(`/docs/${documentId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteDocument(formData: FormData) {
  const user = await requireCurrentUser();
  const documentId = String(formData.get("documentId") ?? "");
  const role = await assertDocumentRole(documentId, user.id);
  if (!canDelete(role)) {
    throw new Error("Only the owner can delete this document.");
  }
  await prisma.document.delete({ where: { id: documentId } });
  revalidatePath("/");
  redirect("/");
}
