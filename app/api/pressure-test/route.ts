import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'AI pressure testing is not configured yet.' }, { status: 503 });
  const body = await req.json();
  const thesis = String(body.thesis || '').trim();
  const allocations = body.allocations || {};
  if (!thesis) return NextResponse.json({ error: 'A thesis is required.' }, { status: 400 });

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      input: [
        { role: 'system', content: 'You are Vesto Risk Lens. Analyze an investment thesis neutrally. Do not tell the user to buy, sell, or hold. Return concise sections: Thesis strength, key assumptions, risks, disconfirming evidence to watch, and questions. This is educational analysis, not personalized financial advice.' },
        { role: 'user', content: JSON.stringify({ thesis, allocations }) },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data?.error?.message || 'AI provider request failed.' }, { status: response.status });
  const text = data.output_text || data.output?.flatMap((item: any) => item.content || []).map((part: any) => part.text || '').join('\n') || 'No analysis returned.';
  return NextResponse.json({ text });
}
