import { formatBRL } from './products.js';

const CART_KEY = 'pingoChicCart';

export function getCart(){
  try{return JSON.parse(localStorage.getItem(CART_KEY) || '[]');}catch{return []}
}

export function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product,variant={}){
  const cart = getCart();
  const color = variant.color || null;
  const size = variant.size || null;
  const qty = Math.max(1, Number(variant.qty || 1));
  const key = `${product.id}:${color || '-'}:${size || '-'}`;
  const existing = cart.find(item => (item.key || `${item.id}:-:-`) === key);
  if(existing) existing.qty += qty;
  else cart.push({key,id:product.id,name:product.name,price:product.price,icon:product.icon,color,size,qty});
  saveCart(cart);
  return cart;
}

export function removeFromCart(productKey){
  const cart = getCart().filter(item => item.key !== productKey && item.id !== productKey);
  saveCart(cart);
  return cart;
}

export function getCartSummary(){
  const cart = getCart();
  const count = cart.reduce((sum,item)=>sum + item.qty,0);
  const total = cart.reduce((sum,item)=>sum + item.price * item.qty,0);
  return {cart,count,total,totalFormatted:formatBRL(total)};
}
