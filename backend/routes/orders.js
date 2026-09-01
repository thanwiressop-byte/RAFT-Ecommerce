const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const { requireAuth } = require("../lib/auth");

// GET /api/orders — this shopper's order history, for the dashboard.
// requireAuth reads the logged-in user from the session/JWT (see lib/auth.js)
// rather than trusting an email passed in the query string.
router.get("/", requireAuth, (req, res) => {
  res.json(db.getOrdersByEmail(req.user.email));
});

// GET /api/orders/:id — single order detail/invoice view.
router.get("/:id", requireAuth, (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order || order.customer.email.toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

module.exports = router;
