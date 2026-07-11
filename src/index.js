import HOMEPAGE_HTML from './homepage.js'

const CLIENT_JS = `(()=>{if(window.busuanziRequestSent)return;window.busuanziRequestSent=true;const u=new URL(document.currentScript.src);fetch(u.protocol+'//'+u.host+'/api',{method:'POST',body:JSON.stringify({url:location.href,referrer:document.referrer})}).then(r=>r.json()).then(r=>{for(const k in r)document.querySelectorAll('#'+k).forEach(e=>e.innerText=r[k])}).catch(e=>console.error('busuanzi error:',e))})();`

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
  async fetch(request, env) {
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
      return handleApi(request, env)
    }

    // Homepage
    if (method === 'GET' && path === '/') {
      return new Response(HOMEPAGE_HTML, {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      })
    }

    return json({ error: 'Not found' }, 404)
  },
}

async function handleApi(request, env) {
  try {
    const body = await request.json()
    const pageUrl = body.url || ''
    if (!pageUrl) {
      return json({ error: 'Missing url' }, 400)
    }

    let page
    try {
      page = new URL(pageUrl)
    } catch {
      return json({ error: 'Invalid url' }, 400)
    }

    const host = page.hostname
    const pagePath = page.pathname + page.search || '/'
    const vid = visitorId(request)
    const kv = env.BUSUANZI

    const now = today()
    const keys = {
      sitePv: `spv:${host}`,
      siteUv: `suv:${host}`,
      pagePv: `ppv:${host}:${pagePath}`,
      pageUv: `puv:${host}:${pagePath}`,
      todayPv: `tpv:${host}:${now}`,
      todayUv: `tuv:${host}:${now}`,
      uvSite: `uvs:${host}:${vid}`,
      uvPage: `uvp:${host}:${pagePath}:${vid}`,
      uvToday: `uvt:${host}:${now}:${vid}`,
    }

    const [
      sitePvRaw, siteUvRaw,
      pagePvRaw, pageUvRaw,
      todayPvRaw, todayUvRaw,
      uvSiteRaw, uvPageRaw, uvTodayRaw,
    ] = await Promise.all([
      kv.get(keys.sitePv),
      kv.get(keys.siteUv),
      kv.get(keys.pagePv),
      kv.get(keys.pageUv),
      kv.get(keys.todayPv),
      kv.get(keys.todayUv),
      kv.get(keys.uvSite),
      kv.get(keys.uvPage),
      kv.get(keys.uvToday),
    ])

    let sitePv = Number(sitePvRaw) || 0
    let siteUv = Number(siteUvRaw) || 0
    let pagePv = Number(pagePvRaw) || 0
    let pageUv = Number(pageUvRaw) || 0
    let todayPv = Number(todayPvRaw) || 0
    let todayUv = Number(todayUvRaw) || 0

    sitePv++
    pagePv++
    todayPv++

    const isNewSite = uvSiteRaw === null
    const isNewPage = uvPageRaw === null
    const isNewToday = uvTodayRaw === null

    if (isNewSite) siteUv++
    if (isNewPage) pageUv++
    if (isNewToday) todayUv++

    const writes = [
      kv.put(keys.sitePv, String(sitePv)),
      kv.put(keys.siteUv, String(siteUv)),
      kv.put(keys.pagePv, String(pagePv)),
      kv.put(keys.pageUv, String(pageUv)),
      kv.put(keys.todayPv, String(todayPv)),
      kv.put(keys.todayUv, String(todayUv)),
    ]

    if (isNewSite) writes.push(kv.put(keys.uvSite, '1'))
    if (isNewPage) writes.push(kv.put(keys.uvPage, '1'))
    if (isNewToday) writes.push(kv.put(keys.uvToday, '1', { expirationTtl: 172800 }))

    await Promise.all(writes)

    return json({
      busuanzi_site_pv: sitePv,
      busuanzi_site_uv: siteUv,
      busuanzi_page_pv: pagePv,
      busuanzi_page_uv: pageUv,
      busuanzi_today_pv: todayPv,
      busuanzi_today_uv: todayUv,
    })
  } catch (e) {
    return json({ error: 'Internal error' }, 500)
  }
}
