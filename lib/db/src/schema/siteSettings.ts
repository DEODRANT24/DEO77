import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  setAt: timestamp("set_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
