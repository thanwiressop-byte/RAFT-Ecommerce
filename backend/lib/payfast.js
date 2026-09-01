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

function pfUrlEncode(str){
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function generateSignature(fields, passphrase){
  let pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${pfUrlEncode(String(v).trim())}`);

  let query = pairs.join("&");
  if (passphrase) {
    query += `&passphrase=${pfUrlEncode(passphrase.trim())}`;
  }
  console.log("PAYFAST SIGNING STRING:", query);
  return crypto.createHash("md5").update(query).digest("hex");
}

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

    m_payment_id: order.id,
    amount: order.total.toFixed(2),
    item_name: `RAFT order ${order.id}`,
    item_description: order.items.map(i => `${i.name} x${i.qty}`).join(", ").slice(0, 255)
  };
  fields.signature = generateSignature(fields, process.env.PAYFAST_PASSPHRASE);
  return { action: payfastActionUrl(), fields };
}

function verifyItnSignature(body) {
  const { signature, ...rest } = body;
  const expected = generateSignature(rest, process.env.PAYFAST_PASSPHRASE);
  return expected === signature;
}

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
