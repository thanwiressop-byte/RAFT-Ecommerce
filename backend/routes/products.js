const express = require("express");
const router = express.Router();
const db = require("../lib/db");

// GET /api/products — live catalog with current stock levels
router.get("/", (req, res) => {
  res.json(db.getProducts());
});

// GET /api/products/:id — single product with live stock
router.get("/:id", (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

module.exports = router;
