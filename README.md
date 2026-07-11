<div align="center">
  <h1>🧄 不蒜子 · busuanzi-worker</h1>
  <p>轻量极简的网站访问量统计 · Cloudflare Workers 版</p>
  <p>两行代码搞定计数 · 永久免费 · 全球加速</p>
</div>

<div align="center">

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Brandon-LIs/bsz-cfworker)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## ✨ 功能

| 指标 | 说明 | Span ID |
|------|------|---------|
| 📊 站点总访问量 | 网站所有页面的累计浏览量 | `busuanzi_site_pv` |
| 👤 站点总访客数 | 网站的独立访客总数 | `busuanzi_site_uv` |
| 📄 本页阅读量 | 当前页面的浏览量 | `busuanzi_page_pv` |
| 👥 本页访客数 | 当前页面的独立访客数 | `busuanzi_page_uv` |
| 📅 今日总访问量 | 当天所有页面的浏览量 | `busuanzi_today_pv` |
| 🆕 今日总访客数 | 当天的独立访客数 | `busuanzi_today_uv` |

## 🔧 原理

```
用户浏览器                    Cloudflare Edge                   Workers KV
    │                              │                              │
    ├── 加载 busuanzi.min.js ──────►                              │
    │                              │                              │
    ├── POST /api {url} ──────────►                              │
    │                              ├── 读取/写入计数器 ──────────►│
    │                              ◄── 返回结果 ─────────────────┤
    ◄── JSON 响应 ────────────────┤                              │
    │                              │                              │
    ├── 更新 span.innerText ──────►                              │
```

- **PV 计数**：每次页面加载 +1
- **UV 去重**：基于 `CF-Connecting-IP` + `User-Agent` 哈希生成访客 ID，每个访客只计一次
- **存储**：Workers KV 全球分布式存储，毫秒级读写
- **今日计数**：按日期分片，今日 UV 键设 48h TTL 自动过期

## 🚀 快速使用

在你的网页中引入脚本和标签即可：

```html
<script src="https://bsz.oopss.top/busuanzi.min.js" defer></script>

本站总访问量 <span id="busuanzi_site_pv">加载中...</span> 次
本站总访客数 <span id="busuanzi_site_uv">加载中...</span> 人
本页总阅读量 <span id="busuanzi_page_pv">加载中...</span> 次
本页总访客数 <span id="busuanzi_page_uv">加载中...</span> 人
今日总访问量 <span id="busuanzi_today_pv">加载中...</span> 次
今日总访客数 <span id="busuanzi_today_uv">加载中...</span> 人
```

> [!TIP]
> 不蒜子会自动扫描页面上所有带 `busuanzi_*` ID 的元素并填充计数。
> 你无需写任何 JavaScript，只需要 HTML 标签。

## 🛠️ 自行部署

### 前置条件

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare 账号](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)（通过 npm 安装）

### 部署步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Brandon-LIs/bsz-cfworker.git
cd busuanzi-worker

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare
npx wrangler login

# 4. 创建 KV Namespace
npx wrangler kv namespace create BUSUANZI
# 将输出的 id 填入 wrangler.toml 的 id 字段

# 5. 部署
npm run deploy
```

### 更新 wrangler.toml

```toml
name = "busuanzi"
main = "src/index.js"
compatibility_date = "2025-04-01"

[[kv_namespaces]]
binding = "BUSUANZI"
id = "你的KV_NAMESPACE_ID"  # 替换为上一步创建的值
```

## 📡 API

### `POST /api`

与不蒜子 v3 完全兼容。

**请求体：**
```json
{
  "url": "https://example.com/page",
  "referrer": "https://google.com"
}
```

**响应：**
```json
{
  "busuanzi_site_pv": 1024,
  "busuanzi_site_uv": 512,
  "busuanzi_page_pv": 42,
  "busuanzi_page_uv": 30,
  "busuanzi_today_pv": 88,
  "busuanzi_today_uv": 66
}
```

## 📁 项目结构

```
busuanzi-worker/
├── src/
│   ├── index.js        # Worker 主入口，路由 + API 处理
│   ├── homepage.js     # 首页 HTML
│   └── client.js       # 客户端 JavaScript（源码，未压缩）
├── wrangler.toml       # Cloudflare Workers 配置
├── package.json
└── README.md
```

## ⚙️ 技术栈

- **运行时**：[Cloudflare Workers](https://workers.cloudflare.com/) — 全球边缘计算
- **存储**：[Workers KV](https://developers.cloudflare.com/kv/) — 全球键值存储
- **客户端**：纯 JavaScript，零依赖，~400 字节

## 📄 License

MIT
