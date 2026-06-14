# Arete

**On-chain payment infrastructure on Solana — invoice creation to settlement in under 5 minutes.**

Arete is a full-stack, production-ready payment platform that lets merchants generate Solana Pay invoices, share payment QR codes, and receive real-time confirmation of on-chain settlement — all without a custodial intermediary. Authentication is wallet-native via Sign-In With Solana (SIWS), so no passwords or email accounts are required.

---

## Architecture

Arete is a pnpm monorepo structured into three layers:

```
/
├── artifacts/
│   ├── api-server/        # Express + Node.js REST API (deployed to Render)
│   └── arete/             # React + Vite frontend (deployed as static site)
├── lib/
│   ├── db/                # Drizzle ORM schema + Supabase client
│   ├── api-zod/           # Zod validation schemas (generated from OpenAPI spec)
│   └── api-client-react/  # Type-safe React Query hooks (generated via orval)
└── scripts/               # Dev tooling and codegen scripts
```

The API contract is the source of truth. An OpenAPI spec drives both the server-side Zod validators (`lib/api-zod`) and the client-side React Query hooks (`lib/api-client-react`) via orval codegen — meaning type safety is enforced end-to-end without manual duplication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| API Server | Node.js, Express, TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Sign-In With Solana (SIWS) + JWT |
| Payments | Solana Pay, `@solana/web3.js` |
| API Contract | OpenAPI spec → orval codegen |
| Validation | Zod |
| Data Fetching | TanStack React Query |
| Package Manager | pnpm workspaces |

---

## Key Features

**Wallet-native authentication.** Users connect a Solana wallet and sign a nonce message (SIWS) to authenticate. No passwords. No email. The server verifies the ed25519 signature and issues a JWT stored as an HttpOnly cookie, with a localStorage fallback for mobile WebViews.

**Invoice lifecycle management.** Merchants create invoices with an amount and description. The API generates a Solana Pay-compliant URL and QR code payload. Each invoice is scoped to the authenticated wallet via `owner_wallet` isolation — no full RLS complexity required.

**On-chain payment detection.** The API polls `getSignaturesForAddress` on the Solana RPC to detect incoming transactions matching the invoice reference. When a matching transaction is confirmed, the invoice status is updated to `paid`.

**Type-safe API layer.** The OpenAPI spec is the contract. orval generates React Query hooks and Axios client from it; the same spec generates Zod schemas for server-side request validation. Adding or changing an endpoint updates both sides simultaneously.

---

## Authentication Flow

```
1. Client requests a nonce from POST /auth/nonce
2. Server stores nonce in DB and returns it
3. Client prompts wallet to sign SIWS message containing the nonce
4. Client sends wallet address + signature to POST /auth/verify
5. Server verifies signature against the stored nonce
6. Server issues JWT (HttpOnly cookie + localStorage fallback)
7. Nonce is invalidated (single-use)
```

---

## Invoice Lifecycle

```
1. Authenticated merchant POSTs to /invoices with { amount, description }
2. API creates invoice row with status: 'pending' and owner_wallet
3. API returns Solana Pay URL: solana:<recipient>?amount=<X>&reference=<ref>
4. Client renders QR code from the URL
5. Payer scans QR with any Solana Pay-compatible wallet and sends SOL
6. Client polls GET /invoices/:id/watch
7. Server calls getSignaturesForAddress(reference) on Solana RPC
8. On confirmation, invoice status → 'paid', response returned to client
```

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project
- A Solana devnet RPC endpoint (Helius or public devnet)

### Setup

```bash
# Clone the repo
git clone https://github.com/impeccable548/Arete.git
cd Arete

# Install all workspace dependencies
pnpm install

# Set up environment variables
cp artifacts/api-server/.env.example artifacts/api-server/.env
# Fill in the values (see Environment Variables section below)

# Run database migrations
# Apply scripts/supabase-migration.sql to your Supabase project via the SQL editor

# Start the API server
pnpm --filter @workspace/api-server run dev

# In a separate terminal, start the frontend
pnpm --filter @workspace/arete run dev
```

### Codegen (after changing the OpenAPI spec)

```bash
pnpm --filter @workspace/api-zod run generate
pnpm --filter @workspace/api-client-react run generate
```

---

## Environment Variables

Set these in `artifacts/api-server/.env` for local development, and in your Render service dashboard for production.

| Variable | Description |
|---|---|
| `PORT` | Port the API server listens on (default: `8080`) |
| `NODE_ENV` | `development` or `production` |
| `SESSION_SECRET` | Random secret for JWT signing (min 32 chars) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (not anon key) |
| `SOLANA_RPC_URL` | Solana RPC endpoint (e.g. `https://api.devnet.solana.com`) |

---

## Deployment

### API Server → Render

**Build command:**
```
npm install -g pnpm && pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server run build
```

**Start command:**
```
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

**Root directory:** `/` (repo root — required for pnpm workspace resolution)

Set all environment variables from the table above in the Render dashboard under **Environment**.

### Frontend → Vercel / Static Host

**Build command:**
```
pnpm --filter @workspace/arete run build
```

**Output directory:** `artifacts/arete/dist`

Set `VITE_API_URL` to your Render API service URL.

---

## Project Structure (detailed)

```
artifacts/api-server/src/
├── routes/
│   ├── auth.ts          # SIWS nonce generation + signature verification
│   ├── invoices.ts      # Invoice CRUD + Solana Pay URL generation
│   └── payments.ts      # On-chain payment detection via getSignaturesForAddress
├── middleware/
│   └── auth.ts          # JWT verification middleware
└── index.ts             # Express app entry point

lib/db/src/
├── schema.ts            # Drizzle table definitions (invoices, nonces)
└── index.ts             # Supabase + Drizzle client initialization

lib/api-zod/src/generated/
└── api.ts               # Zod schemas generated from OpenAPI spec

lib/api-client-react/src/generated/
└── api.ts               # React Query hooks generated via orval
```

---

## Notes

- The project targets Solana **devnet** by default. Update `SOLANA_RPC_URL` to mainnet-beta for production use.
- The payment watcher uses on-demand RPC polling. For production scale, replace with a webhook-based approach (e.g. Helius webhooks) to avoid polling overhead.
- Render's free tier spins down after inactivity — the first request after a cold start may take 30–60 seconds. Upgrade to a paid instance type for production.

---

## License

MIT
