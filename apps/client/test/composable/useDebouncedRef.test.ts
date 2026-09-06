import { describe, expect, test } from "bun:test";
import { effectScope, nextTick, ref } from "vue";
import { useDebouncedRef } from "../../src/composable/useDebouncedRef";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

describe("useDebouncedRef", () => {
  test("publishes only the latest value after the delay", async () => {
    const scope = effectScope();

    try {
      const source = ref("");
      const debounced = scope.run(() => useDebouncedRef(source, 40));
      if (debounced === undefined) throw new Error("Failed to create debounced ref");

      source.value = "a";
      await nextTick();
      expect(debounced.value).toBe("");

      source.value = "ab";
      await nextTick();
      await wait(60);

      expect(debounced.value).toBe("ab");
    } finally {
      scope.stop();
    }
  });
});
