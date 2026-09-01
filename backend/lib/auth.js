const jwt = require("jsonwebtoken");

/** Protects routes that need a logged-in shopper (order history, checkout with saved details, etc). */
function requireAuth(req, res, next){
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if(!token) return res.status(401).json({ error: "Not authenticated" });

  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch(err){
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

module.exports = { requireAuth };
