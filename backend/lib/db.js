/**
 * Storage layer.
 *
 * This is a JSON-file store so the API runs with zero setup for review and
 * local testing. It is NOT safe for concurrent production traffic (no
 * transactions, no locking) — before going live, replace the functions
 * below with real queries against Postgres/MySQL and keep the same
 * function signatures so routes/*.js don't need to change. A suggested
 * schema is in the README under "Going to production".
 */
const fs = require("fs");
const path = require("path");
const DB_FILE = path.join(__dirname, "db.json");

const SEED = {
  products: [
    { id: "rf-101", name: "Current 3-Person Inflatable Raft", price: 4499, stock: 6 },
    { id: "rf-102", name: "Drift 2-Person Touring Kayak", price: 6299, stock: 4 },
    { id: "rf-103", name: "Eddy Adjustable Paddle", price: 899, stock: 22 },
    { id: "rf-104", name: "Torrent CE-Rated Life Jacket", price: 749, stock: 3 },
    { id: "rf-105", name: "Portage 40L Dry Bag", price: 549, stock: 40 },
    { id: "rf-106", name: "Basecamp 2-Person Tent", price: 2199, stock: 9 },
    { id: "rf-107", name: "Anchor River Sandal", price: 899, stock: 15 },
    { id: "rf-108", name: "Rapids 12L Waist Pack", price: 649, stock: 2 },
    { id: "rf-109", name: "Current 6-Person Expedition Raft", price: 8999, stock: 3 },
    { id: "rf-110", name: "Solo Play Kayak", price: 5499, stock: 7 },
    { id: "rf-111", name: "Quickdry Paddle Jacket", price: 1349, stock: 11 },
    { id: "rf-112", name: "Basecamp Camp Stove", price: 999, stock: 13 }
  ],
  orders: []
};

function load(){
  if(!fs.existsSync(DB_FILE)) save(SEED);
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function save(data){
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getProducts(){
  return load().products;
}
function getProduct(id){
  return load().products.find(p => p.id === id);
}

/** Validates a cart against live stock and returns priced, checked lines. */
function priceAndCheckStock(items){
  const db = load();
  const errors = [];
  const lines = items.map(item => {
    const product = db.products.find(p => p.id === item.id);
    if(!product) { errors.push(`Unknown product ${item.id}`); return null; }
    if(item.qty < 1) { errors.push(`Invalid quantity for ${product.name}`); return null; }
    if(item.qty > product.stock) { errors.push(`Only ${product.stock} left of ${product.name}`); return null; }
    return { id: product.id, name: product.name, qty: item.qty, price: product.price };
  }).filter(Boolean);
  return { lines, errors };
}

function createOrder({ customer, items }){
  const db = load();
  const { lines, errors } = priceAndCheckStock(items);
  if(errors.length) throw new Error(errors.join("; "));

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 2000 ? 0 : 149;
  const order = {
    id: "RFT-" + Math.floor(100000 + Math.random() * 900000),
    status: "pending",           // pending -> paid -> shipped, or -> cancelled
    createdAt: new Date().toISOString(),
    customer,
    items: lines,
    subtotal, shipping, total: subtotal + shipping
  };

  // Soft-reserve stock immediately so two shoppers can't both "win" the
  // last unit while one is off at PayFast. Reservations are released if the
  // ITN never confirms payment (see releaseOrderStock + a real deployment
  // should also sweep+release stale pending orders after e.g. 30 minutes).
  order.items.forEach(line => {
    const product = db.products.find(p => p.id === line.id);
    product.stock -= line.qty;
  });
  db.orders.push(order);
  save(db);
  return order;
}

function getOrder(id){
  return load().orders.find(o => o.id === id);
}
function getOrdersByEmail(email){
  return load().orders.filter(o => o.customer.email.toLowerCase() === email.toLowerCase())
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function markOrderPaid(id){
  const db = load();
  const order = db.orders.find(o => o.id === id);
  if(order && order.status === "pending") order.status = "paid";
  save(db);
  return order;
}
function releaseOrderStock(id){
  // Called when a pending order is cancelled/fails — puts the reserved
  // units back into sellable stock.
  const db = load();
  const order = db.orders.find(o => o.id === id);
  if(!order || order.status !== "pending") return;
  order.items.forEach(line => {
    const product = db.products.find(p => p.id === line.id);
    if(product) product.stock += line.qty;
  });
  order.status = "cancelled";
  save(db);
}

module.exports = { getProducts, getProduct, createOrder, getOrder, getOrdersByEmail, markOrderPaid, releaseOrderStock };
