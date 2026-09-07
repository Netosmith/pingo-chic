import { products, formatBRL } from './products.js';
import { getCartSummary, removeFromCart } from './cart.js';

const grid = document.querySelector('#productGrid');
const emptyState = document.querySelector('#emptyState');
const cartCount = document.querySelector('#cartCount');
const cartDrawer = document.querySelector('#cartDrawer');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const scrim = document.querySelector('#scrim');
const toast = document.querySelector('#toast');
const searchInput = document.querySelector('#searchInput');

let activeCategory = 'todos';
let searchTerm = '';

function renderProducts(){
  const filtered = products.filter(product => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || `${product.name} ${product.category}`.toLowerCase().includes(term);
    const matchesCategory = activeCategory === 'todos'
      || product.theme === activeCategory
      || product.category === activeCategory
      || (activeCategory === 'oferta' && product.oldPrice);
    return matchesSearch && matchesCategory;
  });

  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <a class="product-media" href="produto.html?id=${product.id}" aria-label="Ver ${product.name}">
        <span class="badge">${product.badge}</span>
        <span class="placeholder-icon">${product.icon}</span>
      </a>
      <div class="product-content">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name"><a href="produto.html?id=${product.id}">${product.name}</a></h3>
        <div class="price-row">
          <strong>${formatBRL(product.price)}</strong>
          ${product.oldPrice ? `<s>${formatBRL(product.oldPrice)}</s>` : ''}
        </div>
        <div class="installments">★ ${product.rating.toFixed(1).replace('.',',')} • ou 3x de ${formatBRL(product.price / 3)}</div>
        <div class="product-actions">
          <a class="btn primary" href="produto.html?id=${product.id}">Ver produto</a>
          <button class="favorite-button" type="button" aria-label="Favoritar ${product.name}" data-favorite="${product.id}">♡</button>
        </div>
      </div>
    </article>
  `).join('');

  emptyState.classList.toggle('hidden', filtered.length > 0);
  renderHomeFavorites();
}

function getFavorites(){try{return JSON.parse(localStorage.getItem('pingoChicFavorites') || '[]');}catch{return []}}
function renderHomeFavorites(){
  const list=getFavorites();
  document.querySelectorAll('[data-favorite]').forEach(button=>{
    const active=list.includes(Number(button.dataset.favorite));
    button.textContent=active?'♥':'♡';
    button.style.color=active?'var(--pink-deep)':'';
  });
}
function toggleHomeFavorite(id){
  const list=getFavorites();
  const index=list.indexOf(id);
  if(index>=0)list.splice(index,1);else list.push(id);
  localStorage.setItem('pingoChicFavorites',JSON.stringify(list));
  renderHomeFavorites();
  showToast(index>=0?'Removido dos favoritos':'Salvo nos favoritos ♡');
}

function renderCart(){
  const summary = getCartSummary();
  cartCount.textContent = summary.count;
  cartTotal.textContent = summary.totalFormatted;
  cartItems.innerHTML = summary.cart.length ? summary.cart.map(item => `
    <div class="cart-line">
      <div class="cart-thumb">${item.icon}</div>
      <div><strong>${item.name}</strong><br><small>${[item.color,item.size].filter(Boolean).join(' • ') || 'Variação não informada'}</small><br><small>${item.qty} × ${formatBRL(item.price)}</small></div>
      <button class="cart-remove" data-remove-cart="${item.key || item.id}">Remover</button>
    </div>
  `).join('') : '<div class="empty-state">Sua sacola está vazia.</div>';
}

function openCart(){renderCart();cartDrawer.classList.add('open');cartDrawer.setAttribute('aria-hidden','false');scrim.classList.add('show');}
function closeCart(){cartDrawer.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true');scrim.classList.remove('show');}

let toastTimer;
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);}
function setCategory(category){activeCategory=category;document.querySelectorAll('[data-category]').forEach(button=>button.classList.toggle('active',button.dataset.category===category));renderProducts();document.querySelector('#catalogo')?.scrollIntoView({behavior:'smooth',block:'start'});}

document.addEventListener('click', event => {
  const favoriteButton=event.target.closest('[data-favorite]');
  if(favoriteButton){toggleHomeFavorite(Number(favoriteButton.dataset.favorite));return;}
  const removeButton=event.target.closest('[data-remove-cart]');
  if(removeButton){removeFromCart(removeButton.dataset.removeCart);renderCart();return;}
  const categoryButton=event.target.closest('[data-category]');
  if(categoryButton){setCategory(categoryButton.dataset.category);return;}
  const themeButton=event.target.closest('[data-filter-theme]');
  if(themeButton){setCategory(themeButton.dataset.filterTheme);return;}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='cart')openCart();
  if(action==='close-cart')closeCart();
  if(action==='account')showToast('Área da cliente será conectada na próxima etapa');
  if(action==='favorites')showToast(`${getFavorites().length} produto(s) salvo(s) nos favoritos`);
});

document.querySelector('#searchForm')?.addEventListener('submit', event => {event.preventDefault();searchTerm=searchInput.value;renderProducts();document.querySelector('#catalogo')?.scrollIntoView({behavior:'smooth'});});
document.querySelector('#showAllProducts')?.addEventListener('click',()=>{searchInput.value='';searchTerm='';setCategory('todos');});
document.querySelector('#newsletterForm')?.addEventListener('submit', event => {event.preventDefault();showToast('Cadastro recebido. Em breve conectaremos a lista oficial.');event.currentTarget.reset();});

renderProducts();
renderCart();
