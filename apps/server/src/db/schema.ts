import { createInsertSchema, createSelectSchema } from "drizzle-orm/arktype";
import { index, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activity = sqliteTable(
  "activity",
  {
    id: text().primaryKey(),
    userId: text().notNull(),
    date: text().notNull(),
    period: real().default(1.5).notNull(),
    createAt: text().notNull(),
    updatedAt: text(),
  },
  (table) => [
    index("activity_user_id_date_period_idx").on(table.userId, table.date, table.period),
    index("activity_date_user_id_period_idx").on(table.date, table.userId, table.period),
  ]
);

export const selectActivitySchema = createSelectSchema(activity);
export const insertActivitySchema = createInsertSchema(activity, {
  period: (schema) => schema.moreThan(0),
});

export type ActivityType = typeof activity.$inferSelect;
