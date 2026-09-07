export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
    if (url.pathname === '/api/health') return json({ ok: true, service: 'pingo-chic-api' });
    if (!env.DB) return json({ error: 'D1 database not configured' }, 503);

    if (url.pathname === '/api/catalog' && method === 'GET') {
      const { results: productRows } = await env.DB.prepare(`
        SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC
      `).all();
      const { results: variantRows } = await env.DB.prepare(`
        SELECT id, product_id, sku, size, color, stock, active
        FROM product_variants
        WHERE active = 1
        ORDER BY product_id, color, size
      `).all();
      const variantsByProduct = new Map();
      for (const variant of variantRows) {
        if (!variantsByProduct.has(variant.product_id)) variantsByProduct.set(variant.product_id, []);
        variantsByProduct.get(variant.product_id).push(variant);
      }
      return json({ products: productRows.map(row => ({ ...normalizeProduct(row), variants: variantsByProduct.get(row.id) || [] })) });
    }

    if (url.pathname === '/api/products' && method === 'GET') {
      const admin = url.searchParams.get('admin') === '1';
      if (admin && !isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const where = admin ? '' : 'WHERE p.active = 1';
      const { results } = await env.DB.prepare(`
        SELECT p.*, COALESCE(SUM(CASE WHEN v.active = 1 THEN v.stock ELSE 0 END),0) AS stock_total
        FROM products p
        LEFT JOIN product_variants v ON v.product_id = p.id
        ${where}
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `).all();
      return json({ products: results.map(normalizeProduct) });
    }

    const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);
    if (productMatch && method === 'GET') {
      const id = Number(productMatch[1]);
      const product = await env.DB.prepare('SELECT * FROM products WHERE id = ? AND active = 1').bind(id).first();
      if (!product) return json({ error: 'Product not found' }, 404);
      const { results: variants } = await env.DB.prepare('SELECT id, sku, size, color, stock, active FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY color, size').bind(id).all();
      return json({ product: { ...normalizeProduct(product), variants } });
    }

    if (url.pathname === '/api/admin/products' && method === 'POST') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const body = await request.json();
      const error = validateProduct(body);
      if (error) return json({ error }, 400);
      const result = await env.DB.prepare(`
        INSERT INTO products (slug,name,description,theme,category,price_cents,old_price_cents,badge,rating,reviews_count,images_json,details_json,active)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        body.slug, body.name, body.description || '', body.theme, body.category,
        moneyToCents(body.price), nullableMoneyToCents(body.oldPrice), body.badge || null,
        Number(body.rating || 5), Number(body.reviewsCount || 0), JSON.stringify(body.images || []),
        JSON.stringify(body.details || []), body.active === false ? 0 : 1
      ).run();
      return json({ ok: true, id: result.meta.last_row_id }, 201);
    }

    const adminProductMatch = url.pathname.match(/^\/api\/admin\/products\/(\d+)$/);
    if (adminProductMatch && method === 'PUT') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const id = Number(adminProductMatch[1]);
      const body = await request.json();
      const error = validateProduct(body);
      if (error) return json({ error }, 400);
      await env.DB.prepare(`
        UPDATE products SET slug=?,name=?,description=?,theme=?,category=?,price_cents=?,old_price_cents=?,badge=?,rating=?,reviews_count=?,images_json=?,details_json=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?
      `).bind(
        body.slug, body.name, body.description || '', body.theme, body.category,
        moneyToCents(body.price), nullableMoneyToCents(body.oldPrice), body.badge || null,
        Number(body.rating || 5), Number(body.reviewsCount || 0), JSON.stringify(body.images || []),
        JSON.stringify(body.details || []), body.active === false ? 0 : 1, id
      ).run();
      return json({ ok: true });
    }

    if (adminProductMatch && method === 'DELETE') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
      const id = Number(adminProductMatch[1]);
      await env.DB.prepare('UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
  }
};

function normalizeProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    theme: row.theme,
    category: row.category,
    price: Number(row.price_cents || 0) / 100,
    oldPrice: row.old_price_cents == null ? null : Number(row.old_price_cents) / 100,
    badge: row.badge,
    rating: Number(row.rating || 0),
    reviewsCount: Number(row.reviews_count || 0),
    images: parseJson(row.images_json, []),
    details: parseJson(row.details_json, []),
    active: Boolean(row.active),
    stockTotal: row.stock_total == null ? undefined : Number(row.stock_total)
  };
}

function validateProduct(body) {
  if (!body || typeof body !== 'object') return 'Invalid payload';
  if (!body.name?.trim()) return 'Name is required';
  if (!body.slug?.trim()) return 'Slug is required';
  if (!['fem','masc','unissex'].includes(body.theme)) return 'Invalid theme';
  if (!body.category?.trim()) return 'Category is required';
  if (!Number.isFinite(Number(body.price)) || Number(body.price) <= 0) return 'Invalid price';
  return null;
}

function moneyToCents(value) { return Math.round(Number(value) * 100); }
function nullableMoneyToCents(value) { return value === '' || value == null ? null : moneyToCents(value); }
function parseJson(value, fallback) { try { return JSON.parse(value || ''); } catch { return fallback; } }
function isAdmin(request, env) {
  const auth = request.headers.get('authorization') || '';
  return Boolean(env.ADMIN_TOKEN) && auth === `Bearer ${env.ADMIN_TOKEN}`;
}
function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization'
  };
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...corsHeaders() }
  });
}
