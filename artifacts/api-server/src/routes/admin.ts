import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/token-address", async (req: Request, res: Response) => {
  try {
    const [setting] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "token_address"));

    res.json({ address: setting?.value ?? null, locked: !!setting });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch token address");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/token-address", async (req: Request, res: Response) => {
  try {
    const [setting] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "token_address"));

    res.json({ address: setting?.value ?? null, locked: !!setting });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch token address");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/token-address", async (req: Request, res: Response) => {
  try {
    const { username, password, address } = req.body as {
      username?: string;
      password?: string;
      address?: string;
    };

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      res.status(503).json({ error: "Admin credentials not configured" });
      return;
    }

    if (username !== adminUsername || password !== adminPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const [existing] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "token_address"));

    if (existing) {
      res.status(403).json({
        error: "Token address already set and permanently locked",
        address: existing.value,
      });
      return;
    }

    const trimmed = (address ?? "").trim();
    if (!trimmed || trimmed.length < 32 || trimmed.length > 44) {
      res.status(400).json({ error: "Invalid Solana contract address (must be 32–44 characters)" });
      return;
    }

    await db
      .insert(siteSettingsTable)
      .values({ key: "token_address", value: trimmed });

    req.log.info({ address: trimmed }, "Token address set and locked by admin");
    res.json({ success: true, address: trimmed });
  } catch (err) {
    req.log.error({ err }, "Admin token-address POST failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
