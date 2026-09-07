export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'pingo-chic-api' });
    }

    if (url.pathname === '/api/products' && request.method === 'GET') {
      if (!env.DB) return json({ error: 'D1 database not configured' }, 503);
      const { results } = await env.DB.prepare(`
        SELECT id, slug, name, description, theme, category,
               price_cents, old_price_cents, active
        FROM products
        WHERE active = 1
        ORDER BY created_at DESC
      `).all();
      return json({ products: results });
    }

    return json({ error: 'Not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
