import { renderAll } from './render.js';
import { initNav, initReveal, initMatrix, initGallery } from './ui.js';

document.documentElement.classList.add('reveal-ready');
renderAll();
initNav();
initReveal();
initMatrix();
initGallery();

// La escena 3D se carga aparte: el texto del hero ya es visible y no depende de Three.js.
const stage = document.getElementById('stage');
const canSave = navigator.connection && navigator.connection.saveData;

/** 'gpu' | 'software' (SwiftShader, llvmpipe…) | 'none'. Con render por software la escena iría a pocos fps. */
function webglKind() {
    try {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        if (!gl) return 'none';
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
        return /swiftshader|llvmpipe|software|basic render/i.test(name) ? 'software' : 'gpu';
    } catch (e) {
        return 'none';
    }
}

async function startScene() {
    const kind = webglKind();
    const force = new URLSearchParams(location.search).get('webgl') === 'force';
    if (kind === 'none' || canSave || (kind === 'software' && !force)) {
        stage.classList.add('stage--static');
        return;
    }
    try {
        const { initScene } = await import('./scene/index.js');
        await initScene(stage);
        stage.classList.add('stage--live');
    } catch (err) {
        console.warn('Escena 3D no disponible, se muestra la imagen estática.', err);
        stage.classList.add('stage--static');
    }
}

const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 1));
if (document.readyState === 'complete') idle(startScene);
else addEventListener('load', () => idle(startScene), { once: true });
