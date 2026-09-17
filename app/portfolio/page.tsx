'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { theses, assets } from '../../lib/assets';
import { InvestPanel } from '../../components/InvestPanel';

export default function Portfolio() {
  const t = theses[0];
  const { address } = useAccount();
  const [allocations, setAllocations] = useState<Record<string, number>>(Object.fromEntries(t.assets));
  const [notice, setNotice] = useState('');
  const total = Object.values(allocations).reduce((a, b) => a + b, 0);
  const change = (symbol: string, value: string | number) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    setAllocations(a => ({ ...a, [symbol]: Math.max(0, Math.min(100, numericValue || 0)) }));
  };
  const save = async () => {
    if (!address) { setNotice('Connect your wallet to save a portfolio.'); return; }
    if (Math.round(total) !== 100) { setNotice('Allocation must total exactly 100%.'); return; }
    const r = await fetch('/api/theses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: address, id: `${t.id}-${address.slice(2, 8)}`, title: `${t.title} — remix`, thesis: t.summary, allocations: Object.entries(allocations) }) });
    const d = await r.json();
    setNotice(r.ok ? 'Remix saved to Vesto.' : d.error || 'Unable to save.');
  };
  return <main className="shell"><nav className="nav"><Link className="brand" href="/">VESTO</Link><div className="navlinks"><Link href="/discover">Discover</Link><Link href="/feed">Feed</Link><Link href="/portfolio">Portfolio</Link><Link href="/wallet">Wallet</Link></div></nav><section className="section"><div className="eyebrow">PORTFOLIO BUILDER</div><h1>{t.title}</h1><p className="muted">Remix the model, validate the total, then execute only what you choose.</p></section><div className="feed"><section className="card"><h2>Target allocation</h2>{t.assets.map(([symbol])=>{const a=assets.find(x=>x.symbol===symbol)!;return <div className="assetrow" key={symbol}><div><b>{symbol}</b><div className="muted">{a.name}</div></div><input className="btn" style={{width:90}} value={allocations[symbol]} onChange={e=>change(symbol,e.target.value)} inputMode="numeric"/><strong>%</strong></div>})}<p className={Math.round(total)===100?'green':'muted'}>Total: {total}%</p><div className="actions"><button className="btn primary" onClick={save}>Save remix</button><button className="btn" onClick={()=>setAllocations(Object.fromEntries(t.assets))}>Reset</button></div>{notice&&<p className="muted">{notice}</p>}</section><InvestPanel token={assets[0].address as `0x${string}`} symbol={assets[0].symbol} thesisId={t.id}/></div><section className="section"><div className="card"><b>Execution guardrails</b><p className="muted">Vesto never holds your keys. Quotes come from the configured 0x API, approvals are scoped to the returned allowance target, and swaps are submitted from your connected wallet. Tokenized stocks have jurisdictional and market risks; verify your eligibility and review issuer disclosures before trading.</p></div></section></main>;
}
