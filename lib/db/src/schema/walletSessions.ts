import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletSessionsTable = pgTable("wallet_sessions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertWalletSessionSchema = createInsertSchema(walletSessionsTable).omit({ id: true, createdAt: true });
export type InsertWalletSession = z.infer<typeof insertWalletSessionSchema>;
export type WalletSession = typeof walletSessionsTable.$inferSelect;
