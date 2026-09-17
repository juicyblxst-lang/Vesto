import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.ZEROX_API_KEY;
  if (!apiKey) return NextResponse.json({ error: '0x API key is not configured.' }, { status: 503 });
  const input = req.nextUrl.searchParams;
  const params = new URLSearchParams({
    chainId: '8453',
    sellToken: input.get('sellToken') || '',
    buyToken: input.get('buyToken') || '',
    sellAmount: input.get('sellAmount') || '',
    ...(input.get('taker') ? { taker: input.get('taker')! } : {}),
  });
  if (!params.get('sellToken') || !params.get('buyToken') || !params.get('sellAmount')) return NextResponse.json({ error: 'sellToken, buyToken and sellAmount are required.' }, { status: 400 });
  const response = await fetch(`https://api.0x.org/swap/allowance-holder/price?${params}`, { headers: { '0x-api-key': apiKey, '0x-version': 'v2', Accept: 'application/json' }, cache: 'no-store' });
  const body = await response.json();
  return NextResponse.json(body, { status: response.status });
}
