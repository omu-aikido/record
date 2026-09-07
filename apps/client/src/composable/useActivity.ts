import hc from "@/lib/honoClient";
import type { InferRequestType } from "hono/client";
import { queryKeys } from "@/lib/queryKeys";
import { computed, type Ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { countPracticeDays, type RankingResponse } from "share";

type RecordQuery = InferRequestType<typeof hc.user.record.$get>["query"];

const isActivityListQuery = ({ queryKey }: { queryKey: readonly unknown[] }) =>
  queryKey[0] === "user" && queryKey[1] === "record" && typeof queryKey[2] !== "string";

const patchRankingAfterActivityAdd = (
  ranking: RankingResponse | undefined,
  date: string,
  period: number
): RankingResponse | undefined => {
  if (!ranking || !ranking.currentUserRanking) return ranking;
  if (date < ranking.startDate || date > ranking.endDate) return ranking;

  const totalPeriod = ranking.currentUserRanking.totalPeriod + period;
  return {
    ...ranking,
    currentUserRanking: {
      ...ranking.currentUserRanking,
      totalPeriod,
      practiceCount: countPracticeDays(totalPeriod),
    },
  };
};

export function useActivities(filters: Ref<RecordQuery | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.user.record({ query: filters.value ?? {} })),
    queryFn: async () => {
      const query = filters.value ?? {};
      const res = await hc.user.record.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      return data.activities;
    },
  });
}

export function useAddActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    // The activity endpoint is a non-idempotent POST. Retrying after an uncertain
    // response could create the same activity more than once.
    retry: false,
    mutationFn: async ({ date, period }: { date: string; period: number }) => {
      const res = await hc.user.record.$post({ json: { date, period } });
      if (!res.ok) {
        throw new Error("Failed to add activity");
      }
      return res.json();
    },
    onMutate: async ({ date, period }) => {
      const rankingQueryKey = queryKeys.user.record.ranking();
      await queryClient.cancelQueries({ queryKey: rankingQueryKey });

      const previousRankings = queryClient.getQueriesData<RankingResponse>({ queryKey: rankingQueryKey });
      queryClient.setQueriesData<RankingResponse>({ queryKey: rankingQueryKey }, (ranking) =>
        patchRankingAfterActivityAdd(ranking, date, period)
      );

      return { previousRankings };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, ranking] of context?.previousRankings ?? []) {
        queryClient.setQueryData(queryKey, ranking);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: isActivityListQuery }),
        queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count(), exact: true }),
      ]);
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 3,
    mutationFn: async (ids: string[]) => {
      const res = await hc.user.record.$delete({ json: { ids } });
      if (!res.ok) throw new Error("Failed to delete activities");
      return res.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: isActivityListQuery }),
        queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count(), exact: true }),
      ]);
    },
  });
}
