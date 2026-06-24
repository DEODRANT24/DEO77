# DEODRANT — AI Call Centre

A comic-book-themed Solana meme token platform with AI call centre service, wallet-gated features, and dual auth (social + wallet ownership via burn challenge).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path `/api`)
- `pnpm --filter @workspace/deodrant run dev` — run the frontend (port 23789, path `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (Wouter routing, Tailwind, custom comic-book CSS)
- API: Express 5 + Clerk middleware
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk v6 (Google, Email, X) + wallet-only sessions via burn challenge
- Solana: burn verification via JSON-RPC (`SOLANA_RPC_URL` + `DEODRANT_TOKEN_MINT`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema: `profiles`, `wallets`, `burn_challenges`, `wallet_sessions`
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod validators
- `artifacts/api-server/src/routes/` — `health.ts`, `profiles.ts`, `wallets.ts`
- `artifacts/api-server/src/lib/` — `solana.ts` (burn verification), `requireAuth.ts` (dual auth middleware)
- `artifacts/deodrant/src/App.tsx` — ClerkProvider + Wouter router wrapper
- `artifacts/deodrant/src/pages/Landing.tsx` — Main comic-book landing page (1100+ lines)
- `artifacts/deodrant/src/pages/ProfilePage.tsx` — Profile + wallet registration flow
- `artifacts/deodrant/src/index.css` — All styles including new auth/profile/wallet CSS

## Architecture decisions

- **Dual auth model**: Clerk handles social login; wallet-only users get a 30-day session token stored in DB (`wallet_sessions`) and localStorage. `requireAuth` middleware supports both flows transparently via `x-wallet-token` header.
- **Burn challenge logic**: Each wallet registration generates a random 1–420 token challenge. If the wallet has prior burns, the challenge increases by 10% of total burned (capped at 420). This discourages throwaway wallets.
- **Simulation mode**: If `DEODRANT_TOKEN_MINT` env var is not set, the Solana verifier accepts any 32+ char signature (dev/test mode). Set the env var for real burn verification.
- **Social users aggregate wallets**: A Clerk user can link multiple Solana wallets. Wallet-only users: the wallet IS the account (no Clerk profile).
- **Clerk v6 `<Show>` component**: Conditional rendering uses `<Show when="signed-in">` / `<Show when="signed-out">` (not `SignedIn`/`SignedOut` — those don't exist in v6).

## Product

- Comic-book aesthetic landing page for $DEODRANT Solana token
- AI call centre service (bot payment flow with burn or LP options)
- X/Twitter account cleanup service (hold-gated)
- Trading bot service (burn-gated)
- Profile page with wallet management and service access display

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Clerk v6 `<Show>` not `<SignedIn>`/`<SignedOut>`**: Unlike older docs, v6 exports `<Show when="signed-in">` for conditional rendering.
- **Simulation mode**: Solana burn verification is simulated when `DEODRANT_TOKEN_MINT` is not set. Any 32+ char string passes. Set the env var for production.
- **CSS path in Landing.tsx**: `import "../index.css"` (not `./`) since Landing.tsx is in `src/pages/`.
- **pre-existing `home.tsx` TS errors**: Framer Motion `Variants` type errors in `src/pages/home.tsx` are from the original repo clone — ignore.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Clerk auth config is done via the Auth pane in the Replit workspace toolbar, not an external Clerk dashboard
