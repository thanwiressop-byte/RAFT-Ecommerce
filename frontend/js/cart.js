/**
 * Cart state.
 * Persisted with localStorage so it survives navigation between pages.
 * NOTE: when this file is previewed inside a sandboxed artifact viewer,
 * storage APIs may be blocked — it works normally once the site is hosted.
 * In the production build this mirrors a server-side cart tied to the
 * logged-in user's session (see /backend/routes/cart.js).
 */
const RAFT_CART_KEY = "raft_cart_v1";

function raftGetCart(){
  try{
    const raw = localStorage.getItem(RAFT_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function raftSaveCart(cart){
  try{ localStorage.setItem(RAFT_CART_KEY, JSON.stringify(cart)); }catch(e){}
  raftUpdateCartBadge();
}
function raftAddToCart(productId, qty){
  qty = qty || 1;
  const product = raftFindProduct(productId);
  if(!product) return;
  const cart = raftGetCart();
  const existing = cart.find(i => i.id === productId);
  const currentQty = existing ? existing.qty : 0;
  const nextQty = Math.min(currentQty + qty, product.stock); // never exceed live stock
  if(existing){ existing.qty = nextQty; } else { cart.push({ id: productId, qty: nextQty }); }
  raftSaveCart(cart);
  raftShowToast(`${product.name} added to cart`);
}
function raftUpdateQty(productId, qty){
  const product = raftFindProduct(productId);
  const cart = raftGetCart();
  const item = cart.find(i => i.id === productId);
  if(!item) return;
  item.qty = Math.max(1, Math.min(qty, product ? product.stock : qty));
  raftSaveCart(cart);
}
function raftRemoveFromCart(productId){
  const cart = raftGetCart().filter(i => i.id !== productId);
  raftSaveCart(cart);
}
function raftCartCount(){
  return raftGetCart().reduce((sum, i) => sum + i.qty, 0);
}
function raftCartLines(){
  return raftGetCart().map(i => {
    const p = raftFindProduct(i.id);
    return p ? { ...i, product: p, lineTotal: p.price * i.qty } : null;
  }).filter(Boolean);
}
function raftCartSubtotal(){
  return raftCartLines().reduce((sum, l) => sum + l.lineTotal, 0);
}
const RAFT_SHIPPING_FLAT = 149;
const RAFT_FREE_SHIPPING_THRESHOLD = 2000;
function raftShippingCost(){
  const sub = raftCartSubtotal();
  if(sub === 0) return 0;
  return sub >= RAFT_FREE_SHIPPING_THRESHOLD ? 0 : RAFT_SHIPPING_FLAT;
}
function raftCartTotal(){
  return raftCartSubtotal() + raftShippingCost();
}
function raftUpdateCartBadge(){
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    const count = raftCartCount();
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}
function raftShowToast(message){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2400);
}
document.addEventListener("DOMContentLoaded", raftUpdateCartBadge);
