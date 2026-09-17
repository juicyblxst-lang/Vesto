# Vesto

**Ideas → positions.**

Vesto is a social investing MVP for tokenized assets on Base. It turns an investment idea into a transparent model portfolio that people can discover, discuss, remix, and — where an eligible executable market route exists — execute from their own wallet.

## MVP loop

`DISCOVER → THESIS → PORTFOLIO → DISCUSS → AI PRESSURE TEST → REMIX → INVEST`

## What is real

- Base mainnet wallet connection through an injected wallet.
- Official Coinbase Tokenized Stock contract registry sourced from Base's current public stock listing.
- Real USDC balance approval + 0x executable quote flow when `ZEROX_API_KEY` is configured.
- User signs every onchain transaction; Vesto never receives private keys or custody.
- Transaction links go to BaseScan.

## What is intentionally not faked

If a route, market, eligibility condition, or API integration is unavailable, Vesto reports that state instead of fabricating a price, fill, balance, or transaction.

## Run

```bash
npm install
npm run dev
```

Set `ZEROX_API_KEY` in the deployment environment to enable the real swap execution path. `NEXT_PUBLIC_BASE_RPC_URL` can override the default Base RPC.

## Product thesis

Tokenized stocks are now live on Base as B20 tokens backed 1:1 by underlying shares. The product opportunity is the layer above the rails: make investment ideas social and make the path from idea to self-custodied position understandable.

Vesto is informational software, not a broker or investment adviser. Users are responsible for reviewing issuer disclosures and their own eligibility before transacting.
