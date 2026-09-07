import { products, formatBRL } from './products.js';
import { addToCart, getCartSummary, removeFromCart } from './cart.js';

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
      <div class="product-media">
        <span class="badge">${product.badge}</span>
        <span class="placeholder-icon">${product.icon}</span>
      </div>
      <div class="product-content">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="price-row">
          <strong>${formatBRL(product.price)}</strong>
          ${product.oldPrice ? `<s>${formatBRL(product.oldPrice)}</s>` : ''}
        </div>
        <div class="installments">ou 3x de ${formatBRL(product.price / 3)}</div>
        <div class="product-actions">
          <button class="btn primary" data-add-cart="${product.id}">Adicionar</button>
          <button class="favorite-button" type="button" aria-label="Favoritar ${product.name}">♡</button>
        </div>
      </div>
    </article>
  `).join('');

  emptyState.classList.toggle('hidden', filtered.length > 0);
}

function renderCart(){
  const summary = getCartSummary();
  cartCount.textContent = summary.count;
  cartTotal.textContent = summary.totalFormatted;
  cartItems.innerHTML = summary.cart.length ? summary.cart.map(item => `
    <div class="cart-line">
      <div class="cart-thumb">${item.icon}</div>
      <div><strong>${item.name}</strong><br><small>${item.qty} × ${formatBRL(item.price)}</small></div>
      <button class="cart-remove" data-remove-cart="${item.id}">Remover</button>
    </div>
  `).join('') : '<div class="empty-state">Sua sacola está vazia.</div>';
}

function openCart(){
  renderCart();
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden','false');
  scrim.classList.add('show');
}

function closeCart(){
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden','true');
  scrim.classList.remove('show');
}

let toastTimer;
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('show'),2200);
}

function setCategory(category){
  activeCategory = category;
  document.querySelectorAll('[data-category]').forEach(button => button.classList.toggle('active', button.dataset.category === category));
  renderProducts();
  document.querySelector('#catalogo')?.scrollIntoView({behavior:'smooth',block:'start'});
}

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add-cart]');
  if(addButton){
    const product = products.find(item => item.id === Number(addButton.dataset.addCart));
    if(product){addToCart(product); renderCart(); showToast(`${product.name} foi para a sacola`);}
    return;
  }

  const removeButton = event.target.closest('[data-remove-cart]');
  if(removeButton){removeFromCart(Number(removeButton.dataset.removeCart)); renderCart(); return;}

  const categoryButton = event.target.closest('[data-category]');
  if(categoryButton){setCategory(categoryButton.dataset.category); return;}

  const themeButton = event.target.closest('[data-filter-theme]');
  if(themeButton){setCategory(themeButton.dataset.filterTheme); return;}

  const action = event.target.closest('[data-action]')?.dataset.action;
  if(action === 'cart') openCart();
  if(action === 'close-cart') closeCart();
  if(action === 'account') showToast('Área da cliente será conectada na próxima etapa');
  if(action === 'favorites') showToast('Favoritos serão conectados à conta da cliente');
});

document.querySelector('#searchForm')?.addEventListener('submit', event => {
  event.preventDefault();
  searchTerm = searchInput.value;
  renderProducts();
  document.querySelector('#catalogo')?.scrollIntoView({behavior:'smooth'});
});

document.querySelector('#showAllProducts')?.addEventListener('click',()=>{
  searchInput.value=''; searchTerm=''; setCategory('todos');
});

document.querySelector('#newsletterForm')?.addEventListener('submit', event => {
  event.preventDefault();
  showToast('Cadastro recebido. Em breve conectaremos a lista oficial.');
  event.currentTarget.reset();
});

renderProducts();
renderCart();
