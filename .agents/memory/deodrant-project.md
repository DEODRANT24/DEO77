---
name: DEODRANT project setup
description: Key facts about the DEODRANT app setup — workflows, auth, DB, env vars.
---

## Artifacts
- `artifacts/deodrant` — React/Vite frontend, preview path `/`, port 23789
- `artifacts/api-server` — Express backend, preview path `/api`, port 8080

## Workflows
- "API Server": `PORT=8080 pnpm --filter @workspace/api-server run dev` (console, port 8080)
- "DEODRANT App": `PORT=23789 BASE_PATH=/ pnpm --filter @workspace/deodrant run dev` (webview, port 23789)

**Why:** Both vite.config.ts and api-server/src/index.ts require PORT and BASE_PATH env vars or they crash. The artifact.toml sets these in [services.env] for artifact-managed workflows, but when using configureWorkflow() they must be passed inline in the command.

## DB Schema (4 tables)
- `profiles` — Clerk users and wallet-linked profiles
- `wallets` — Solana wallet addresses, verified status, totalBurned
- `burn_challenges` — Pending/complete burn challenges with amounts
- `wallet_sessions` — Wallet-based auth session tokens (30-day TTL)

## Auth
- Clerk (Replit-managed) + Solana wallet burn verification
- `requireAuth` middleware checks Clerk session first, then `x-wallet-token` header or `wallet_token` cookie
- In simulation mode (no DEODRANT_TOKEN_MINT env var), any 32+ char tx signature passes

## Key env vars
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned
- `DEODRANT_TOKEN_MINT` — Solana token mint address (optional, falls back to simulation)
- `SOLANA_RPC_URL` — defaults to mainnet-beta public RPC
- `DATABASE_URL` — provisioned PostgreSQL

## Pages
- `/` — Landing
- `/sign-in`, `/sign-up` — Clerk auth
- `/profile` — User profile
- `/callcentre` — AI Call Centre
- `/leads` — Get Leads Saar
- `/x-clean` — X-Clean (comic strip feature)
