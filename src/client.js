// This is inlined into the worker response so users can serve it directly.
// Usage: <script src="https://your-worker.workers.dev/busuanzi.min.js" defer></script>
//
// It scans the page for elements with busuanzi_* IDs and fetches live counts.
// Complements the original busuanzi v3 HTML snippet:
//   <span id="busuanzi_site_pv">加载中...</span>
//   <span id="busuanzi_site_uv">加载中...</span>
//   <span id="busuanzi_page_pv">加载中...</span>
//   <span id="busuanzi_page_uv">加载中...</span>
//   <span id="busuanzi_today_pv">加载中...</span>
//   <span id="busuanzi_today_uv">加载中...</span>

(() => {
  if (window.busuanziRequestSent) return;
  window.busuanziRequestSent = true;

  const u = new URL(document.currentScript.src);
  const api = u.protocol + '//' + u.host + '/api';

  fetch(api, {
    method: 'POST',
    body: JSON.stringify({
      url: location.href,
      referrer: document.referrer
    })
  })
    .then(r => r.json())
    .then(r => {
      for (const k in r) {
        document.querySelectorAll('#' + k).forEach(el => {
          el.innerText = r[k];
        });
      }
    })
    .catch(e => console.error('busuanzi error:', e));
})();
