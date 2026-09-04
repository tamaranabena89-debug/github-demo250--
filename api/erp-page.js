module.exports = async function (req, res) {
  try {
    const upstream = await fetch('https://raw.githubusercontent.com/tamaranabena89-debug/github-demo250--/main/index.html', { cache: 'no-store' });
    if (!upstream.ok) throw new Error(`GitHub returned ${upstream.status}`);
    let html = await upstream.text();

    // Never let the browser depend on an external Supabase CDN.
    html = html.replace(/<script\s+src=["']https?:\/\/[^"']*supabase-js[^"']*["']\s*><\/script>/ig, '<script src="/api/supabase-js.js"></script>');

    // The ERP source must stay inert until the same-origin loader is ready.
    if (!html.includes('id="erp-app-code"')) {
      html = html.replace('<script>\nconst SUPABASE_URL=', '<script id="erp-app-code" type="text/plain">\nconst SUPABASE_URL=');
    }

    if (!html.includes('/api/supabase-js.js')) {
      html = html.replace('</body>', '<script src="/api/supabase-js.js"></script>\n</body>');
    }

    if (!html.includes('ERP SAME-ORIGIN BOOT')) {
      const boot = `\n<script>\n<!-- ERP SAME-ORIGIN BOOT -->\n(function(){\n  function boot(){\n    var source=document.getElementById('erp-app-code');\n    if(!source) return;\n    if(!window.supabase || typeof window.supabase.createClient !== 'function'){ setTimeout(boot,100); return; }\n    var script=document.createElement('script');\n    script.textContent=source.textContent;\n    source.replaceWith(script);\n  }\n  boot();\n})();\n</script>\n`;
      html = html.replace('</body>', boot + '</body>');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(502).send('<!doctype html><html><body style="font-family:Arial;padding:40px"><h2>Markcharles ERP is temporarily unavailable</h2><p>Please refresh the page.</p></body></html>');
  }
};
