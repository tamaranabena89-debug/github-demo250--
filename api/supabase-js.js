module.exports = async function (req, res) {
  const sources = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js',
    'https://unpkg.com/@supabase/supabase-js@2.116.0/dist/umd/supabase.js'
  ];
  let lastError = null;
  for (const url of sources) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Upstream returned ${r.status}`);
      const js = await r.text();
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.status(200).send(js);
    } catch (e) { lastError = e; }
  }
  return res.status(502).json({ error: 'Unable to load Supabase browser library', detail: String(lastError || '') });
};
