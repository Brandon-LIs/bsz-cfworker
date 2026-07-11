import HOMEPAGE_HTML from './homepage.js'
import countPage from './countpage.js'

const CLIENT_JS = `(()=>{if(window.busuanziRequestSent)return;window.busuanziRequestSent=true;const u=new URL(document.currentScript.src);fetch(u.protocol+'//'+u.host+'/api',{method:'POST',body:JSON.stringify({url:location.href,referrer:document.referrer})}).then(r=>r.json()).then(r=>{for(const k in r)document.querySelectorAll('#'+k).forEach(e=>e.innerText=r[k])}).catch(e=>console.error('busuanzi error:',e))})();`

const DOMAIN_ALIASES = { 'ac.oopss.top': 'bsz.oopss.top' }

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function visitorId(request) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '0'
  const ua = request.headers.get('User-Agent') || ''
  let h = 0
  const s = ip + '|' + ua
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i)
    h |= 0
  }
  return (h >>> 0).toString(36)
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json;charset=utf-8', ...CORS_HEADERS },
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    // Serve client JS (minified)
    if (method === 'GET' && /^\/(busuanzi(\.min)?\.js|bsz\.js)$/.test(path)) {
      return new Response(CLIENT_JS, {
        headers: {
          'Content-Type': 'application/javascript;charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          ...CORS_HEADERS,
        },
      })
    }

    // API: /api or /api.php (busuanzi v3 compatible)
    if (method === 'POST' && (path === '/api' || path === '/api.php')) {
      return handleApi(request, env, ctx)
    }

    // Homepage
    if (method === 'GET' && path === '/') {
      return new Response(HOMEPAGE_HTML, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      })
    }

    // Site statistics page
    if (method === 'GET' && (path === '/count' || path === '/count.php')) {
      return handleCount(request, env)
    }

    // Badge icon (SVG)
    if (method === 'GET' && path === '/badge') {
      return handleBadge(request, env)
    }

    return json({ error: 'Not found' }, 404)
  },
}

async function handleApi(request, env, ctx) {
  try {
    const body = await request.json()
    const pageUrl = body.url || ''
    if (!pageUrl) return json({ error: 'Missing url' }, 400)

    let page
    try { page = new URL(pageUrl) } catch { return json({ error: 'Invalid url' }, 400) }

    const host = DOMAIN_ALIASES[page.hostname.replace(/^www\./, '')] || page.hostname.replace(/^www\./, '')
    const pagePath = page.pathname + page.search || '/'
    const vid = visitorId(request)
    const kv = env.BUSUANZI
    const now = today()

    const k = {
      site: `s:${host}`,
      page: `p:${host}:${pagePath}`,
      today: `t:${host}:${now}`,
      uvs: `uvs:${host}:${vid}`,
      uvp: `uvp:${host}:${pagePath}:${vid}`,
      uvt: `uvt:${host}:${now}:${vid}`,
      meta: `meta:${host}`,
    }

    const [sRaw, pRaw, tRaw, uvsRaw, uvpRaw, uvtRaw, metaRaw] = await Promise.all([
      kv.get(k.site), kv.get(k.page), kv.get(k.today),
      kv.get(k.uvs), kv.get(k.uvp), kv.get(k.uvt), kv.get(k.meta),
    ])

    let s = sRaw ? JSON.parse(sRaw) : { pv: 0, uv: 0 }
    let p = pRaw ? JSON.parse(pRaw) : { pv: 0, uv: 0 }
    let td = tRaw ? JSON.parse(tRaw) : { pv: 0, uv: 0 }

    s.pv++; p.pv++; td.pv++

    if (uvsRaw === null) { s.uv++ }
    if (uvpRaw === null) { p.uv++ }
    if (uvtRaw === null) { td.uv++ }

    const res = {
      busuanzi_site_pv: s.pv,
      busuanzi_site_uv: s.uv,
      busuanzi_page_pv: p.pv,
      busuanzi_page_uv: p.uv,
      busuanzi_today_pv: td.pv,
      busuanzi_today_uv: td.uv,
    }

    // Write asynchronously — return response immediately
    ctx.waitUntil((async () => {
      const writes = [
        kv.put(k.site, JSON.stringify(s)),
        kv.put(k.page, JSON.stringify(p)),
        kv.put(k.today, JSON.stringify(td)),
      ]
      if (uvsRaw === null) writes.push(kv.put(k.uvs, '1'))
      if (uvpRaw === null) writes.push(kv.put(k.uvp, '1'))
      if (uvtRaw === null) writes.push(kv.put(k.uvt, '1', { expirationTtl: 172800 }))
      if (metaRaw === null) writes.push(kv.put(k.meta, JSON.stringify({ createdAt: new Date().toISOString() })))
      await Promise.all(writes)
    })())

    return json(res)
  } catch (e) {
    return json({ error: 'Internal error' }, 500)
  }
}

async function handleCount(request, env) {
  const url = new URL(request.url)
  const domain = url.searchParams.get('search')
  if (!domain) {
    return new Response('Missing search parameter', { status: 400 })
  }

  const normalized = DOMAIN_ALIASES[domain.replace(/^www\./, '')] || domain.replace(/^www\./, '')
  const kv = env.BUSUANZI
  const now = today()

  const [sRaw, tRaw, metaRaw] = await Promise.all([
    kv.get(`s:${normalized}`),
    kv.get(`t:${normalized}:${now}`),
    kv.get(`meta:${normalized}`),
  ])

  let s = sRaw ? JSON.parse(sRaw) : { pv: 0, uv: 0 }
  let td = tRaw ? JSON.parse(tRaw) : { pv: 0, uv: 0 }

  let meta = { createdAt: null }
  try { if (metaRaw) meta = JSON.parse(metaRaw) } catch {}

  if (!meta.createdAt) {
    meta = { createdAt: new Date().toISOString() }
    await kv.put(`meta:${normalized}`, JSON.stringify(meta)).catch(() => {})
  }

  const html = countPage(normalized, {
    sitePv: s.pv,
    siteUv: s.uv,
    todayPv: td.pv,
    todayUv: td.uv,
    createdAt: new Date(meta.createdAt).toLocaleString('zh-CN'),
  })

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  })
}

async function handleBadge(request, env) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="85" height="20" viewBox="0 0 85 20">
  <rect width="22" height="20" rx="3" fill="#059669"/>
  <rect x="22" width="63" height="20" rx="3" fill="#10b981"/>
  <rect x="22" width="3" height="20" fill="#10b981"/>
  <text x="11" y="14" text-anchor="middle" fill="#fff" font-size="13" font-family="sans-serif">&#x2261;</text>
  <text x="53" y="14" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif" font-weight="500">&#x4E0D;&#x849C;&#x5B50;</text>
</svg>`

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
  })
}
