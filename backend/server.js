require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const productsRoute = require("./routes/products");
const checkoutRoute = require("./routes/checkout");
const payfastRoute = require("./routes/payfast");
const ordersRoute = require("./routes/orders");
const authRoute = require("./routes/auth");

const app = express();
app.set("trust proxy", 1); // needed for correct client IPs behind a load balancer (used in PayFast IP check)

// contentSecurityPolicy is disabled because the frontend uses inline <script>
// blocks throughout (no build step). Helmet's other protective headers
// (X-Frame-Options, X-Content-Type-Options, etc.) still apply. For a
// stronger setup later, move the inline scripts into the js/ files and
// re-enable a strict CSP.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.APP_URL, credentials: true }));

// IMPORTANT: the PayFast ITN route needs the raw request body to verify the
// signature, so it's mounted with express.raw() BEFORE the JSON body parser
// touches it. Every other route gets normal JSON parsing.
app.use("/api/payfast", express.raw({ type: "application/x-www-form-urlencoded" }), payfastRoute);
app.use(express.json());

// Basic abuse protection on write endpoints. Tune per your traffic.
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(["/api/checkout", "/api/auth"], writeLimiter);

app.use("/api/products", productsRoute);
app.use("/api/checkout", checkoutRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/auth", authRoute);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve the static frontend (built from /frontend) so one server can run the whole site.
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.listen(process.env.PORT || 4000, () => {
  console.log(`RAFT backend listening on port ${process.env.PORT || 4000} (PayFast mode: ${process.env.PAYFAST_MODE || "sandbox"})`);
});
