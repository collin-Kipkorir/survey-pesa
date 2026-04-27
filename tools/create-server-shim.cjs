const fs = require('fs');
const path = require('path');

const distServerDir = path.resolve(process.cwd(), 'dist', 'server');
const target = path.join(distServerDir, 'server.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function findSSREntry() {
  const candidates = ['index.js', 'server.js'];
  for (const c of candidates) {
    const p = path.join(distServerDir, c);
    if (fs.existsSync(p)) return `./${c}`;
  }
  return null;
}

ensureDir(distServerDir);

const entry = findSSREntry();
let content;
if (entry) {
  content = `module.exports = require('${entry}');`;
} else {
  content = `module.exports = function handler() { return { status: 404, body: 'Not found' }; }`;
}

fs.writeFileSync(target, content, 'utf8');
console.log('Created server shim at', target);
