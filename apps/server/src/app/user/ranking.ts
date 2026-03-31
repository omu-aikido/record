import type { Context } from 'hono';
import * as drizzleOrm from 'drizzle-orm';

import { activity } from '@/src/db/schema';
import { dbClient } from '@/src/db/drizzle';
import type { RankingEntry } from 'share';

type RawRankingEntry = {
  userId: string;
  totalPeriod: number;
};

type PeriodParams = {
  year: number;
  month: number;
  period: 'monthly' | 'annual' | 'fiscal';
};

type PeriodRange = {
  startDate: string;
  endDate: string;
  periodLabel: string;
};

export const calculatePeriodRange = (params: PeriodParams): PeriodRange => {
  const { year, month, period } = params;

  if (period === 'annual') {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      periodLabel: `${year}年`,
    };
  }

  if (period === 'fiscal') {
    return {
      startDate: `${year}-04-01`,
      endDate: `${year + 1}-03-31`,
      periodLabel: `${year}年度`,
    };
  }

  // monthly
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0));
  return {
    startDate: monthStart.toISOString().split('T')[0] || '',
    endDate: monthEnd.toISOString().split('T')[0] || '',
    periodLabel: new Date(year, month - 1, 1).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    }),
  };
};

export const getRankingData = async (
  c: Context<{ Bindings: Env }>,
  startDate: string,
  endDate: string
): Promise<RawRankingEntry[]> => {
  const db = dbClient(c.env);
  const rawData = await db
    .select({
      userId: activity.userId,
      totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
    })
    .from(activity)
    .where(drizzleOrm.and(drizzleOrm.gte(activity.date, startDate), drizzleOrm.lte(activity.date, endDate)))
    .groupBy(activity.userId)
    .orderBy(drizzleOrm.desc(drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`))
    .limit(50);

  return rawData;
};

export const maskRankingData = (rawData: RawRankingEntry[], currentUserId: string): RankingEntry[] => {
  let currentRank = 1;
  let previousTotalPeriod: number | null = null;

  return rawData.map((entry, index) => {
    if (previousTotalPeriod !== null && entry.totalPeriod !== previousTotalPeriod) {
      currentRank = index + 1;
    }

    const isCurrentUser = entry.userId === currentUserId;

    previousTotalPeriod = entry.totalPeriod;

    return {
      rank: currentRank,
      userName: isCurrentUser ? 'あなた' : '匿名',
      isCurrentUser,
      totalPeriod: entry.totalPeriod,
      practiceCount: Math.floor(entry.totalPeriod / 1.5),
    };
  });
};
