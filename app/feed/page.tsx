'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { theses } from '../../lib/assets';

export default function FeedPage() {
  const { address } = useAccount();
  const [notice, setNotice] = useState('');
  const act = async (thesisId: string, action: string) => {
    if (!address) { setNotice('Connect your wallet to interact with the feed.'); return; }
    const thesis = theses.find(t => t.id === thesisId)!;
    const r = await fetch('/api/social', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ wallet:address, thesisId, action, title:thesis.title, thesis:thesis.summary, allocations:thesis.assets }) });
    const d = await r.json(); setNotice(r.ok ? 'Saved.' : d.error || 'Unable to save.');
  };
  return <main className="shell"><nav className="nav"><Link className="brand" href="/">VESTO</Link><div className="navlinks"><Link href="/discover">Discover</Link><Link href="/feed">Feed</Link><Link href="/portfolio">Portfolio</Link><Link href="/wallet">Wallet</Link></div></nav><section className="section"><span className="eyebrow">COMMUNITY</span><h1>Ideas worth debating.</h1><p className="muted">Follow, discuss and remix transparent portfolios. Actions are persisted only when production storage is configured.</p>{notice&&<p className="muted">{notice}</p>}<div className="feed">{theses.map(t=><article className="card" key={t.id}><span className="tag">{t.tags.join(' · ')}</span><h2>{t.title}</h2><p className="muted">{t.summary}</p><p className="muted">{t.creator}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn" onClick={()=>act(t.id,'like')}>Like</button><button className="btn" onClick={()=>act(t.id,'follow')}>Follow</button><button className="btn" onClick={()=>act(t.id,'remix')}>Remix</button><Link className="btn primary" href={`/theses/${t.id}`}>Open thesis</Link></div></article>)}</div></section></main>;
}
