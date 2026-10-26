// Inserta en index.html el HTML que render.js pintaría en cliente, para que el contenido
// exista sin JavaScript (SEO, rastreadores, primera pintura). El cliente lo vuelve a pintar igual.
// Quedan fuera la galería (fotos al azar) y el contacto (el correo se monta en cliente a propósito).
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..', 'public', 'v2');
const htmlPath = path.join(root, 'index.html');

const targets = {
    renderAbout: 'about-body',
    renderExperience: 'exp-list',
    renderMatrix: 'matrix',
    renderEducation: 'edu-grid',
    renderFigures: 'figures',
};

(async () => {
    const out = {};
    // render.js escribe en $('#id').innerHTML; se captura en vez de tocar un DOM.
    global.document = { querySelector: (sel) => (out[sel.slice(1)] = out[sel.slice(1)] || {}) };
    const render = await import(pathToFileURL(path.join(root, 'js', 'render.js')).href);

    Object.keys(targets).forEach((fn) => render[fn]());

    let html = fs.readFileSync(htmlPath, 'utf8');
    // renderFigures también rellena #projects
    const ids = [...Object.values(targets), 'projects'];
    for (const id of ids) {
        const content = out[id] && out[id].innerHTML;
        if (content == null) throw new Error(`render.js no ha rellenado #${id}`);
        const re = new RegExp(`(<!--pr:${id}-->)[\\s\\S]*?(<!--/pr:${id}-->)`);
        if (!re.test(html)) throw new Error(`Faltan los marcadores pr:${id} en index.html`);
        html = html.replace(re, (_, a, b) => `${a}${content}${b}`);
    }
    fs.writeFileSync(htmlPath, html);
    console.log(`prerender: ${ids.length} bloques en index.html`);
})().catch((e) => { console.error(e); process.exit(1); });
