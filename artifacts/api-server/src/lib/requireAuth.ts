import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, walletSessionsTable, walletsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { logger } from "./logger";

export type AuthedRequest = Request & {
  userId?: string;
  walletAddress?: string;
  walletId?: number;
};

export const requireAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (clerkUserId) {
    req.userId = clerkUserId;
    next();
    return;
  }

  const token =
    req.headers["x-wallet-token"] as string | undefined ||
    req.cookies?.wallet_token;

  if (token) {
    try {
      const [session] = await db
        .select()
        .from(walletSessionsTable)
        .where(
          and(
            eq(walletSessionsTable.token, token),
            gt(walletSessionsTable.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (session) {
        req.walletAddress = session.walletAddress;
        req.walletId = session.walletId;
        next();
        return;
      }
    } catch (err) {
      logger.warn({ err }, "Failed to validate wallet session token");
    }
  }

  res.status(401).json({ error: "Unauthorized" });
};
