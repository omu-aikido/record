import { describe, expect, test } from "bun:test";

const uiStatusSource = await Bun.file(new URL("../../src/components/ui/UiStatus.vue", import.meta.url)).text();
const homeSource = await Bun.file(new URL("../../src/pages/Home.vue", import.meta.url)).text();

describe("UiStatus", () => {
  test("keeps loading and empty states accessible", () => {
    expect(uiStatusSource).toMatch(/class="loading-container"[^>]*role="status"[^>]*aria-live="polite"/);
    expect(uiStatusSource).toContain('aria-hidden="true"');
    expect(uiStatusSource).toMatch(/class="text-subtext text-center"[^>]*role="status"[^>]*aria-live="polite"/);
  });

  test("announces error states to screen readers", () => {
    expect(uiStatusSource).toMatch(/class="alert-error"[^>]*role="alert"[^>]*aria-live="assertive"/);
  });
});

describe("Home external links", () => {
  test("protects links opened in a new tab", () => {
    expect(homeSource).toContain(
      ':rel="item.href.startsWith(\'http\') ? \'noopener noreferrer\' : undefined"'
    );
  });
});
