# Arete

A Web3 invoicing dApp — create invoices, generate Solana Pay links, and track on-chain USDC payments in real-time on devnet.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/arete run dev` — run the frontend (port 22980)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/arete)
- API: Express 5 (artifacts/api-server)
- DB: Supabase (external Postgres, env-var driven)
- Blockchain: Solana devnet + USDC via @solana/web3.js
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/invoices.ts` — invoice CRUD + payment detection
- `artifacts/api-server/src/lib/supabase.ts` — Supabase client
- `artifacts/api-server/src/lib/solana-pay.ts` — Solana Pay URL builder + on-chain payment detector
- `artifacts/api-server/supabase-migration.sql` — run this in Supabase SQL Editor once

## Architecture decisions

- Supabase used instead of Replit built-in Postgres so the repo can be migrated to Render without losing data
- Solana Pay Transfer Request URL built manually (no heavy SDK) — recipient + USDC spl-token + reference public key
- Reference ID is a generated Solana keypair's public key (valid base58, 32 bytes) — required by Solana Pay spec for on-chain detection
- Payment detection polls devnet RPC for signatures on the reference address — no webhook required
- USDC devnet mint: `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr`

## Product

- Invoice creation: client name, USDC amount, recipient Solana wallet → generates Solana Pay QR + link
- Invoice detail: QR code (qrcode.react), copyable payment URL, "Check Payment" button polls devnet
- Dashboard: all invoices with status badges, aggregated stats (total USDC paid/pending)

## Gotchas

- Run `artifacts/api-server/supabase-migration.sql` in Supabase SQL Editor before first use
- Solana devnet is used — clients need devnet USDC (airdrop SOL, then swap or use faucet)
- Re-run `pnpm --filter @workspace/api-spec run codegen` after every OpenAPI spec change
- After codegen changes, restart both workflows

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
