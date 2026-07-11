const HOMEPAGE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>不蒜子 - 轻量极简网站访问统计</title>
<style>
  :root { --accent: #10b981; --accent-light: #d1fae5; --bg: #f9fafb; --card: #fff; --text: #1f2937; --muted: #6b7280; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }
  .container { max-width: 800px; margin: 0 auto; padding: 0 24px; }

  header { text-align: center; padding: 60px 0 40px; }
  header h1 { font-size: 3rem; font-weight: 800; letter-spacing: -1px; }
  header h1 span { color: var(--accent); }
  header p { color: var(--muted); font-size: 1.15rem; margin-top: 8px; }
  .subtitle { display: flex; justify-content: center; gap: 8px; color: var(--muted); font-size: 0.9rem; margin-top: 4px; }

  .stats-row { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; margin-top: 24px; }
  .stat-card { background: var(--card); border-radius: 12px; padding: 16px 28px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.08); min-width: 120px; }
  .stat-card .num { font-size: 1.8rem; font-weight: 700; color: var(--accent); }
  .stat-card .label { font-size: 0.8rem; color: var(--muted); margin-top: 2px; }

  .btn { display: inline-block; background: var(--accent); color: #fff; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: opacity .2s; }
  .btn:hover { opacity: .85; }
  .btn-outline { background: transparent; color: var(--accent); border: 2px solid var(--accent); }

  section { background: var(--card); border-radius: 16px; padding: 40px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  section h2 { font-size: 1.5rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  section h2::before { content: ''; display: inline-block; width: 4px; height: 24px; background: var(--accent); border-radius: 2px; }
  section h3 { font-size: 1.1rem; margin: 20px 0 8px; color: #374151; }
  section p { color: #4b5563; margin-bottom: 12px; }

  pre { background: #1e293b; color: #e2e8f0; border-radius: 10px; padding: 20px; overflow-x: auto; font-size: 0.85rem; line-height: 1.6; margin: 12px 0; }
  code { font-family: "JetBrains Mono","Fira Code",monospace; }
  pre .tag { color: #f472b6; }
  pre .attr { color: #a78bfa; }
  pre .str { color: #34d399; }
  pre .cmt { color: #64748b; }
  pre .kw { color: #60a5fa; }

  .arch-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 16px; margin: 16px 0; }
  .arch-item { background: var(--accent-light); border-radius: 10px; padding: 20px; text-align: center; }
  .arch-item .icon { font-size: 2rem; margin-bottom: 8px; }
  .arch-item .title { font-weight: 600; font-size: 0.95rem; }
  .arch-item .desc { font-size: 0.85rem; color: #374151; margin-top: 4px; }

  footer { text-align: center; padding: 40px 0; color: var(--muted); font-size: 0.85rem; }
  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 600px) {
    header h1 { font-size: 2rem; }
    section { padding: 24px; }
    .stats-row { gap: 12px; }
    .stat-card { min-width: 100px; padding: 12px 16px; }
    .stat-card .num { font-size: 1.4rem; }
  }
</style>
</head>
<body>

<div class="container">
  <header>
    <h1>&#x1F9C4; <span>不蒜子</span></h1>
    <p>轻量极简的网站访问量统计工具 &middot; Cloudflare Workers 版</p>
    <div class="subtitle">
      <span>两行代码搞定计数</span>
      <span>&middot;</span>
      <span>永久免费</span>
      <span>&middot;</span>
      <span>全球加速</span>
    </div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="num" id="busuanzi_site_pv">--</div>
        <div class="label">本站总访问量</div>
      </div>
      <div class="stat-card">
        <div class="num" id="busuanzi_site_uv">--</div>
        <div class="label">本站总访客数</div>
      </div>
      <div class="stat-card">
        <div class="num" id="busuanzi_page_pv">--</div>
        <div class="label">本页阅读量</div>
      </div>
    </div>
  </header>

  <section>
    <h2>简介</h2>
    <p>不蒜子是一款轻量极简的网站访问量统计工具。通过引入一段脚本和一个 HTML 标签，即可实现网站访问量（PV）、访客数（UV）和页面阅读量的实时统计。</p>
    <p>本项目使用 <strong>Cloudflare Workers + KV</strong> 作为后端，完全兼容不蒜子 v3 API，无需注册、无需数据库，部署即用。</p>
  </section>

  <section>
    <h2>工作原理</h2>
    <p>当用户访问你的网站时，不蒜子通过以下流程完成计数：</p>
    <div class="arch-grid">
      <div class="arch-item">
        <div class="icon">&#x1F4C4;</div>
        <div class="title">1. 加载脚本</div>
        <div class="desc">浏览器异步加载 <code>busuanzi.min.js</code></div>
      </div>
      <div class="arch-item">
        <div class="icon">&#x1F4E1;</div>
        <div class="title">2. 发送请求</div>
        <div class="desc">脚本 POST 当前页面 URL 到 API</div>
      </div>
      <div class="arch-item">
        <div class="icon">&#x2699;&#xFE0F;</div>
        <div class="title">3. 更新计数</div>
        <div class="desc">Worker 解析请求，原子更新 KV 计数器</div>
      </div>
      <div class="arch-item">
        <div class="icon">&#x1F4CA;</div>
        <div class="title">4. 渲染结果</div>
        <div class="desc">API 返回 JSON，脚本更新对应 span 内容</div>
      </div>
    </div>
    <h3>计数器类型</h3>
    <pre><span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_site_pv"</span><span class="tag">&gt;</span>...<span class="tag">&lt;/span&gt;</span>  <span class="cmt">&lt;!-- 站点总 PV --&gt;</span>
<span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_site_uv"</span><span class="tag">&gt;</span>...<span class="tag">&lt;/span&gt;</span>  <span class="cmt">&lt;!-- 站点总 UV --&gt;</span>
<span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_page_pv"</span><span class="tag">&gt;</span>...<span class="tag">&lt;/span&gt;</span>  <span class="cmt">&lt;!-- 本页 PV --&gt;</span>
<span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_page_uv"</span><span class="tag">&gt;</span>...<span class="tag">&lt;/span&gt;</span>  <span class="cmt">&lt;!-- 本页 UV --&gt;</span>
<span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_today_pv"</span><span class="tag">&gt;</span>...<span class="tag">&lt;/span&gt;</span>  <span class="cmt">&lt;!-- 今日 PV --&gt;</span>
<span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_today_uv"</span><span class="tag">&gt;</span>...<span class="tag">&lt;/span&gt;</span>  <span class="cmt">&lt;!-- 今日 UV --&gt;</span></pre>
    <h3>UV 去重策略</h3>
    <p>使用 <code>CF-Connecting-IP</code>（访客真实 IP）+ <code>User-Agent</code> 联合哈希生成访问者标识，在 KV 中记录去重键，确保同一访客只计数一次。今日 UV 键设置 48 小时自动过期，不占空间。</p>
  </section>

  <section>
    <h2>快速开始</h2>
    <h3>1. 引入脚本</h3>
    <p>在网站 <code>&lt;head&gt;</code> 或 <code>&lt;body&gt;</code> 末尾添加：</p>
    <pre><span class="tag">&lt;script </span><span class="attr">src=</span><span class="str">"https://bsz.oopss.top/busuanzi.min.js"</span> <span class="attr">defer</span><span class="tag">&gt;&lt;/script&gt;</span></pre>
    <h3>2. 放置标签</h3>
    <p>在需要显示计数的地方放置以下任意 span：</p>
    <pre><span class="cmt">&lt;!-- 站点统计 --&gt;</span>
本站总访问量 <span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_site_pv"</span><span class="tag">&gt;</span>加载中...<span class="tag">&lt;/span&gt;</span> 次
本站总访客数 <span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_site_uv"</span><span class="tag">&gt;</span>加载中...<span class="tag">&lt;/span&gt;</span> 人

<span class="cmt">&lt;!-- 页面统计 --&gt;</span>
本页总阅读量 <span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_page_pv"</span><span class="tag">&gt;</span>加载中...<span class="tag">&lt;/span&gt;</span> 次
本页总访客数 <span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_page_uv"</span><span class="tag">&gt;</span>加载中...<span class="tag">&lt;/span&gt;</span> 人

<span class="cmt">&lt;!-- 今日统计 --&gt;</span>
今日总访问量 <span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_today_pv"</span><span class="tag">&gt;</span>加载中...<span class="tag">&lt;/span&gt;</span> 次
今日总访客数 <span class="tag">&lt;span</span> <span class="attr">id=</span><span class="str">"busuanzi_today_uv"</span><span class="tag">&gt;</span>加载中...<span class="tag">&lt;/span&gt;</span> 人</pre>
    <h3>3. 完成 &#x2705;</h3>
    <p>刷新页面即可看到计数。无需注册、无需配置数据库、无需维护服务器。</p>
  </section>

  <section>
    <h2>自行部署</h2>
    <p>如果你想部署自己的实例，只需几步：</p>
    <pre><span class="cmt"># 1. 克隆仓库</span>
git clone https://github.com/yourname/busuanzi-worker
<span class="kw">cd</span> busuanzi-worker

<span class="cmt"># 2. 创建 KV namespace</span>
npx wrangler kv:namespace create BUSUANZI
<span class="cmt"># 将输出的 id 填入 wrangler.toml</span>

<span class="cmt"># 3. 部署</span>
npx wrangler deploy</pre>
    <p>部署后，将脚本地址改为你的 Worker 地址即可。</p>
  </section>

  <section>
    <h2>API 参考</h2>
    <h3>POST /api</h3>
    <p>请求体：</p>
    <pre>{
  <span class="str">"url"</span>: <span class="str">"https://example.com/page"</span>,
  <span class="str">"referrer"</span>: <span class="str">"https://google.com"</span>
}</pre>
    <p>响应：</p>
    <pre>{
  <span class="str">"busuanzi_site_pv"</span>: 1024,
  <span class="str">"busuanzi_site_uv"</span>: 512,
  <span class="str">"busuanzi_page_pv"</span>: 42,
  <span class="str">"busuanzi_page_uv"</span>: 30,
  <span class="str">"busuanzi_today_pv"</span>: 88,
  <span class="str">"busuanzi_today_uv"</span>: 66
}</pre>
  </section>

  <section>
    <h2>技术栈</h2>
    <div class="arch-grid">
      <div class="arch-item">
        <div class="icon">&#x2601;&#xFE0F;</div>
        <div class="title">Cloudflare Workers</div>
        <div class="desc">全球边缘计算，毫秒级响应</div>
      </div>
      <div class="arch-item">
        <div class="icon">&#x1F5C2;&#xFE0F;</div>
        <div class="title">Workers KV</div>
        <div class="desc">全球 KV 存储，极速读写</div>
      </div>
      <div class="arch-item">
        <div class="icon">&#x1F4E6;</div>
        <div class="title">零依赖</div>
        <div class="desc">纯 JS，无需第三方库</div>
      </div>
    </div>
  </section>

  <footer>
    <p>&#x1F9C4; 不蒜子 &middot; 基于 Cloudflare Workers 构建</p>
    <p><a href="https://github.com/Brandon-LIs/bsz-cfworker">GitHub</a></p>
  </footer>
</div>

<script src="/busuanzi.min.js" defer></script>
</body>
</html>`

export default HOMEPAGE_HTML
