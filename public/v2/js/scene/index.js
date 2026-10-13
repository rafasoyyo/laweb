/** Orquestador de la escena: renderer, bucle, interacción y sincronía con el DOM. */
import * as T from '../../vendor/three/three.min.js';
import { EffectComposer, RenderPass, UnrealBloomPass, OutputPass } from '../../vendor/three/three.min.js';
import { fmtPeriod, prefersReducedMotion } from '../util.js';
import { buildWorld, buildGroupLabels, COLORS } from './world.js';
import { buildSkillParticles, buildDust, groupCenters } from './particles.js';
import { buildPhotos } from './photos.js';
import { skyVert, skyFrag } from './shaders.js';
import { createRig } from './rig.js';

const smoothstep = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));

/** Cede el hilo principal para no encadenar tareas largas durante la carga. */
const tick = () => (self.scheduler && scheduler.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0)));

function pickTier(small) {
    if (small) return 'low';
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 8;
    return cores <= 4 || mem <= 4 ? 'mid' : 'high';
}

export async function initScene(stage) {
    const canvas = document.getElementById('scene');
    const smallMQ = matchMedia('(max-width: 47.99rem)');          // equipo móvil: escena ligera
    const layoutMQ = matchMedia('(max-width: 61.99rem)');         // contenido abajo, escena arriba
    const reduced = prefersReducedMotion();
    let tier = pickTier(smallMQ.matches);
    const touchOnly = matchMedia('(hover: none)').matches;

    // La tipografía de las etiquetas 3D debe estar lista antes de pintar las texturas de texto
    if (document.fonts && document.fonts.load) {
        try { await Promise.all([document.fonts.load('48px Gloock'), document.fonts.load('600 30px "Hanken Grotesk"')]); } catch (e) { /* se usa la fuente de reserva */ }
    }

    const renderer = new T.WebGLRenderer({ canvas, antialias: tier === 'low', alpha: false, powerPreference: 'high-performance' });
    // el lienzo debe ser siempre opaco: cualquier píxel no finito en el HDR dejaría ver el fondo CSS
    renderer.setClearColor(COLORS.ink, 1);
    renderer.toneMapping = T.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    let dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.25 : 2);
    renderer.setPixelRatio(dpr);

    const scene = new T.Scene();
    scene.background = COLORS.ink;
    const fog = { color: { value: COLORS.ink.clone() }, density: { value: 0.0042 } };
    scene.fog = new T.FogExp2(COLORS.ink, fog.density.value);

    const camera = new T.PerspectiveCamera(40, 16 / 9, 0.1, 500);

    // Cielo: esfera que sigue a la cámara
    const sky = new T.Mesh(
        new T.SphereGeometry(200, 32, 16),
        new T.ShaderMaterial({
            vertexShader: skyVert,
            fragmentShader: skyFrag,
            uniforms: {
                uTop: { value: new T.Color('#080b0f') },
                uHorizon: { value: new T.Color('#1b2533') },
                uBottom: { value: new T.Color('#0c1014') },
                uGlow: { value: new T.Color('#c9814a') }
            },
            side: T.BackSide,
            depthWrite: false,
            depthTest: false,
            fog: false
        })
    );
    sky.renderOrder = -10;
    sky.frustumCulled = false;
    scene.add(sky);

    await tick();

    // ── Mundo (por pasos, cediendo el hilo entre ellos) ──
    const world = await buildWorld({ scene, tier, fog, tick });
    await tick();
    const centers = groupCenters();
    const skillsP = buildSkillParticles({ group: world.group, tier, fog, centers });
    const dust = buildDust({ group: world.group, tier, fog, tStart: world.tStart, tEnd: world.tEnd });
    await tick();
    const labels = buildGroupLabels(world.group, centers);
    const photoItems = buildPhotos({ group: world.group, tier, fog, tStart: world.tStart, tEnd: world.tEnd, nodes: world.nodes });
    const nodes = world.nodes;
    await tick();

    // ── Postprocesado ──
    let composer = null;
    let bloom = null;
    const makeComposer = () => {
        const size = renderer.getSize(new T.Vector2());
        const rt = new T.WebGLRenderTarget(size.x * dpr, size.y * dpr, { type: T.HalfFloatType, samples: tier === 'high' ? 4 : 0 });
        composer = new EffectComposer(renderer, rt);
        composer.setPixelRatio(dpr);
        composer.addPass(new RenderPass(scene, camera));
        bloom = new UnrealBloomPass(new T.Vector2(size.x / 2, size.y / 2), 0.5, 0.65, 0.88);
        composer.addPass(bloom);
        composer.addPass(new OutputPass());
    };

    // ── Cámara guiada ──
    const rig = createRig({ nodes, stage, isSmall: () => layoutMQ.matches });
    const state = { pos: new T.Vector3(), look: new T.Vector3(), fog: 0.004, shiftX: 0, shiftY: 0, labels: 1, time: -0.5, key: 0, node: -1, keyCount: 1 };
    const target = { pos: new T.Vector3(), look: new T.Vector3(), fog: 0, shiftX: 0, shiftY: 0, labels: 1, time: 0, key: 0, node: -1, keyCount: 1 };
    let snap = true;

    // ── DOM sincronizado ──
    const xpItems = [...document.querySelectorAll('.xp')];
    const hud = document.getElementById('hud');
    const hudYear = document.getElementById('hud-year');
    const hudFill = document.getElementById('hud-fill');
    const hudLabel = document.getElementById('hud-label');
    const tip = document.getElementById('node-tip');
    const tipWhen = tip.querySelector('.node-tip__when');
    const tipRole = tip.querySelector('.node-tip__role');
    const tipCo = tip.querySelector('.node-tip__co');
    let activeNode = -1;
    let hoverNode = -1;
    let lastYear = '';

    const setActive = (i) => {
        if (i === activeNode) return;
        activeNode = i;
        xpItems.forEach((el, k) => (k === i ? el.setAttribute('aria-current', 'true') : el.removeAttribute('aria-current')));
        hudLabel.textContent = i >= 0 ? `${nodes[i].e.company}` : 'Recorrido completo';
    };
    // un foco de teclado en una etapa la activa
    xpItems.forEach((el, i) => el.addEventListener('focusin', () => setActive(i)));

    // ── Tamaño ──
    const size = { w: 0, h: 0 };
    function resize() {
        const w = stage.clientWidth;
        const h = Math.round(canvas.clientHeight || innerHeight);
        if (w === size.w && h === size.h) return;
        size.w = w; size.h = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w / h < 0.8 ? 52 : 40;
        camera.updateProjectionMatrix();
        if (composer) { composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); }
        world.lineMats.forEach((m) => m.resolution.set(w * dpr, h * dpr));
        applyPixel();
        rig.measure();
        requestRender();
    }
    function applyPixel() {
        [skillsP.mat, dust.mat, world.haloMat].forEach((m) => { m.uniforms.uPixel.value = dpr; });
    }

    // ── Interacción ──
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false, moved: false, parX: 0, parY: 0 };
    const ray = new T.Raycaster();
    const ndc = new T.Vector2();
    const tmpV = new T.Vector3();
    const hitPoint = new T.Vector3();
    let hoverPhoto = -1;
    let motionX = 0;
    let motionY = 0;
    let tipTimer = 0;

    const overUI = (el) => !!(el && el.closest && el.closest('.panel, a, button, .nav, dialog'));

    addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        pointer.x = e.clientX; pointer.y = e.clientY;
        pointer.nx = (e.clientX / innerWidth) * 2 - 1;
        pointer.ny = (e.clientY / innerHeight) * 2 - 1;
        pointer.inside = !overUI(e.target);
        pointer.moved = true;
        requestRender();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.inside = false; pointer.moved = true; requestRender(); });

    addEventListener('click', (e) => {
        if (overUI(e.target) || !visible) return;
        const r = canvas.getBoundingClientRect();
        const i = pickNode(e.clientX - r.left, e.clientY - r.top, touchOnly ? 1.35 : 1);
        if (i < 0) {
            const ph = photoItems[pickPhoto(e.clientX - r.left, e.clientY - r.top)];
            const btn = ph && document.querySelector(`.shot__btn[data-full*="/${ph.id}-"]`);
            if (btn) btn.click();
            return;
        }
        showTip(i);
        if (touchOnly) { clearTimeout(tipTimer); tipTimer = setTimeout(() => { if (hoverNode === i) setHover(-1); }, 4500); }
        xpItems[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });

    // Giroscopio solo si no requiere permiso explícito (Android); en iOS se omite
    if (touchOnly && 'DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function' && !reduced) {
        addEventListener('deviceorientation', (e) => {
            if (e.gamma == null) return;
            motionX = Math.max(-1, Math.min(1, e.gamma / 30));
            motionY = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 30));
        }, { passive: true });
    }

    function pickNode(px, py, slack = 1) {
        ndc.set((px / size.w) * 2 - 1, -(py / size.h) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        let best = -1;
        let bestD = Infinity;
        nodes.forEach((n, i) => {
            const s = n.hit;
            const sphere = slack === 1 ? s : new T.Sphere(s.center, s.radius * slack);
            if (ray.ray.intersectSphere(sphere, hitPoint)) {
                const d = hitPoint.distanceTo(camera.position);
                if (d < bestD) { bestD = d; best = i; }
            }
        });
        return best;
    }
    function pickPhoto(px, py) {
        ndc.set((px / size.w) * 2 - 1, -(py / size.h) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects(photoItems.map((p) => p.mesh), false);
        return hits.length ? photoItems.findIndex((p) => p.mesh === hits[0].object) : -1;
    }

    function setHover(i) {
        if (i === hoverNode) return;
        hoverNode = i;
        if (i < 0) { tip.hidden = true; canvas.parentElement.style.cursor = ''; return; }
        showTip(i, true);
    }
    function showTip(i, fromHover) {
        const n = nodes[i];
        hoverNode = i;
        tipWhen.textContent = fmtPeriod(n.e.start, n.e.end);
        tipRole.textContent = n.e.roleShort || n.e.role;
        tipCo.textContent = n.e.company;
        tip.hidden = false;
        if (fromHover) canvas.parentElement.style.cursor = 'pointer';
    }
    function placeTip() {
        if (hoverNode < 0) return;
        tmpV.copy(nodes[hoverNode].pos).project(camera);
        const x = (tmpV.x * 0.5 + 0.5) * size.w;
        const y = (-tmpV.y * 0.5 + 0.5) * size.h;
        const r = nodes[hoverNode].radius;
        // tamaño aproximado en pantalla para colocar la etiqueta junto al nodo
        const off = Math.max(18, (r / Math.max(1, camera.position.distanceTo(nodes[hoverNode].pos))) * size.h * 1.1);
        const w = tip.offsetWidth || 240;
        const h = tip.offsetHeight || 80;
        let tx = x + off + 10;
        if (tx + w > size.w - 12) tx = x - off - 10 - w;
        const ty = Math.min(size.h - h - 12, Math.max(64, y - h / 2));
        tip.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px)`;
    }

    // ── Bucle ──
    let visible = true;
    let running = false;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let needs = true;
    let slowFrames = 0;
    let frames = 0;

    function requestRender() {
        needs = true;
        if (!running && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function update(dt) {
        clock += reduced ? 0 : dt;
        const y = scrollY;
        rig.sample(y, target);

        const instant = snap || reduced;
        const k = instant ? 1 : 1 - Math.exp(-dt * 5.5);
        state.pos.lerp(target.pos, k);
        state.look.lerp(target.look, k);
        const ease = (cur, tgt, lambda) => (instant ? tgt : damp(cur, tgt, lambda, dt));
        state.fog = ease(state.fog, target.fog, 3);
        state.shiftX = ease(state.shiftX, target.shiftX, 3);
        state.shiftY = ease(state.shiftY, target.shiftY, 3);
        state.labels = ease(state.labels, target.labels, 3);
        state.time = target.time;
        snap = false;

        camera.position.copy(state.pos);
        camera.lookAt(state.look);
        sky.position.copy(camera.position);

        // parallax: ratón en escritorio, giroscopio en móvil
        const px = reduced ? 0 : (touchOnly ? motionX : pointer.nx);
        const py = reduced ? 0 : (touchOnly ? motionY : pointer.ny);
        pointer.parX = damp(pointer.parX, px, 3, dt);
        pointer.parY = damp(pointer.parY, py, 3, dt);
        camera.translateX(pointer.parX * 0.9);
        camera.translateY(-pointer.parY * 0.55);

        const offX = Math.round(state.shiftX * size.w);
        const offY = Math.round(state.shiftY * size.h);
        camera.setViewOffset(size.w, size.h, offX, offY, size.w, size.h);

        scene.fog.density = state.fog;
        fog.density.value = state.fog;

        // etapa activa / HUD
        const i = target.node;
        if (i !== activeNode) setActive(i);
        const T0 = state.time;
        const year = String(Math.floor(T0 + 2012.5 + 1e-6));
        if (year !== lastYear) { hudYear.textContent = year; lastYear = year; }
        const prog = Math.min(1, Math.max(0, (target.key - 1) / Math.max(1, target.keyCount - 3)));
        hudFill.style.transform = `scaleX(${prog.toFixed(4)})`;
        hud.classList.toggle('hud--on', target.key > 0.6 && target.key < target.keyCount - 1.4);

        // trazo recorrido hasta el instante actual
        const frac = (T0 - world.tStart) / (world.tEnd - world.tStart);
        world.trace.geometry.instanceCount = Math.max(1, Math.floor(Math.min(1, Math.max(0, frac)) * world.traceSegments));

        // nodos
        nodes.forEach((n, idx) => {
            n.active = damp(n.active, idx === activeNode ? 1 : 0, 4, dt);
            n.hover = damp(n.hover, idx === hoverNode ? 1 : 0, 8, dt);
            n.mat.uniforms.uActive.value = n.active;
            n.mat.uniforms.uHover.value = n.hover;
            n.mat.uniforms.uTime.value = clock;
            world.activeAttr.array[idx] = Math.max(n.active, n.hover * 0.7);
            const s = 1 + n.hover * 0.08 + n.active * 0.04;
            n.mesh.scale.setScalar(s);
        });
        world.activeAttr.needsUpdate = true;
        world.haloMat.uniforms.uTime.value = clock;

        // puntos
        skillsP.mat.uniforms.uTime.value = clock;
        dust.mat.uniforms.uTime.value = clock;

        // etiquetas del plano general y años
        labels.forEach((s) => { s.material.opacity = 0.7 * Math.max(0, state.labels); });
        const yearOpacity = 0.35 + 0.65 * (1 - Math.max(0, state.labels));
        world.ticks.forEach((s) => { s.material.opacity = s.userData.base * Math.min(1, yearOpacity) * smoothstep(9, 20, camera.position.distanceTo(s.position)); });

        // hover (ratón)
        if (!touchOnly && pointer.moved) {
            pointer.moved = false;
            if (pointer.inside && visible) {
                const r = canvas.getBoundingClientRect();
                const nx = pointer.x - r.left;
                const ny = pointer.y - r.top;
                const n = pickNode(nx, ny);
                setHover(n);
                hoverPhoto = n < 0 ? pickPhoto(nx, ny) : -1;
            } else {
                setHover(-1);
                hoverPhoto = -1;
            }
        }

        // fotos: se corrigen al acercarse o con hover
        photoItems.forEach((p, idx) => {
            const d = camera.position.distanceTo(p.pos);
            const near = smoothstep(17, 7.5, d);
            const t = Math.max(near, idx === hoverPhoto ? 1 : 0);
            p.reveal = reduced ? Math.max(0.55, t) : damp(p.reveal, t, 3.2, dt);
            p.mat.uniforms.uReveal.value = p.reveal;
            p.mat.uniforms.uTime.value = clock;
        });
        if (hoverPhoto >= 0) canvas.parentElement.style.cursor = 'zoom-in';
        else if (hoverNode < 0 && !touchOnly) canvas.parentElement.style.cursor = '';

        placeTip();
    }

    function draw() {
        if (composer) composer.render();
        else renderer.render(scene, camera);
    }

    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        draw();
        // degradación automática si el equipo no llega
        if (!reduced && tier !== 'low' && ++frames > 40 && frames < 160) {
            if (dt > 0.032) slowFrames++;
            if (frames === 159 && slowFrames > 70) downgrade();
        }
        const animating = !reduced;
        if (animating && visible && !document.hidden) {
            running = true;
            raf = requestAnimationFrame(frame);
        } else {
            running = false;
            needs = false;
        }
    }

    function downgrade() {
        tier = 'mid';
        dpr = Math.min(dpr, 1.25);
        renderer.setPixelRatio(dpr);
        if (composer) { composer.setPixelRatio(dpr); composer.setSize(size.w, size.h); }
        world.lineMats.forEach((m) => m.resolution.set(size.w * dpr, size.h * dpr));
        applyPixel();
        if (bloom) bloom.strength = 0.5;
    }

    function startLoop() {
        if (running) return;
        last = performance.now();
        running = true;
        raf = requestAnimationFrame(frame);
    }

    // Pausa cuando la escena no es visible o la pestaña está oculta
    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) { if (!reduced) startLoop(); else requestRender(); }
        else { cancelAnimationFrame(raf); running = false; }
    }, { threshold: 0 }).observe(stage.querySelector('.stage__sticky'));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(raf); running = false; }
        else if (visible) { if (!reduced) startLoop(); else requestRender(); }
    });

    addEventListener('scroll', () => requestRender(), { passive: true });
    new ResizeObserver(() => resize()).observe(stage);
    addEventListener('resize', () => resize());
    layoutMQ.addEventListener('change', () => { size.w = 0; resize(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { rig.measure(); requestRender(); });

    resize();
    snap = true;
    update(0.016);
    // compila los shaders en paralelo (KHR_parallel_shader_compile) antes del primer dibujo
    if (renderer.compileAsync) { try { await renderer.compileAsync(scene, camera); } catch (e) { /* se compilará al dibujar */ } }
    await tick();
    if (tier !== 'low') { makeComposer(); await tick(); }
    resize();
    draw();
    if (!reduced) startLoop();

    // utilidades de depuración / pruebas visuales
    window.__scene = {
        camera, state, nodes, photoItems, renderer, rig, get tier() { return tier; },
        /** Avanza n pasos de dt segundos y dibuja (pruebas con la pestaña en segundo plano). */
        step(n = 1, dt = 0.05) { for (let i = 0; i < n; i++) update(dt); draw(); }
    };
}
