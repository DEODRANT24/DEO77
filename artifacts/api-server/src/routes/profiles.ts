import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, profilesTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/profiles/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const clerkUserId = req.userId;
    const walletAddress = req.walletAddress;

    if (clerkUserId) {
      let [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, clerkUserId))
        .limit(1);

      if (!profile) {
        const auth = getAuth(req as any);
        [profile] = await db
          .insert(profilesTable)
          .values({
            clerkUserId,
            email: (auth as any)?.sessionClaims?.email as string | undefined,
          })
          .returning();
      }

      return res.json(profile);
    }

    if (walletAddress) {
      const [wallet] = await db
        .select()
        .from(walletsTable)
        .where(eq(walletsTable.walletAddress, walletAddress))
        .limit(1);

      if (!wallet) return res.status(404).json({ error: "Wallet not found" });

      if (wallet.profileId) {
        const [profile] = await db
          .select()
          .from(profilesTable)
          .where(eq(profilesTable.id, wallet.profileId))
          .limit(1);
        if (profile) return res.json(profile);
      }

      return res.json({
        id: null,
        clerkUserId: null,
        displayName: walletAddress.slice(0, 8) + "..." + walletAddress.slice(-4),
        avatarUrl: null,
        email: null,
        createdAt: wallet.createdAt,
      });
    }

    return res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profiles/me/wallets", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const clerkUserId = req.userId;
    const walletId = req.walletId;

    if (clerkUserId) {
      const [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, clerkUserId))
        .limit(1);

      if (!profile) return res.json([]);

      const wallets = await db
        .select()
        .from(walletsTable)
        .where(eq(walletsTable.profileId, profile.id));

      return res.json(wallets);
    }

    if (walletId) {
      const wallets = await db
        .select()
        .from(walletsTable)
        .where(eq(walletsTable.id, walletId));
      return res.json(wallets);
    }

    return res.json([]);
  } catch (err) {
    req.log.error({ err }, "Failed to get wallets");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
