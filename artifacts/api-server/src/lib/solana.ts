import { logger } from "./logger";

const SOLANA_RPC = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const DEODRANT_MINT = process.env.DEODRANT_TOKEN_MINT ?? "";
const TOKEN_DECIMALS = 6;

interface RpcResponse {
  result?: unknown;
  error?: { code: number; message: string };
}

async function rpc(method: string, params: unknown[]): Promise<unknown> {
  try {
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = (await res.json()) as RpcResponse;
    if (json.error) {
      logger.warn({ rpcError: json.error }, "Solana RPC error");
      return null;
    }
    return json.result ?? null;
  } catch (err) {
    logger.warn({ err }, "Solana RPC fetch failed");
    return null;
  }
}

export interface BurnVerification {
  valid: boolean;
  burnedAmount: number;
  fromAddress: string | null;
  error?: string;
}

export async function verifyBurnTransaction(
  txSignature: string,
  expectedWallet: string,
  expectedMinBurn: number,
): Promise<BurnVerification> {
  if (!DEODRANT_MINT) {
    logger.warn("DEODRANT_TOKEN_MINT not set — using simulation mode");
    return simulateBurnVerification(txSignature, expectedWallet, expectedMinBurn);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tx = await rpc("getTransaction", [
    txSignature,
    { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
  ]) as any;

  if (!tx) {
    return { valid: false, burnedAmount: 0, fromAddress: null, error: "Transaction not found" };
  }

  if (tx.meta?.err) {
    return { valid: false, burnedAmount: 0, fromAddress: null, error: "Transaction failed on-chain" };
  }

  const accountKeys: string[] = tx.transaction?.message?.accountKeys?.map(
    (k: any) => (typeof k === "string" ? k : k.pubkey),
  ) ?? [];

  const senderIndex = accountKeys.indexOf(expectedWallet);
  if (senderIndex === -1) {
    return {
      valid: false,
      burnedAmount: 0,
      fromAddress: null,
      error: `Wallet ${expectedWallet} not found in transaction`,
    };
  }

  const preBalances = (tx.meta?.preTokenBalances ?? []) as any[];
  const postBalances = (tx.meta?.postTokenBalances ?? []) as any[];

  let burnedRaw = 0;

  for (const pre of preBalances) {
    if (
      pre.mint !== DEODRANT_MINT ||
      accountKeys[pre.accountIndex] !== expectedWallet
    ) continue;
    const post = postBalances.find(
      (p: any) => p.accountIndex === pre.accountIndex && p.mint === DEODRANT_MINT,
    );
    const preAmount = Number(pre.uiTokenAmount?.amount ?? 0);
    const postAmount = Number(post?.uiTokenAmount?.amount ?? 0);
    burnedRaw += Math.max(0, preAmount - postAmount);
  }

  const burnedAmount = burnedRaw / Math.pow(10, TOKEN_DECIMALS);

  if (burnedAmount < expectedMinBurn) {
    return {
      valid: false,
      burnedAmount,
      fromAddress: expectedWallet,
      error: `Burned ${burnedAmount} DEODRANT but needed ${expectedMinBurn}`,
    };
  }

  return { valid: true, burnedAmount, fromAddress: expectedWallet };
}

function simulateBurnVerification(
  txSignature: string,
  expectedWallet: string,
  expectedMinBurn: number,
): BurnVerification {
  const isValid = txSignature.length >= 32;
  if (!isValid) {
    return { valid: false, burnedAmount: 0, fromAddress: null, error: "Invalid signature format" };
  }
  return {
    valid: true,
    burnedAmount: expectedMinBurn,
    fromAddress: expectedWallet,
  };
}
