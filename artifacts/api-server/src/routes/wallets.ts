import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, walletsTable, burnChallengesTable, walletSessionsTable, profilesTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { verifyBurnTransaction } from "../lib/solana";
import { logger } from "../lib/logger";
import { type AuthedRequest } from "../lib/requireAuth";

const router = Router();

const CHALLENGE_TTL_MINUTES = 30;
const SESSION_TTL_DAYS = 30;

function randomChallenge(previousTotal: number): number {
  const base = Math.floor(Math.random() * 420) + 1;
  if (previousTotal > 0) {
    return Math.min(420, base + Math.floor(previousTotal * 0.1));
  }
  return base;
}

router.post("/wallets/register", async (req: AuthedRequest, res) => {
  try {
    const { walletAddress } = req.body as { walletAddress: string; profileToken?: string };

    if (!walletAddress || typeof walletAddress !== "string" || walletAddress.length < 32) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    let wallet = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.walletAddress, walletAddress))
      .limit(1)
      .then(r => r[0]);

    if (!wallet) {
      [wallet] = await db
        .insert(walletsTable)
        .values({ walletAddress })
        .returning();
    }

    await db
      .update(burnChallengesTable)
      .set({ status: "expired" })
      .where(
        and(
          eq(burnChallengesTable.walletId, wallet.id),
          eq(burnChallengesTable.status, "pending"),
        ),
      );

    const challengeAmount = randomChallenge(wallet.totalBurned);
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000);

    const [challenge] = await db
      .insert(burnChallengesTable)
      .values({
        walletId: wallet.id,
        walletAddress,
        challengeAmount,
        status: "pending",
        expiresAt,
      })
      .returning();

    return res.json(challenge);
  } catch (err) {
    logger.error({ err }, "Failed to register wallet");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/wallets/challenge", async (req, res) => {
  try {
    const { address } = req.query as { address: string };
    if (!address) return res.status(400).json({ error: "address required" });

    const now = new Date();
    const challenge = await db
      .select()
      .from(burnChallengesTable)
      .where(
        and(
          eq(burnChallengesTable.walletAddress, address),
          eq(burnChallengesTable.status, "pending"),
          gt(burnChallengesTable.expiresAt, now),
        ),
      )
      .orderBy(burnChallengesTable.createdAt)
      .limit(1)
      .then(r => r[0]);

    if (!challenge) return res.status(404).json({ error: "No active challenge" });
    return res.json(challenge);
  } catch (err) {
    logger.error({ err }, "Failed to get challenge");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wallets/verify", async (req: AuthedRequest, res) => {
  try {
    const { walletAddress, txSignature } = req.body as {
      walletAddress: string;
      txSignature: string;
      profileToken?: string;
    };

    if (!walletAddress || !txSignature) {
      return res.status(400).json({ error: "walletAddress and txSignature required" });
    }

    const now = new Date();
    const [challenge] = await db
      .select()
      .from(burnChallengesTable)
      .where(
        and(
          eq(burnChallengesTable.walletAddress, walletAddress),
          eq(burnChallengesTable.status, "pending"),
          gt(burnChallengesTable.expiresAt, now),
        ),
      )
      .orderBy(burnChallengesTable.createdAt)
      .limit(1);

    if (!challenge) {
      return res.status(400).json({ error: "No active challenge for this wallet. Please register again." });
    }

    const verification = await verifyBurnTransaction(
      txSignature,
      walletAddress,
      challenge.challengeAmount,
    );

    if (!verification.valid) {
      return res.status(400).json({ error: verification.error ?? "Burn verification failed" });
    }

    let [wallet] = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.walletAddress, walletAddress))
      .limit(1);

    const newTotal = (wallet?.totalBurned ?? 0) + Math.floor(verification.burnedAmount);

    const auth = getAuth(req as any);
    const clerkUserId = auth?.userId;

    let profileId: number | null = wallet?.profileId ?? null;

    if (clerkUserId && !profileId) {
      let [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, clerkUserId))
        .limit(1);

      if (!profile) {
        [profile] = await db
          .insert(profilesTable)
          .values({ clerkUserId })
          .returning();
      }
      profileId = profile.id;
    }

    if (wallet) {
      await db
        .update(walletsTable)
        .set({
          verified: true,
          totalBurned: newTotal,
          verifiedAt: now,
          profileId: profileId ?? wallet.profileId,
        })
        .where(eq(walletsTable.id, wallet.id));
    } else {
      [wallet] = await db
        .insert(walletsTable)
        .values({
          walletAddress,
          verified: true,
          totalBurned: newTotal,
          verifiedAt: now,
          profileId,
        })
        .returning();
    }

    await db
      .update(burnChallengesTable)
      .set({ status: "complete", burnTxHash: txSignature, completedAt: now })
      .where(eq(burnChallengesTable.id, challenge.id));

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(walletSessionsTable).values({
      walletId: wallet.id,
      walletAddress,
      token: sessionToken,
      expiresAt: sessionExpires,
    });

    return res.json({
      walletAddress,
      verified: true,
      totalBurned: newTotal,
      sessionToken,
      profileId,
    });
  } catch (err) {
    logger.error({ err }, "Failed to verify burn");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wallets/session", async (req, res) => {
  try {
    const { sessionToken } = req.body as { sessionToken: string };
    if (!sessionToken) return res.status(400).json({ error: "sessionToken required" });

    const now = new Date();
    const [session] = await db
      .select()
      .from(walletSessionsTable)
      .where(
        and(
          eq(walletSessionsTable.token, sessionToken),
          gt(walletSessionsTable.expiresAt, now),
        ),
      )
      .limit(1);

    if (!session) return res.status(401).json({ error: "Invalid or expired session token" });

    const [wallet] = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.id, session.walletId))
      .limit(1);

    let profileInfo = null;
    if (wallet?.profileId) {
      const [profile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.id, wallet.profileId))
        .limit(1);
      profileInfo = profile;
    }

    return res.json({
      walletAddress: session.walletAddress,
      totalBurned: wallet?.totalBurned ?? 0,
      profileId: wallet?.profileId ?? null,
      displayName: profileInfo?.displayName ?? null,
      avatarUrl: profileInfo?.avatarUrl ?? null,
    });
  } catch (err) {
    logger.error({ err }, "Failed wallet login");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
