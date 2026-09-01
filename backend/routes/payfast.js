const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const { verifyItnSignature, confirmWithPayfast } = require("../lib/payfast");

// PayFast's IP range that ITN calls originate from — reject anything else.
// Full current list: https://developers.payfast.co.za/docs#step_3_confirm_payment
const PAYFAST_IP_PREFIXES = ["197.97.145.", "41.74.179.", "102.216.36.", "102.216.32."];

// POST /api/payfast/notify — called server-to-server by PayFast, not by the browser.
// Mounted with express.raw() in server.js so we can verify against the exact bytes sent.
router.post("/notify", async (req, res) => {
  try {
    const rawBody = req.body.toString("utf8");
    const params = Object.fromEntries(new URLSearchParams(rawBody));

    // 1) Signature must match what we'd generate ourselves.
    if (!verifyItnSignature(params)) {
      console.warn("PayFast ITN: signature mismatch", params.m_payment_id);
      return res.status(400).end();
    }

    // 2) Source IP should be PayFast's. (Skip in local/dev testing.)
    if (process.env.NODE_ENV === "production") {
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
      const known = PAYFAST_IP_PREFIXES.some(prefix => ip.startsWith(prefix));
      if (!known) {
        console.warn("PayFast ITN: unexpected source IP", ip);
        return res.status(400).end();
      }
    }

    // 3) Confirm the payload with PayFast's own servers — the step that
    // actually protects you from a forged notification.
    const confirmed = await confirmWithPayfast(rawBody);
    if (!confirmed) {
      console.warn("PayFast ITN: validate call rejected", params.m_payment_id);
      return res.status(400).end();
    }

    const order = db.getOrder(params.m_payment_id);
    if (!order) return res.status(404).end();

    // 4) Amount must match what we actually charged for — catches tampering.
    if (Math.abs(parseFloat(params.amount_gross) - order.total) > 0.01) {
      console.warn("PayFast ITN: amount mismatch", params.m_payment_id);
      return res.status(400).end();
    }

    if (params.payment_status === "COMPLETE") {
      db.markOrderPaid(order.id);
      // TODO in production: send order-confirmation email, push to fulfilment/inventory system.
    } else if (["FAILED", "CANCELLED"].includes(params.payment_status)) {
      db.releaseOrderStock(order.id);
    }

    res.status(200).end(); // PayFast just needs a 200 — no body required.
  } catch (err) {
    console.error("PayFast ITN error:", err);
    res.status(500).end();
  }
});

module.exports = router;
