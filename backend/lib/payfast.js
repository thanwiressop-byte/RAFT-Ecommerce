/**
 * PayFast integration helpers.
 *
 * PayFast's flow, end to end:
 *  1. Your server builds a set of fields (amount, item_name, return/cancel/
 *     notify URLs, etc.) and signs them with an MD5 hash.
 *  2. The browser is redirected (via an auto-submitting POST form) to
 *     PayFast's hosted payment page — card details are entered on PayFast's
 *     site, never on yours. This is what keeps you out of PCI-DSS scope.
 *  3. PayFast redirects the shopper back to `return_url` (success) or
 *     `cancel_url` (cancelled). This redirect is NOT proof of payment —
 *     it's just a UX redirect and can be spoofed.
 *  4. Separately, PayFast's servers call your `notify_url` (the "ITN" —
 *     Instant Transaction Notification) with the real payment result. You
 *     must verify that call's signature AND confirm it directly with
 *     PayFast's servers before trusting it. Order status is only ever
 *     flipped to "Paid" from the ITN handler, never from the return_url page.
 *
 * Docs: https://developers.payfast.co.za/docs
 */
const crypto = require("crypto");
const https = require("https");

const PAYFAST_HOSTS = {
  sandbox: "sandbox.payfast.co.za",
  live: "www.payfast.co.za"
};

function payfastHost(){
  return PAYFAST_HOSTS[process.env.PAYFAST_MODE === "live" ? "live" : "sandbox"];
}
function payfastActionUrl(){
  return `https://${payfastHost()}/eng/process`;
}

/** Builds the MD5 signature PayFast expects for a given field set. */
function generateSignature(fields, passphrase){
  // PayFast requires the fields in the exact order they'll be posted,
  // URL-encoded, joined with "&", with spaces as "+" — then optionally the
  // passphrase appended — then MD5'd.
  let pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, "+")}`);

  let query = pairs.join("&");
  if (passphrase) {
    query += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }
  return crypto.createHash("md5").update(query).digest("hex");
}

/** Builds the full field set + signature for a checkout redirect. */
function buildCheckoutFields({ order, customer, appUrl }) {
  const fields = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${appUrl}/checkout-success.html?order=${order.id}`,
    cancel_url: `${appUrl}/checkout.html?cancelled=${order.id}`,
    notify_url: `${appUrl}/api/payfast/notify`,

    name_first: customer.firstName,
    name_last: customer.lastName,
    email_address: customer.email,

    m_payment_id: order.id,               // your own order reference
    amount: order.total.toFixed(2),
    item_name: `RAFT order ${order.id}`,
    item_description: order.items.map(i => `${i.name} x${i.qty}`).join(", ").slice(0, 255)
  };
  fields.signature = generateSignature(fields, process.env.PAYFAST_PASSPHRASE);
  return { action: payfastActionUrl(), fields };
}

/** Verifies an incoming ITN post's signature matches what we'd generate. */
function verifyItnSignature(body) {
  const { signature, ...rest } = body;
  const expected = generateSignature(rest, process.env.PAYFAST_PASSPHRASE);
  return expected === signature;
}

/**
 * Step 2 of ITN trust: ask PayFast's own servers to confirm the data we
 * received really came from them. Never skip this — signature match alone
 * is not sufficient since a leaked passphrase or ordering bug can be faked.
 */
function confirmWithPayfast(rawBody) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: payfastHost(),
        path: "/eng/query/validate",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(rawBody)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data.trim() === "VALID"));
      }
    );
    req.on("error", reject);
    req.write(rawBody);
    req.end();
  });
}

module.exports = { generateSignature, buildCheckoutFields, verifyItnSignature, confirmWithPayfast, payfastActionUrl };
