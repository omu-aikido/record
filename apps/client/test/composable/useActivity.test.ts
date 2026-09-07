import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createApp, effectScope } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import type { RankingResponse } from "share";

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

const { patchRankingAfterActivityAdd, useAddActivity } = await import("../../src/composable/useActivity");

const createRanking = (currentUserRanking: RankingResponse["currentUserRanking"]): RankingResponse => ({
  period: "2026年9月",
  periodType: "monthly",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  ranking: [],
  currentUserRanking,
  totalUsers: 0,
});

describe("useAddActivity", () => {
  beforeEach(() => {
    post.mockClear();
    post.mockImplementation(async () => {
      throw new Error("network failure after the request was sent");
    });
  });

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

  test("optimistically creates stats and marks the rank as pending for a first activity", () => {
    const optimisticRanking = patchRankingAfterActivityAdd(createRanking(null), "2026-09-07", 1.5);

    expect(optimisticRanking).toMatchObject({
      currentUserRanking: {
        rank: null,
        userName: "あなた",
        isCurrentUser: true,
        totalPeriod: 1.5,
        practiceCount: 1,
      },
    });
  });

  test("marks an existing rank as pending while updating its stats", () => {
    const optimisticRanking = patchRankingAfterActivityAdd(
      createRanking({
        rank: 7,
        userName: "あなた",
        isCurrentUser: true,
        totalPeriod: 3,
        practiceCount: 2,
      }),
      "2026-09-07",
      1.5
    );

    expect(optimisticRanking?.currentUserRanking).toMatchObject({
      rank: null,
      totalPeriod: 4.5,
      practiceCount: 3,
    });
  });

  test("does not update a ranking outside the activity date's period", () => {
    const ranking = createRanking(null);

    expect(patchRankingAfterActivityAdd(ranking, "2026-08-31", 1.5)).toBe(ranking);
  });
});
