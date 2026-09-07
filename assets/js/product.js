import { getProduct, getVariantStock, formatBRL, loadLiveProducts } from './products.js';
import { addToCart, getCartSummary } from './cart.js';

const params = new URLSearchParams(location.search);
let product = getProduct(params.get('id') || 1);
const favoritesKey = 'pingoChicFavorites';
let selectedColor = null;
let selectedSize = null;

const $ = selector => document.querySelector(selector);
const toast = message => {const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2200);};
function favorites(){try{return JSON.parse(localStorage.getItem(favoritesKey)||'[]');}catch{return []}}
function isFavorite(){return product ? favorites().includes(product.id) : false}
function toggleFavorite(){if(!product)return;const list=favorites();const index=list.indexOf(product.id);if(index>=0)list.splice(index,1);else list.push(product.id);localStorage.setItem(favoritesKey,JSON.stringify(list));renderFavorite();toast(index>=0?'Removido dos favoritos':'Salvo nos favoritos ♡');}
function renderFavorite(){const active=isFavorite();['#favoriteTop','#favoriteProduct'].forEach(sel=>{const el=$(sel);if(!el)return;el.classList.toggle('active',active);el.textContent=active?'♥':'♡';});}
function updateCartCount(){ $('#cartCount').textContent=getCartSummary().count; }
function renderChoices(){
  const colorRoot=$('#colorChoices');
  colorRoot.innerHTML=(product.colors||[]).map(color=>`<button class="choice ${color===selectedColor?'active':''}" data-color="${color}">${color}</button>`).join('');
  colorRoot.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>{selectedColor=btn.dataset.color;renderChoices();updateVariant();}));
  const sizeRoot=$('#sizeChoices');
  sizeRoot.innerHTML=(product.sizes||[]).map(size=>{const stock=selectedColor?getVariantStock(product,selectedColor,size):1;return `<button class="choice ${size===selectedSize?'active':''}" data-size="${size}" ${stock<=0?'disabled':''}>${size}</button>`;}).join('');
  if(selectedColor && selectedSize && getVariantStock(product,selectedColor,selectedSize)<=0){selectedSize=(product.sizes||[]).find(size=>getVariantStock(product,selectedColor,size)>0)||null;}
  sizeRoot.querySelectorAll('[data-size]:not(:disabled)').forEach(btn=>btn.addEventListener('click',()=>{selectedSize=btn.dataset.size;renderChoices();updateVariant();}));
  $('#selectedColor').textContent=selectedColor||'Selecione';
}
function updateVariant(){const stock=selectedColor&&selectedSize?getVariantStock(product,selectedColor,selectedSize):0;const stockLine=$('#stockLine');stockLine.className='stock-line '+(stock===0?'out':stock<=3?'low':'ok');stockLine.textContent=stock===0?'Variação indisponível':stock<=3?`Últimas ${stock} unidades disponíveis`:`Em estoque • ${stock} unidades`;$('#qtyInput').max=Math.max(stock,1);$('#addProduct').disabled=stock<=0;}
function renderGallery(){const items=(product.images&&product.images.length)?product.images:[product.icon,'✨','🧵','📦'];$('#galleryThumbs').innerHTML=items.map((item,i)=>`<button class="gallery-thumb ${i===0?'active':''}" data-index="${i}">${item.startsWith?.('http')?`<img src="${item}" alt="">`:item}</button>`).join('');$('#galleryThumbs').querySelectorAll('.gallery-thumb').forEach(btn=>btn.addEventListener('click',()=>{const item=items[Number(btn.dataset.index)];const main=$('#mainIcon');if(item.startsWith?.('http'))main.innerHTML=`<img src="${item}" alt="${product.name}">`;else main.textContent=item;document.querySelectorAll('.gallery-thumb').forEach(b=>b.classList.toggle('active',b===btn));}));}
function renderProduct(){
  if(!product){location.href='index.html';return;}
  selectedColor=product.colors?.[0]||null;selectedSize=product.sizes?.[0]||null;
  document.title=`${product.name} | Pingo Chic`;$('#crumbName').textContent=product.name;$('#productBadge').textContent=product.badge||'Pingo Chic';$('#productRating').textContent=`★ ${Number(product.rating||0).toFixed(1).replace('.',',')} (${Number(product.reviews||0)} avaliações)`;$('#productName').textContent=product.name;$('#productDescription').textContent=product.description||'';$('#productPrice').textContent=formatBRL(product.price);$('#productOldPrice').textContent=product.oldPrice?formatBRL(product.oldPrice):'';$('#productOldPrice').style.display=product.oldPrice?'inline':'none';$('#productInstallments').textContent=`ou 3x de ${formatBRL(product.price/3)} sem juros`;$('#mainIcon').textContent=product.icon;$('#detailList').innerHTML=(product.details||[]).map(detail=>`<li>${detail}</li>`).join('');renderGallery();renderChoices();updateVariant();renderFavorite();updateCartCount();
}
function bind(){
  $('#favoriteTop').addEventListener('click',toggleFavorite);$('#favoriteProduct').addEventListener('click',toggleFavorite);$('#openGuide').addEventListener('click',()=>$('#sizeDialog').showModal());$('#closeGuide').addEventListener('click',()=>$('#sizeDialog').close());$('#addProduct').addEventListener('click',()=>{const stock=getVariantStock(product,selectedColor,selectedSize);const qty=Math.max(1,Math.min(Number($('#qtyInput').value||1),stock));if(!selectedColor||!selectedSize||stock<=0){toast('Escolha uma variação disponível.');return;}addToCart(product,{color:selectedColor,size:selectedSize,qty});updateCartCount();toast(`${product.name} adicionado à sacola`);});
}

renderProduct();
bind();
loadLiveProducts().then(loaded=>{if(loaded){product=getProduct(params.get('id')||1);renderProduct();}});
