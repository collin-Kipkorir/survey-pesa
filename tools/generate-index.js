import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'dist', 'client');
const assetsDir = path.join(outDir, 'assets');

function safeReadDir(dir) {
  try { return fs.readdirSync(dir); } catch (e) { return []; }
}

function makeIndex() {
  const assets = safeReadDir(assetsDir);
  const cssFiles = assets.filter((f) => f.endsWith('.css'));
  // Prefer index-*.js files, otherwise include any main-ish bundles
  let jsFiles = assets.filter((f) => f.match(/^index.*\.js$/));
  if (jsFiles.length === 0) jsFiles = assets.filter((f) => f.endsWith('.js'));

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const title = 'Pesatask';
  const favicon = 'favicon.ico';

  // If the user provides a src/index.html template, use it and inject asset tags.
  const srcIndexPath = path.resolve(process.cwd(), 'src', 'index.html');
  if (fs.existsSync(srcIndexPath)) {
    let template = fs.readFileSync(srcIndexPath, 'utf8');

    // Inject CSS links before </head>
    const cssTags = cssFiles.map((css) => `<link rel="stylesheet" href="assets/${css}" />`).join('\n');
    template = template.replace(/<\/head>/i, cssTags + '\n</head>');

    // Inject scripts before </body>. Replace any existing module script that points to /src/... if present.
    const scriptTags = jsFiles.map((js) => `<script type="module" src="assets/${js}"></script>`).join('\n');
    if (/src\/.+\.tsx?"\s*>/i.test(template)) {
      // remove any inline script that points to /src/... so we can replace it
      template = template.replace(/<script[^>]+src=["']\/src\/.+?["'][^>]*>\s*<\/script>/i, scriptTags);
    } else {
      template = template.replace(/<\/body>/i, scriptTags + '\n</body>');
    }

    // Ensure favicon path is relative
    template = template.replace(/href=["']\/favicon\.ico["']/i, `href="${favicon}"`);

    fs.writeFileSync(path.join(outDir, 'index.html'), template, 'utf8');
    console.log('Generated from src/index.html ->', path.join(outDir, 'index.html'));
    return;
  }

  const lines = [];
  lines.push('<!doctype html>');
  lines.push('<html lang="en">');
  lines.push('<head>');
  lines.push('<meta charset="utf-8"/>');
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1"/>');
  lines.push(`<title>${title}</title>`);
  if (cssFiles.length) {
    for (const css of cssFiles) {
      lines.push(`<link rel="stylesheet" href="assets/${css}" />`);
    }
  }
  lines.push(`<link rel="icon" href="${favicon}" />`);
  lines.push('</head>');
  lines.push('<body>');
  lines.push('<div id="root"></div>');

  // Load scripts
  for (const js of jsFiles) {
    lines.push(`<script type="module" src="assets/${js}"></script>`);
  }

  lines.push('</body>');
  lines.push('</html>');

  const outHtml = lines.join('\n');
  fs.writeFileSync(path.join(outDir, 'index.html'), outHtml, 'utf8');
  console.log('Generated', path.join(outDir, 'index.html'));
}

makeIndex();
