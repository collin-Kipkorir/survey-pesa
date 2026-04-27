import fs from 'fs';
import path from 'path';

// This shim creates a minimal dist/server/server.js that the preview plugin expects.
// It re-exports the SSR entry if present, otherwise exports a noop server handler.

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
  content = `export * from '${entry}';\n`;
} else {
  content = `export default function handler() { return new Response('Not found', { status: 404 }); }\n`;
}

fs.writeFileSync(target, content, 'utf8');
console.log('Created server shim at', target);
