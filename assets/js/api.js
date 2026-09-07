const STORAGE_KEY = 'pingoChicApiUrl';

export function getApiBase(){
  const configured = (window.PINGO_CHIC_API_URL || localStorage.getItem(STORAGE_KEY) || '').trim();
  return configured.replace(/\/$/,'');
}

export function setApiBase(url){
  const clean = String(url || '').trim().replace(/\/$/,'');
  if(clean) localStorage.setItem(STORAGE_KEY, clean);
  else localStorage.removeItem(STORAGE_KEY);
  return clean;
}

export async function fetchCatalog(){
  const base = getApiBase();
  if(!base) return null;
  const response = await fetch(`${base}/api/catalog`, {headers:{accept:'application/json'}});
  if(!response.ok) throw new Error(`API indisponível (${response.status})`);
  const data = await response.json();
  return Array.isArray(data.products) ? data.products.map(normalizeProduct) : [];
}

function normalizeProduct(product){
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const colors = [...new Set(variants.map(v=>v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map(v=>v.size).filter(Boolean))];
  const stock = {};
  for(const variant of variants){
    if(variant.color && variant.size) stock[`${variant.color}|${variant.size}`] = Number(variant.stock || 0);
  }
  return {
    ...product,
    price:Number(product.price || 0),
    oldPrice:product.oldPrice == null ? null : Number(product.oldPrice),
    rating:Number(product.rating || 0),
    reviews:Number(product.reviewsCount ?? product.reviews ?? 0),
    colors,
    sizes,
    stock,
    icon:product.icon || (product.theme === 'masc' ? '🧢' : '🎀'),
    images:Array.isArray(product.images) ? product.images : [],
    details:Array.isArray(product.details) ? product.details : []
  };
}
