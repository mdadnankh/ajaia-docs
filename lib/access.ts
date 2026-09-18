export type AccessRole = "owner" | "collaborator";

export function resolveAccess(
  userId: string,
  ownerId: string,
  sharedWithUserIds: string[],
): AccessRole | null {
  if (userId === ownerId) return "owner";
  if (sharedWithUserIds.includes(userId)) return "collaborator";
  return null;
}

export function canEdit(role: AccessRole | null): boolean {
  return role === "owner" || role === "collaborator";
}

export function canManageSharing(role: AccessRole | null): boolean {
  return role === "owner";
}

export function canRename(role: AccessRole | null): boolean {
  return role === "owner";
}

export function canDelete(role: AccessRole | null): boolean {
  return role === "owner";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}
