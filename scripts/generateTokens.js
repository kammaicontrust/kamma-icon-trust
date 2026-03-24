const fs = require("fs");

function generateToken() {
  return "KIT" + Math.floor(10000 + Math.random() * 90000);
}

const tokens = new Set();

while (tokens.size < 1000) {
  tokens.add(generateToken());
}

const tokenArray = Array.from(tokens);

fs.writeFileSync("tokens.json", JSON.stringify(tokenArray, null, 2));

console.log("1000 Tokens Generated ✅");