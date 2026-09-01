const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const users = require("../lib/users");

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body || {};
  if(!firstName || !lastName || !email || !password || password.length < 8){
    return res.status(400).json({ error: "All fields are required; password must be at least 8 characters" });
  }
  if(users.findByEmail(email)) return res.status(409).json({ error: "An account with that email already exists" });

  const passwordHash = await bcrypt.hash(password, 12);
  users.create({ firstName, lastName, email, passwordHash, createdAt: new Date().toISOString() });

  const token = jwt.sign({ email, firstName, lastName }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.status(201).json({ token, user: { firstName, lastName, email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.findByEmail(email || "");
  if(!user) return res.status(401).json({ error: "Incorrect email or password" });

  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if(!ok) return res.status(401).json({ error: "Incorrect email or password" });

  const token = jwt.sign({ email: user.email, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
});

module.exports = router;
