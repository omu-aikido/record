import { Role } from "share";

export function isAdminRole(roleValue: unknown): boolean {
  if (typeof roleValue !== "string") return false;
  const role = Role.fromString(roleValue);
  return role ? role.isManagement() : false;
}
