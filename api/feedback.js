import { put, list, get } from '@vercel/blob';

const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

export async function POST(request) {
  let d;
  try { d = await request.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const item = {
    t: new Date().toISOString(),
    diff: str(d.diff, 8),
    fun: Math.max(0, Math.min(5, Number(d.fun) || 0)),
    msg: str(d.msg, 400),
    name: str(d.name, 30),
    opp: str(d.opp, 30),
    won: Boolean(d.won),
    hero: str(d.hero, 4),
    ver: str(d.ver, 20),
  };
  if (!item.diff && !item.msg && !item.fun) return Response.json({ ok: false }, { status: 400 });
  const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  await put('feedback/' + id + '.json', JSON.stringify(item), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
  return Response.json({ ok: true });
}

export async function GET(request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!process.env.FEEDBACK_KEY || key !== process.env.FEEDBACK_KEY) {
    return new Response('Forbidden', { status: 403 });
  }
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix: 'feedback/', cursor, limit: 1000 });
    for (const b of page.blobs) {
      const r = await get(b.pathname, { access: 'private' });
      if (r && r.statusCode === 200) {
        try { out.push(JSON.parse(await new Response(r.stream).text())); } catch {}
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  out.sort((a, b) => (a.t < b.t ? 1 : -1));
  return Response.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
