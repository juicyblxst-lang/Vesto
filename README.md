# Vesto

Vesto turns investment ideas into transparent, user-controlled onchain positions.

**DISCOVER → THESIS → PORTFOLIO → DISCUSS → AI PRESSURE TEST → REMIX → INVEST**

## What is real

- Base mainnet wallet connection through Wagmi/injected wallets.
- Verified Coinbase tokenized-stock contract addresses are kept in `lib/assets.ts`.
- Indicative and firm execution quotes use the 0x Swap API v2 AllowanceHolder flow when `ZEROX_API_KEY` is configured.
- Approvals are requested only for the allowance target returned by 0x; Vesto does not hardcode a swap spender.
- The final swap transaction is signed by the user's wallet and the UI waits for the Base receipt before calling it confirmed.
- USDC and token balances are read from Base directly.
- Social interactions, saved remixes and execution history use Postgres when `DATABASE_URL` is configured.
- AI pressure testing uses the OpenAI Responses API when `OPENAI_API_KEY` is configured.

## Truthful fallback behavior

Vesto does not fake unavailable infrastructure. Without production credentials, the affected feature fails closed with an explicit configuration message. Starter theses and asset metadata are static product content, not fabricated live market data.

## Environment

Copy `.env.example` to `.env.local` for local development. Supply:

- `ZEROX_API_KEY` for executable Base swaps.
- `DATABASE_URL` plus `db/schema.sql` for server-side social/remix/execution persistence.
- `OPENAI_API_KEY` for live AI pressure testing; `OPENAI_MODEL` is optional.
- `NEXT_PUBLIC_BASE_RPC_URL` optionally points the client at your Base RPC provider.

Never put private wallet keys in Vesto. The application is non-custodial and only asks the connected wallet to sign transactions.

## Production setup

1. Deploy the Next.js app.
2. Add the environment variables in the deployment provider.
3. Run `db/schema.sql` against the production Postgres database.
4. Connect a Base mainnet wallet and verify the chain is 8453.
5. Test quote, approval, swap submission and receipt confirmation with a small amount.
6. Verify every resulting transaction directly on BaseScan.

## Important eligibility and risk note

Coinbase tokenized stocks are subject to issuer terms, jurisdictional restrictions, market/liquidity risk and other risks. Vesto does not determine eligibility. Users must verify that they are eligible and review the issuer/provider disclosures before interacting with these assets.

Vesto is software infrastructure and educational tooling, not personalized investment, legal or tax advice.
