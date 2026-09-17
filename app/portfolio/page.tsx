'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { theses, assets } from '../../lib/assets';
import { InvestPanel } from '../../components/InvestPanel';

type Allocation = [string, number];

function allocationMap(entries: Allocation[]): Record<string, number> {
  return Object.fromEntries(entries) as Record<string, number>;
}

export default function Portfolio() {
  const t = theses[0];
  const { address } = useAccount();
  const initialAllocations = allocationMap(t.assets as Allocation[]);
  const [allocations, setAllocations] = useState<Record<string, number>>(initialAllocations);
  const [notice, setNotice] = useState('');
  const total = Object.values(allocations).reduce((a, b) => a + b, 0);

  const change = (symbol: string, value: string) => {
    const numericValue = Number(value);
    setAllocations(current => ({
      ...current,
      [symbol]: Math.max(0, Math.min(100, Number.isFinite(numericValue) ? numericValue : 0)),
    }));
  };

  const save = async () => {
    if (!address) {
      setNotice('Connect your wallet to save a portfolio.');
      return;
    }
    if (Math.round(total) !== 100) {
      setNotice('Allocation must total exactly 100%.');
      return;
    }

    const response = await fetch('/api/theses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: address,
        id: `${t.id}-${address.slice(2, 8)}`,
        title: `${t.title} — remix`,
        thesis: t.summary,
        allocations: Object.entries(allocations),
      }),
    });
    const data = await response.json();
    setNotice(response.ok ? 'Remix saved to Vesto.' : data.error || 'Unable to save.');
  };

  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/">VESTO</Link>
        <div className="navlinks">
          <Link href="/discover">Discover</Link>
          <Link href="/feed">Feed</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/wallet">Wallet</Link>
        </div>
      </nav>

      <section className="section">
        <div className="eyebrow">PORTFOLIO BUILDER</div>
        <h1>{t.title}</h1>
        <p className="muted">Remix the model, validate the total, then execute only what you choose.</p>
      </section>

      <div className="feed">
        <section className="card">
          <h2>Target allocation</h2>
          {(t.assets as Allocation[]).map(([symbol]) => {
            const asset = assets.find(item => item.symbol === symbol);
            if (!asset) return null;
            return (
              <div className="assetrow" key={symbol}>
                <div>
                  <b>{symbol}</b>
                  <div className="muted">{asset.name}</div>
                </div>
                <input
                  className="btn"
                  style={{ width: 90 }}
                  value={allocations[symbol] ?? 0}
                  onChange={event => change(symbol, event.target.value)}
                  inputMode="numeric"
                />
                <strong>%</strong>
              </div>
            );
          })}
          <p className={Math.round(total) === 100 ? 'green' : 'muted'}>Total: {total}%</p>
          <div className="actions">
            <button className="btn primary" onClick={save}>Save remix</button>
            <button className="btn" onClick={() => setAllocations(allocationMap(t.assets as Allocation[]))}>Reset</button>
          </div>
          {notice && <p className="muted">{notice}</p>}
        </section>

        <InvestPanel token={assets[0].address as `0x${string}`} symbol={assets[0].symbol} thesisId={t.id} />
      </div>

      <section className="section">
        <div className="card">
          <b>Execution guardrails</b>
          <p className="muted">Vesto never holds your keys. Quotes come from the configured 0x API, approvals are scoped to the returned allowance target, and swaps are submitted from your connected wallet. Tokenized stocks have jurisdictional and market risks; verify your eligibility and review issuer disclosures before trading.</p>
        </div>
      </section>
    </main>
  );
}
