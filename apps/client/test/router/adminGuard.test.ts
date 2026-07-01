import { describe, expect, test } from "bun:test";

import { getPublicMetadataRole, isAdminRole } from "../../src/router/adminGuard";

describe("router admin guard role handling", () => {
  test("returns true for management role", () => {
    expect(isAdminRole("admin")).toBe(true);
  });

  test("returns false for member role", () => {
    expect(isAdminRole("member")).toBe(false);
  });

  test("returns false for unknown role", () => {
    expect(isAdminRole("unknown")).toBe(false);
  });

  test("extracts role from Clerk public metadata", () => {
    expect(getPublicMetadataRole({ role: "admin" })).toBe("admin");
  });

  test("returns undefined when metadata role is not a string", () => {
    expect(getPublicMetadataRole({ role: 1 })).toBeUndefined();
    expect(getPublicMetadataRole(null)).toBeUndefined();
    expect(getPublicMetadataRole("admin")).toBeUndefined();
  });
});
