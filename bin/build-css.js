// Une los CSS de v2 en css/site.css para servir una sola hoja bloqueante en vez de tres.
// Los archivos fuente se siguen editando por separado; el orden es el de la cascada.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'v2', 'css');
const sources = ['base.css', 'layout.css', 'sections.css'];

const css = sources
    .map((f) => `/* ${f} */\n${fs.readFileSync(path.join(dir, f), 'utf8').trim()}\n`)
    .join('\n');

fs.writeFileSync(path.join(dir, 'site.css'), css);
console.log(`site.css: ${Buffer.byteLength(css)} bytes`);
