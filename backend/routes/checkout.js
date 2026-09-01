const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const { buildCheckoutFields } = require("../lib/payfast");

// POST /api/checkout
// Body: { customer: {firstName,lastName,email,phone,address,city,postcode,province}, items: [{id, qty}] }
router.post("/", (req, res) => {
  const { customer, items } = req.body || {};

  if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
    return res.status(400).json({ error: "Missing required customer details" });
  }
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  let order;
  try {
    order = db.createOrder({ customer, items });
  } catch (err) {
    // e.g. "Only 2 left of Rapids 12L Waist Pack" — surfaced straight to the
    // shopper so they can adjust quantity before paying.
    return res.status(409).json({ error: err.message });
  }

  const { action, fields } = buildCheckoutFields({
    order,
    customer,
    appUrl: process.env.APP_URL || `${req.protocol}://${req.get("host")}`
  });

  res.json({ orderId: order.id, action, fields });
});

module.exports = router;
