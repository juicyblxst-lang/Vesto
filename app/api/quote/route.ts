import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const sellToken = p.get('sellToken'); const buyToken = p.get('buyToken'); const sellAmount = p.get('sellAmount'); const taker = p.get('taker');
  if (!sellToken || !buyToken || !sellAmount || !taker) return NextResponse.json({ error: 'Missing quote parameters.' }, { status: 400 });
  if (!process.env.ZEROX_API_KEY) return NextResponse.json({ error: 'Trading is not configured. Add ZEROX_API_KEY to the deployment environment.' }, { status: 503 });
  const url = new URL('https://api.0x.org/swap/allowance-holder/quote');
  url.searchParams.set('chainId', '8453'); url.searchParams.set('sellToken', sellToken); url.searchParams.set('buyToken', buyToken); url.searchParams.set('sellAmount', sellAmount); url.searchParams.set('taker', taker);
  const response = await fetch(url, { headers: { '0x-api-key': process.env.ZEROX_API_KEY, '0x-version': 'v2', Accept: 'application/json' }, cache: 'no-store' });
  return NextResponse.json(await response.json(), { status: response.status });
}
