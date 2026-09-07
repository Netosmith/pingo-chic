import { formatBRL } from './products.js';

const CART_KEY = 'pingoChicCart';

export function getCart(){
  try{return JSON.parse(localStorage.getItem(CART_KEY) || '[]');}catch{return []}
}

export function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product){
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if(existing) existing.qty += 1;
  else cart.push({id:product.id,name:product.name,price:product.price,icon:product.icon,qty:1});
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId){
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
}

export function getCartSummary(){
  const cart = getCart();
  const count = cart.reduce((sum,item)=>sum + item.qty,0);
  const total = cart.reduce((sum,item)=>sum + item.price * item.qty,0);
  return {cart,count,total,totalFormatted:formatBRL(total)};
}
