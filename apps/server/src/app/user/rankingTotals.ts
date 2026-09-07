import type { Context } from "hono";
import * as drizzleOrm from "drizzle-orm";

import { activity } from "../../db/schema";
import { dbClient } from "../../db/drizzle";

type CurrentUserTotal = {
  totalPeriod: number;
  recordCount: number;
};

export const getCurrentUserTotal = async (
  c: Context<{ Bindings: Env }>,
  startDate: string,
  endDate: string,
  currentUserId: string
): Promise<CurrentUserTotal> => {
  const db = dbClient(c.env);
  const currentUserTotalResult = await db
    .select({
      totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
      recordCount: drizzleOrm.sql<number>`COUNT(*)`,
    })
    .from(activity)
    .where(
      drizzleOrm.and(
        drizzleOrm.eq(activity.userId, currentUserId),
        drizzleOrm.gte(activity.date, startDate),
        drizzleOrm.lte(activity.date, endDate)
      )
    );

  return {
    totalPeriod: currentUserTotalResult[0]?.totalPeriod ?? 0,
    recordCount: currentUserTotalResult[0]?.recordCount ?? 0,
  };
};

export const getHigherUserCount = async (
  c: Context<{ Bindings: Env }>,
  startDate: string,
  endDate: string,
  currentUserTotal: number
): Promise<number> => {
  const db = dbClient(c.env);
  const groupedTotals = db
    .select({
      userId: activity.userId,
      totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
    })
    .from(activity)
    .where(drizzleOrm.and(drizzleOrm.gte(activity.date, startDate), drizzleOrm.lte(activity.date, endDate)))
    .groupBy(activity.userId)
    .as("grouped_totals");

  const higherUserCountResult = await db
    .select({
      count: drizzleOrm.sql<number>`COUNT(*)`,
    })
    .from(groupedTotals)
    .where(drizzleOrm.gt(groupedTotals.totalPeriod, currentUserTotal));

  return higherUserCountResult[0]?.count ?? 0;
};
