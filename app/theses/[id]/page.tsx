'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { assets, theses } from '../../../lib/assets';
import { InvestPanel } from '../../../components/InvestPanel';

export default function ThesisPage({ params }: { params: { id: string } }) {
  const thesis = useMemo(() => theses.find(t => t.id === params.id) || theses[0], [params.id]);
  const { address } = useAccount();
  const [social, setSocial] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [aiStatus, setAiStatus] = useState('');

  const loadSocial = async () => { try { const r = await fetch(`/api/social?thesisId=${thesis.id}`, { cache: 'no-store' }); const d = await r.json(); if (r.ok) setSocial(d); } catch {} };
  useEffect(() => { loadSocial(); }, [thesis.id]);

  const act = async (action: string, extra: Record<string, string> = {}) => {
    if (!address) { setAiStatus('Connect your wallet to interact with this thesis.'); return; }
    const r = await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: address, thesisId: thesis.id, action, title: thesis.title, thesis: thesis.summary, allocations: thesis.assets, ...extra }) });
    const d = await r.json(); if (!r.ok) setAiStatus(d.error || 'Social persistence is unavailable.'); else { setComment(''); setAiStatus('Saved.'); loadSocial(); }
  };

  const pressureTest = async () => {
    setAiStatus('Running AI pressure test…'); setAnalysis('');
    const r = await fetch('/api/pressure-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thesis: thesis.summary, allocations: thesis.assets }) });
    const d = await r.json();
    if (!r.ok) setAiStatus(d.error || 'AI is not configured.'); else { setAnalysis(d.text); setAiStatus(''); }
  };

  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/">VESTO</Link><div className="navlinks"><Link href="/discover">Discover</Link><Link href="/feed">Feed</Link><Link href="/portfolio">Portfolio</Link><Link href="/wallet">Wallet</Link></div></nav>
    <section className="section">
      <span className="eyebrow">INVESTMENT IDEA</span><h1>{thesis.title}</h1><p className="muted">by {thesis.creator} · {thesis.summary}</p>
      <div className="grid">
        <div className="card"><h3>Portfolio</h3>{thesis.assets.map(([symbol, weight]) => { const asset = assets.find(a => a.symbol === symbol)!; return <div className="assetrow" key={symbol}><div><b>{symbol}</b><div className="muted">{asset.name}</div></div><strong>{weight}%</strong></div>; })}<div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap'}}><button className="btn primary" onClick={() => act('follow')}>Follow thesis</button><button className="btn" onClick={() => act('like')}>Like · {social?.likes ?? 0}</button><button className="btn" onClick={() => act('remix')}>Remix · {social?.remixes ?? 0}</button></div></div>
        <div className="card"><h3>AI pressure test</h3><p className="muted">Neutral analysis of assumptions, risks and disconfirming evidence. It never places a trade.</p><button className="btn" onClick={pressureTest}>Run pressure test</button>{analysis && <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',lineHeight:1.6,marginTop:16}}>{analysis}</pre>}{aiStatus && <p className="muted">{aiStatus}</p>}</div>
      </div>
    </section>
    <section className="section"><h2>Discuss</h2><div className="card"><textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={1000} placeholder="Add a thesis-level comment…" style={{width:'100%',minHeight:100,background:'transparent',color:'inherit',border:'1px solid rgba(255,255,255,.15)',borderRadius:12,padding:12}}/><button className="btn primary" style={{marginTop:10}} onClick={()=>act('comment',{text:comment})}>Post comment</button>{social?.comments?.map((c:any)=><div className="idea" key={c.id}><b>{c.wallet_address.slice(0,6)}…{c.wallet_address.slice(-4)}</b><p>{c.body}</p></div>)}</div></section>
    <section className="section"><h2>Put the idea onchain</h2><p className="muted">Execution is optional and wallet-controlled. Vesto never takes custody of funds.</p>{thesis.assets.slice(0,1).map(([symbol])=>{const asset=assets.find(a=>a.symbol===symbol)!;return <InvestPanel key={symbol} token={asset.address as `0x${string}`} symbol={asset.symbol} thesisId={thesis.id}/>})}</section>
  </main>;
}
