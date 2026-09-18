import { describe, expect, it } from "vitest";
import {
  canDelete,
  canEdit,
  canManageSharing,
  canRename,
  isValidEmail,
  resolveAccess,
} from "../lib/access";

describe("document access", () => {
  it("treats the owner as owner even if they are also listed as shared", () => {
    const role = resolveAccess("u1", "u1", ["u1", "u2"]);
    expect(role).toBe("owner");
    expect(canEdit(role)).toBe(true);
    expect(canRename(role)).toBe(true);
    expect(canManageSharing(role)).toBe(true);
    expect(canDelete(role)).toBe(true);
  });

  it("gives collaborators edit access without ownership controls", () => {
    const role = resolveAccess("u2", "u1", ["u2"]);
    expect(role).toBe("collaborator");
    expect(canEdit(role)).toBe(true);
    expect(canRename(role)).toBe(false);
    expect(canManageSharing(role)).toBe(false);
    expect(canDelete(role)).toBe(false);
  });

  it("denies users with no relationship to the document", () => {
    const role = resolveAccess("u3", "u1", ["u2"]);
    expect(role).toBeNull();
    expect(canEdit(role)).toBe(false);
  });
});

describe("email validation", () => {
  it("accepts a seeded reviewer email", () => {
    expect(isValidEmail("jordan@ajaia.dev")).toBe(true);
  });

  it("rejects empty or malformed values", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
  });
});
