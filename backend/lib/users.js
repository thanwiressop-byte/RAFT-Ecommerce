/**
 * User store — same JSON-file approach as lib/db.js, same caveat applies:
 * fine for a demo, replace with a real `users` table (see README) before
 * launch. Passwords are bcrypt-hashed either way.
 */
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "users.json");

function load(){
  if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
function save(users){
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}
function findByEmail(email){
  return load().find(u => u.email.toLowerCase() === email.toLowerCase());
}
function create(user){
  const users = load();
  users.push(user);
  save(users);
  return user;
}

module.exports = { findByEmail, create };
