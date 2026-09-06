import { describe, expect, test } from "bun:test";

const profileFieldsSource = await Bun.file(
  new URL("../../../src/components/account/ProfileFields.vue", import.meta.url)
).text();
const profileCardSource = await Bun.file(
  new URL("../../../src/components/account/ProfileCard.vue", import.meta.url)
).text();
const userDetailSource = await Bun.file(new URL("../../../src/pages/admin/UserDetail.vue", import.meta.url)).text();

describe("shared profile fields", () => {
  test("keeps the common profile controls in one component used by both screens", () => {
    for (const id of ["grade", "year", "joinedAt", "getGradeAt", "birthday"]) {
      expect(profileFieldsSource).toContain(`id="${id}"`);
    }

    expect(profileCardSource).toContain("<ProfileFields");
    expect(userDetailSource).toContain("<ProfileFields");
  });

  test("does not replace an edit form while the profile query is refreshed", () => {
    expect(profileCardSource).toMatch(/watch\(\s*profile,[\s\S]*?if \(!isEditing\.value\) applyProfileToForm\(newProfile\)/u);
  });
});

describe("user deletion confirmation", () => {
  test("keeps name confirmation before the final dialog", () => {
    expect(userDetailSource).toContain("v-model=\"deleteConfirmName\"");
    expect(userDetailSource).toContain("@click=\"showFinalConfirm = true\"");
    expect(userDetailSource).toContain("<ConfirmDialog");
  });

  test("passes deletion error and loading state to the final confirmation", () => {
    expect(userDetailSource).toContain(':error="deleteError || undefined"');
    expect(userDetailSource).toContain(':loading="deleting"');
    expect(userDetailSource).toContain("if (deleting.value) return;");
  });
});
