import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/server/db';

const walletPattern = /^0x[a-fA-F0-9]{40}$/;
const txPattern = /^0x[a-fA-F0-9]{64}$/;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('wallet') || '';
  if (!walletPattern.test(address)) return NextResponse.json({ error: 'Valid wallet is required.' }, { status: 400 });
  try {
    const result = await query('select * from executions where wallet_address=$1 order by created_at desc limit 50', [address.toLowerCase()]);
    return NextResponse.json({ executions: result.rows });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === 'DATABASE_NOT_CONFIGURED' ? 'Execution persistence is not configured yet.' : 'Unable to load execution history.' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!walletPattern.test(b.wallet) || !txPattern.test(b.txHash)) return NextResponse.json({ error: 'Invalid wallet or transaction hash.' }, { status: 400 });
    if (!['submitted','confirmed','reverted'].includes(b.status)) return NextResponse.json({ error: 'Invalid execution status.' }, { status: 400 });
    await query(`insert into executions(wallet_address,thesis_id,asset_symbol,sell_token,buy_token,sell_amount_base_units,tx_hash,status)
      values($1,$2,$3,$4,$5,$6,$7,$8)
      on conflict(tx_hash) do update set status=excluded.status`, [b.wallet.toLowerCase(), b.thesisId || null, b.assetSymbol, b.sellToken, b.buyToken, String(b.sellAmountBaseUnits), b.txHash, b.status]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error && e.message === 'DATABASE_NOT_CONFIGURED' ? 'Execution persistence is not configured yet.' : 'Unable to persist execution.' }, { status: 503 });
  }
}
