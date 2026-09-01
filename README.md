# RAFT — ecommerce storefront

An outdoor/whitewater gear storefront: product catalog with live inventory,
cart, PayFast checkout, and a customer dashboard with order history.

```
raft/
├── frontend/          Static site — plain HTML/CSS/JS, no build step
│   ├── index.html      Home
│   ├── shop.html        Catalog with category/price/stock filters
│   ├── product.html     Product detail (reads ?id=, SEO meta + schema.org set per product)
│   ├── cart.html         Cart
│   ├── checkout.html      3-step checkout → PayFast
│   ├── checkout-success.html  PayFast return_url landing page
│   ├── dashboard.html      Order history / profile / addresses
│   ├── robots.txt, sitemap.xml
│   └── css/, js/
└── backend/           Node/Express API
    ├── server.js
    ├── routes/         products, checkout, payfast (ITN), orders, auth
    └── lib/            db.js, users.js, payfast.js, auth.js
```

## Running it locally

**Frontend only (what you can click through right now):** open
`frontend/index.html` directly in a browser, or serve the folder
(`npx serve frontend`). Cart, checkout and dashboard all work with a local
demo fallback (see "What's real vs simulated" below) so you can click
through the whole flow with zero setup.

**Full stack (frontend + real API + PayFast sandbox):**
```bash
cd backend
cp .env.example .env
# fill in .env — PayFast sandbox credentials below
npm install
npm start
```
Then visit `http://localhost:4000` — Express serves the frontend and the
API from one process, so no CORS/proxy setup is needed.

## What's real vs simulated in this build

I've built this to be **structurally correct and ready to go live**, but a
few things are necessarily simulated until you plug in your own
infrastructure:

| Piece | This build | To go live |
|---|---|---|
| PayFast signing, ITN verification, IP + amount checks | Fully implemented, correct logic (`backend/lib/payfast.js`, `routes/payfast.js`) | Add your real merchant ID/key/passphrase to `.env` |
| Inventory tracking | Real reserve → commit/release logic against a JSON file (`backend/lib/db.js`) | Swap the JSON file for Postgres/MySQL (schema below) — same function signatures |
| Auth | Working signup/login with bcrypt + JWT (`routes/auth.js`) | Fine to keep, or swap for a managed provider (Clerk/Auth0/Supabase Auth) for password resets, email verification, social login |
| Checkout UI when no backend is running | Falls back to a clearly-labelled "Demo mode" that simulates a paid order client-side so you can click through | Once the backend is running, `checkout.html` talks to the real `/api/checkout` automatically — no code change needed |
| Product pages | Client-rendered from `js/data.js`; Google can index them but a crawl-time render is weaker than pre-rendered HTML | Pre-render each product page at build time (Next.js/Astro/11ty) or add server-side rendering — biggest single SEO upgrade available |

## PayFast setup

1. Create a merchant account at [payfast.co.za](https://www.payfast.co.za).
2. For testing, use PayFast's public **sandbox** credentials (no account
   needed): `merchant_id=10000100`, `merchant_key=46f0cd694581a`,
   `PAYFAST_MODE=sandbox`. Sandbox card testing details are in PayFast's
   docs: https://developers.payfast.co.za/docs#testing
3. In your PayFast dashboard, set a **passphrase** (Settings → Security) and
   put it in `PAYFAST_PASSPHRASE` — required for signature verification.
4. Your `notify_url` (`/api/payfast/notify`) must be publicly reachable over
   HTTPS for PayFast's servers to call it — it won't work against
   `localhost`. Use a tunnel (`ngrok http 4000`) while testing, or deploy.
5. Switch `PAYFAST_MODE=live` and use your real merchant ID/key once you've
   tested a full sandbox purchase end to end.

**Order status only ever changes from the ITN handler**, never from the
`return_url` redirect page — the redirect is easy to spoof, the ITN (after
signature + IP + server-side confirm) isn't. `checkout-success.html`
reflects this: it thanks the shopper but doesn't claim the order is paid
until the ITN lands.

## Inventory tracking

Stock is **reserved** the moment an order is created (checkout step),
and only **permanently decremented** once PayFast's ITN confirms payment.
If payment fails or is cancelled, reserved stock is released back to
sellable inventory. In production, also add a scheduled job that releases
stock for any `pending` order older than ~30 minutes (a shopper who
abandons PayFast mid-payment shouldn't lock stock forever).

Suggested production schema (Postgres):
```sql
products(id, name, category, price_cents, stock, sku, created_at)
orders(id, customer_email, status, subtotal_cents, shipping_cents, total_cents, created_at)
order_items(order_id, product_id, name, qty, price_cents)
users(id, email, password_hash, first_name, last_name, created_at)
```

## SEO — what's already in place, and what to do next

**Already in the markup:**
- Unique `<title>` and meta description per page, `rel=canonical`, `robots`
  meta (private pages like cart/checkout/dashboard are `noindex`)
- Open Graph + Twitter card tags on the home page
- `Organization` and `WebSite` (with `SearchAction`) JSON-LD on the home
  page; per-product `Product` JSON-LD (price, availability, rating) on
  `product.html`
- Semantic HTML (`<header>`, `<nav>`, `<article>`, breadcrumbs)
- `robots.txt` + `sitemap.xml`
- Mobile-responsive layout (see below) — a Google ranking factor via
  Core Web Vitals / mobile-first indexing

**Worth doing before you push hard on organic traffic:**
1. **Pre-render or SSR the catalog.** Right now `shop.html`/`product.html`
   build their content client-side from `js/data.js`. Move to a framework
   with static generation (Next.js, Astro) or server-render from the
   `/api/products` endpoint so crawlers see full HTML on first response.
2. **Generate the sitemap from the database**, not by hand — one entry per
   real product/category, regenerated on a schedule or on publish.
3. **Real product photography and unique product descriptions** — thin/
   duplicate copy is one of the more common reasons ecommerce catalog pages
   don't rank.
4. **Register with Google Search Console + Bing Webmaster Tools** and submit
   the sitemap once the site is live on its real domain.
5. **Page speed**: compress images (WebP), lazy-load below-the-fold images,
   and keep the font list short (this build already loads only two families).
6. **Category landing pages** (`/rafts`, `/kayaks` as real indexable URLs
   rather than `?cat=` query params) generally out-rank query-string
   filtered views.

## Responsive design

Breakpoints at 980px (tablet — grids collapse from 4→2 columns, sidebar
filters stack above content) and 680px (mobile — nav becomes a slide-in
menu, product grids go to 2 columns, forms stack to single-column). Test
with your browser's device toolbar, or resize down from desktop.

## Design notes

Palette and type are RAFT-specific (deep river teal + safety-orange accent,
Fraunces/IBM Plex Sans pairing) rather than a generic template — see the
inline comments in `frontend/css/styles.css` if you want to retheme.
