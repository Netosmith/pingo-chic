const $ = selector => document.querySelector(selector);
let products = [];
let editingId = null;

const apiUrlInput = $('#apiUrl');
const tokenInput = $('#adminToken');
const body = $('#productsBody');
const dialog = $('#productDialog');
const form = $('#productForm');

apiUrlInput.value = sessionStorage.getItem('pingoChicApiUrl') || '';
tokenInput.value = sessionStorage.getItem('pingoChicAdminToken') || '';

function apiBase(){ return apiUrlInput.value.trim().replace(/\/$/,''); }
function authHeaders(){ return {'content-type':'application/json','authorization':`Bearer ${tokenInput.value.trim()}`}; }
function toast(message){ const el=$('#adminToast'); el.textContent=message; el.classList.add('show'); clearTimeout(window.__adminToast); window.__adminToast=setTimeout(()=>el.classList.remove('show'),2200); }
function brl(value){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value||0)); }
function slugify(value){ return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

async function request(path, options={}){
  const response = await fetch(`${apiBase()}${path}`, options);
  const data = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error || `Erro ${response.status}`);
  return data;
}

async function loadProducts(){
  if(!apiBase() || !tokenInput.value.trim()){ toast('Informe a API e o token administrativo.'); return; }
  body.innerHTML='<tr><td colspan="6" class="empty">Carregando...</td></tr>';
  try{
    const data = await request('/api/products?admin=1',{headers:{authorization:`Bearer ${tokenInput.value.trim()}`}});
    products = data.products || [];
    renderProducts();
    updateStats();
    sessionStorage.setItem('pingoChicApiUrl',apiBase());
    sessionStorage.setItem('pingoChicAdminToken',tokenInput.value.trim());
    toast('Admin conectado com sucesso.');
  }catch(error){
    body.innerHTML=`<tr><td colspan="6" class="empty">${error.message}</td></tr>`;
    toast(error.message);
  }
}

function filteredProducts(){
  const term=$('#productSearch').value.trim().toLowerCase();
  return products.filter(p=>!term || `${p.name} ${p.category} ${p.slug}`.toLowerCase().includes(term));
}

function renderProducts(){
  const list=filteredProducts();
  body.innerHTML=list.length?list.map(product=>`
    <tr>
      <td><strong>${product.name}</strong><br><small>${product.slug}</small></td>
      <td>${product.category}</td>
      <td>${brl(product.price)}</td>
      <td>${product.stockTotal ?? 0}</td>
      <td><span class="status ${product.active?'active':'inactive'}">${product.active?'Ativo':'Arquivado'}</span></td>
      <td><button data-edit="${product.id}">Editar</button></td>
    </tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhum produto encontrado.</td></tr>';
}

function updateStats(){
  $('#statProducts').textContent=products.length;
  $('#statActive').textContent=products.filter(p=>p.active).length;
  $('#statStock').textContent=products.reduce((sum,p)=>sum+Number(p.stockTotal||0),0);
}

function resetForm(){
  editingId=null;
  form.reset();
  $('#productId').value='';
  $('#rating').value='5';
  $('#reviewsCount').value='0';
  $('#active').checked=true;
  $('#dialogTitle').textContent='Novo produto';
  $('#archiveProduct').classList.add('hidden');
}

function openNew(){ resetForm(); dialog.showModal(); }
function openEdit(id){
  const product=products.find(p=>p.id===Number(id));
  if(!product)return;
  editingId=product.id;
  $('#productId').value=product.id;
  $('#name').value=product.name||'';
  $('#slug').value=product.slug||'';
  $('#category').value=product.category||'';
  $('#theme').value=product.theme||'fem';
  $('#badge').value=product.badge||'';
  $('#price').value=product.price??'';
  $('#oldPrice').value=product.oldPrice??'';
  $('#rating').value=product.rating??5;
  $('#reviewsCount').value=product.reviewsCount??0;
  $('#description').value=product.description||'';
  $('#details').value=(product.details||[]).join('\n');
  $('#images').value=(product.images||[]).join('\n');
  $('#active').checked=Boolean(product.active);
  $('#dialogTitle').textContent='Editar produto';
  $('#archiveProduct').classList.toggle('hidden',!product.active);
  dialog.showModal();
}

function payload(){
  return {
    name:$('#name').value.trim(),
    slug:$('#slug').value.trim(),
    category:$('#category').value.trim(),
    theme:$('#theme').value,
    badge:$('#badge').value.trim(),
    price:Number($('#price').value),
    oldPrice:$('#oldPrice').value===''?null:Number($('#oldPrice').value),
    rating:Number($('#rating').value||5),
    reviewsCount:Number($('#reviewsCount').value||0),
    description:$('#description').value.trim(),
    details:$('#details').value.split('\n').map(v=>v.trim()).filter(Boolean),
    images:$('#images').value.split('\n').map(v=>v.trim()).filter(Boolean),
    active:$('#active').checked
  };
}

async function saveProduct(event){
  event.preventDefault();
  try{
    const path=editingId?`/api/admin/products/${editingId}`:'/api/admin/products';
    await request(path,{method:editingId?'PUT':'POST',headers:authHeaders(),body:JSON.stringify(payload())});
    dialog.close();
    toast(editingId?'Produto atualizado.':'Produto criado.');
    await loadProducts();
  }catch(error){toast(error.message);}
}

async function archiveProduct(){
  if(!editingId)return;
  try{
    await request(`/api/admin/products/${editingId}`,{method:'DELETE',headers:authHeaders()});
    dialog.close();
    toast('Produto arquivado.');
    await loadProducts();
  }catch(error){toast(error.message);}
}

$('#connectAdmin').addEventListener('click',loadProducts);
$('#refreshProducts').addEventListener('click',loadProducts);
$('#newProduct').addEventListener('click',openNew);
$('#closeDialog').addEventListener('click',()=>dialog.close());
$('#cancelDialog').addEventListener('click',()=>dialog.close());
$('#archiveProduct').addEventListener('click',archiveProduct);
$('#productSearch').addEventListener('input',renderProducts);
$('#name').addEventListener('input',()=>{if(!editingId)$('#slug').value=slugify($('#name').value);});
form.addEventListener('submit',saveProduct);
body.addEventListener('click',event=>{const button=event.target.closest('[data-edit]');if(button)openEdit(button.dataset.edit);});

if(apiBase() && tokenInput.value.trim()) loadProducts();
