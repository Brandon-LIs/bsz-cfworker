function countPage(domain, stats) {
  const { sitePv, siteUv, todayPv, todayUv, createdAt } = stats

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>站点 ${domain} 的统计信息 - 不蒜子</title>
<style>
  :root { --accent: #10b981; --accent-light: #d1fae5; --bg: #f9fafb; --card: #fff; --text: #1f2937; --muted: #6b7280; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }
  .container { max-width: 720px; margin: 0 auto; padding: 0 24px; }

  header { text-align: center; padding: 48px 0 32px; }
  header h1 { font-size: 2.2rem; font-weight: 800; }
  header h1 span { color: var(--accent); }
  header p { color: var(--muted); margin-top: 4px; }

  .card { background: var(--card); border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  .card h2 { font-size: 1.2rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .card h2::before { content: ''; display: inline-block; width: 4px; height: 20px; background: var(--accent); border-radius: 2px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { padding: 12px 16px; background: var(--bg); border-radius: 10px; }
  .info-item .label { font-size: 0.8rem; color: var(--muted); }
  .info-item .value { font-size: 1.15rem; font-weight: 600; margin-top: 2px; }
  .info-item .value.num { color: var(--accent); font-size: 1.4rem; }

  .stat-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .stat-card { background: var(--bg); border-radius: 12px; padding: 20px; text-align: center; }
  .stat-card .num { font-size: 2rem; font-weight: 700; color: var(--accent); }
  .stat-card .label { font-size: 0.85rem; color: var(--muted); margin-top: 4px; }
  .stat-card .sub { font-size: 0.75rem; color: var(--muted); }

  pre { background: #1e293b; color: #e2e8f0; border-radius: 10px; padding: 16px 20px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5; margin: 8px 0; }
  .tag { color: #f472b6; }
  .attr { color: #a78bfa; }
  .str { color: #34d399; }

  .badge-preview { display: flex; justify-content: center; padding: 16px 0; }
  .badge { display: inline-flex; align-items: center; gap: 6px; background: var(--accent); color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-decoration: none; transition: opacity .2s; }
  .badge:hover { opacity: .85; }

  footer { text-align: center; padding: 40px 0; color: var(--muted); font-size: 0.85rem; }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 600px) {
    header h1 { font-size: 1.5rem; }
    .info-grid, .stat-cards { grid-template-columns: 1fr; }
    .card { padding: 20px; }
  }
</style>
</head>
<body>

<div class="container">
  <header>
    <h1>&#x1F9C4; <span>不蒜子</span></h1>
    <p>站点统计信息</p>
  </header>

  <div class="card">
    <h2>站点信息</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">站点域名</div>
        <div class="value">${domain}</div>
      </div>
      <div class="info-item">
        <div class="label">接入时间</div>
        <div class="value">${createdAt}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>访问统计</h2>
    <div class="stat-cards">
      <div class="stat-card">
        <div class="num">${todayPv}</div>
        <div class="label">今日总访问量</div>
        <div class="sub">次</div>
      </div>
      <div class="stat-card">
        <div class="num">${todayUv}</div>
        <div class="label">今日总访客数</div>
        <div class="sub">人</div>
      </div>
      <div class="stat-card">
        <div class="num">${sitePv}</div>
        <div class="label">站点总访问量</div>
        <div class="sub">次</div>
      </div>
      <div class="stat-card">
        <div class="num">${siteUv}</div>
        <div class="label">站点总访客数</div>
        <div class="sub">人</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>图标代码</h2>
    <p style="color:var(--muted);font-size:0.9rem;margin-bottom:12px;">将以下代码添加到你的网页中，显示不蒜子统计图标：</p>
    <pre><span class="tag">&lt;a</span> <span class="attr">href=</span><span class="str">"https://bsz.oopss.top/count?search=${domain}"</span> <span class="attr">title=</span><span class="str">"不蒜子统计"</span> <span class="attr">target=</span><span class="str">"_blank"</span><span class="tag">&gt;</span>
    <span class="tag">&lt;img</span> <span class="attr">style=</span><span class="str">"width:85px;height:25px;"</span> <span class="attr">src=</span><span class="str">"https://bsz.oopss.top/badge"</span><span class="tag">&gt;</span>
<span class="tag">&lt;/a&gt;</span></pre>
    <div class="badge-preview">
      <a class="badge" href="/count?search=${domain}" target="_blank">
        &#x1F9C4; 不蒜子统计
      </a>
    </div>
  </div>

  <footer>
    <p>&#x1F9C4; 不蒜子 &middot; 基于 Cloudflare Workers 构建</p>
    <p><a href="https://github.com/Brandon-LIs/bsz-cfworker">GitHub</a></p>
  </footer>
</div>

</body>
</html>`
}

export default countPage
