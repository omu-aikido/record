import { Role } from "share";

export function getPublicMetadataRole(metadata: unknown): string | undefined {
  if (metadata === null || typeof metadata !== "object" || !("role" in metadata)) return undefined;

  const roleValue = metadata.role;
  return typeof roleValue === "string" ? roleValue : undefined;
}

export function isAdminRole(roleValue: unknown): boolean {
  if (typeof roleValue !== "string") return false;
  const role = Role.fromString(roleValue);
  return role ? role.isManagement() : false;
}
