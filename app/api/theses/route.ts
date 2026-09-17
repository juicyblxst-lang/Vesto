import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!/^0x[a-fA-F0-9]{40}$/.test(b.wallet)) return NextResponse.json({ error: 'Valid wallet is required.' }, { status: 400 });
    const id = String(b.id || '').replace(/[^a-z0-9-]/gi, '-').slice(0, 100);
    const title = String(b.title || '').trim().slice(0, 160);
    const thesis = String(b.thesis || '').trim().slice(0, 2000);
    const allocations = b.allocations;
    if (!id || !title || !thesis || !Array.isArray(allocations)) return NextResponse.json({ error: 'id, title, thesis and allocations are required.' }, { status: 400 });
    await query('insert into profiles(wallet_address) values($1) on conflict do nothing', [b.wallet.toLowerCase()]);
    await query('insert into theses(id,creator_wallet,title,thesis,allocations) values($1,$2,$3,$4,$5) on conflict(id) do update set creator_wallet=excluded.creator_wallet,title=excluded.title,thesis=excluded.thesis,allocations=excluded.allocations', [id,b.wallet.toLowerCase(),title,thesis,JSON.stringify(allocations)]);
    return NextResponse.json({ ok:true, id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === 'DATABASE_NOT_CONFIGURED' ? 'Database persistence is not configured yet.' : 'Unable to save thesis.' }, { status: 503 });
  }
}
