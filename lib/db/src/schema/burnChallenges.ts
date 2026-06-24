import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const burnChallengesTable = pgTable("burn_challenges", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  challengeAmount: integer("challenge_amount").notNull(),
  status: text("status").notNull().default("pending"),
  burnTxHash: text("burn_tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertBurnChallengeSchema = createInsertSchema(burnChallengesTable).omit({ id: true, createdAt: true });
export type InsertBurnChallenge = z.infer<typeof insertBurnChallengeSchema>;
export type BurnChallenge = typeof burnChallengesTable.$inferSelect;
