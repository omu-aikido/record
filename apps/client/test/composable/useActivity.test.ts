import { describe, expect, mock, test } from "bun:test";
import { createApp, effectScope } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

const post = mock(async () => {
  throw new Error("network failure after the request was sent");
});

mock.module("@/lib/honoClient", () => ({
  default: {
    user: {
      record: {
        $post: post,
      },
    },
  },
}));

const { useAddActivity } = await import("../../src/composable/useActivity");

describe("useAddActivity", () => {
  test("does not retry a failed activity POST", async () => {
    const app = createApp({ setup: () => () => null });
    app.use(VueQueryPlugin, { queryClient: new QueryClient() });
    const scope = effectScope();
    const mutation = app.runWithContext(() => scope.run(() => useAddActivity()))!;

    try {
      await expect(mutation.mutateAsync({ date: "2026-01-01", period: 60 })).rejects.toThrow(
        "network failure after the request was sent"
      );
      expect(post).toHaveBeenCalledTimes(1);
    } finally {
      scope.stop();
    }
  });
});
