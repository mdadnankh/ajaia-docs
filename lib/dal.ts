import "server-only";
import { prisma } from "@/lib/prisma";
import { canDelete, canEdit, canManageSharing, canRename, resolveAccess, type AccessRole } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";

export type CurrentUser = { id: string; email: string; name: string };

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function listDocumentsForUser(userId: string) {
  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        importedFrom: true,
        owner: { select: { name: true, email: true } },
      },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        importedFrom: true,
        owner: { select: { name: true, email: true } },
      },
    }),
  ]);

  return { owned, shared };
}

export async function getDocumentForUser(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!document) return null;

  const role = resolveAccess(
    userId,
    document.ownerId,
    document.shares.map((share) => share.userId),
  );

  if (!role) return null;

  return {
    id: document.id,
    title: document.title,
    content: document.content,
    importedFrom: document.importedFrom,
    updatedAt: document.updatedAt,
    owner: document.owner,
    collaborators: document.shares.map((share) => share.user),
    role,
    permissions: {
      edit: canEdit(role),
      rename: canRename(role),
      share: canManageSharing(role),
      delete: canDelete(role),
    },
  };
}

export async function assertDocumentRole(documentId: string, userId: string): Promise<AccessRole> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      ownerId: true,
      shares: { select: { userId: true } },
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const role = resolveAccess(
    userId,
    document.ownerId,
    document.shares.map((share) => share.userId),
  );

  if (!role) {
    throw new Error("Forbidden");
  }

  return role;
}
