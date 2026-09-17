import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/server/db';

function wallet(value: string | null) { if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) throw new Error('VALID_WALLET_REQUIRED'); return value.toLowerCase(); }
async function ensureProfile(address: string) { await query('insert into profiles(wallet_address) values($1) on conflict do nothing', [address]); }
async function ensureThesis(body: any) { await query('insert into theses(id,title,thesis,allocations) values($1,$2,$3,$4) on conflict(id) do nothing', [body.thesisId, String(body.title || body.thesisId).slice(0,160), String(body.thesis || '').slice(0,2000), JSON.stringify(body.allocations || [])]); }

export async function GET(req: NextRequest) {
  try {
    const thesisId = req.nextUrl.searchParams.get('thesisId'); if (!thesisId) return NextResponse.json({ error:'thesisId is required.' },{status:400});
    const [stats,comments]=await Promise.all([query<{kind:string;count:string}>('select kind,count(*)::text as count from reactions where thesis_id=$1 group by kind',[thesisId]),query('select id,wallet_address,body,created_at from comments where thesis_id=$1 order by created_at desc limit 100',[thesisId])]);
    return NextResponse.json({likes:Number(stats.rows.find(r=>r.kind==='like')?.count||0),remixes:Number(stats.rows.find(r=>r.kind==='remix')?.count||0),comments:comments.rows});
  } catch(e){return NextResponse.json({error:e instanceof Error&&e.message==='DATABASE_NOT_CONFIGURED'?'Social persistence is not configured yet.':'Unable to load social data.'},{status:503});}
}

export async function POST(req: NextRequest) {
  try {
    const body=await req.json(); const address=wallet(body.wallet); const thesisId=String(body.thesisId||'').slice(0,120); const action=body.action;
    if(!thesisId||!['like','remix','follow','comment'].includes(action)) return NextResponse.json({error:'Invalid social action.'},{status:400});
    await ensureProfile(address); await ensureThesis({...body,thesisId});
    if(action==='comment'){const text=String(body.text||'').trim();if(!text||text.length>1000)return NextResponse.json({error:'Comment must be 1–1000 characters.'},{status:400});await query('insert into comments(wallet_address,thesis_id,body) values($1,$2,$3)',[address,thesisId,text]);}
    else if(action==='follow') await query('insert into follows(follower_wallet,thesis_id) values($1,$2) on conflict do nothing',[address,thesisId]);
    else await query('insert into reactions(wallet_address,thesis_id,kind) values($1,$2,$3) on conflict do nothing',[address,thesisId,action]);
    return NextResponse.json({ok:true});
  } catch(e){return NextResponse.json({error:e instanceof Error&&e.message==='DATABASE_NOT_CONFIGURED'?'Social persistence is not configured yet.':e instanceof Error&&e.message==='VALID_WALLET_REQUIRED'?'Connect a valid wallet first.':'Unable to save social action.'},{status:503});}
}
