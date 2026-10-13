/** Geometría del mundo: camino 2012→hoy, nodos, trazos luminosos, marcas de año y etiquetas. */
import * as T from '../../vendor/three/three.min.js';
import { Line2, LineGeometry, LineMaterial } from '../../vendor/three/three.min.js';
import { experience, skillGroups } from '../data.js';
import { monthsBetween, now, yearFrac } from '../util.js';
import { nodeVert, nodeFrag, haloVert, haloFrag } from './shaders.js';

export const UNITS_PER_YEAR = 7;
const ORIGIN = 2012.5;

export const COLORS = {
    ink: new T.Color('#111519'),
    ink2: new T.Color('#232b33'),
    bone: new T.Color('#eee6d8'),
    amber: new T.Color('#e5a66b'),
    amber2: new T.Color('#f2c593'),
    mist: new T.Color('#8fa0be'),
    clay: new T.Color('#a8693f')
};

export const KIND_COLOR = {
    lead: COLORS.amber2,
    cto: COLORS.amber,
    dev: COLORS.bone,
    own: COLORS.mist,
    intern: COLORS.mist
};

export const GROUP_COLOR = {
    backend: COLORS.amber,
    frontend: COLORS.mist,
    cloud: COLORS.bone,
    lead: COLORS.amber2,
    ia: new T.Color('#b9c8e6'),
    negocio: new T.Color('#c98a5b')
};

/** Posición del camino en el instante t (años desde ORIGIN). */
export function pathPoint(t, out = new T.Vector3()) {
    return out.set(
        Math.sin(t * 0.55 + 0.6) * 4.4,
        Math.cos(t * 0.43 + 0.3) * 2.2 + t * 0.1,
        -t * UNITS_PER_YEAR
    );
}

export function pathTangent(t, out = new T.Vector3()) {
    const a = pathPoint(t - 0.02);
    const b = pathPoint(t + 0.02);
    return out.copy(b).sub(a).normalize();
}

const toT = (frac) => frac - ORIGIN;
const endFrac = (e) => (e.end ? yearFrac(e.end) + 1 / 12 : yearFrac(now()) + 1 / 12);

export function buildNodesData() {
    return experience.map((e, i) => {
        const months = monthsBetween(e.start, e.end);
        const t0 = toT(yearFrac(e.start));
        const t1 = toT(endFrac(e));
        const t = (t0 + t1) / 2;
        return {
            i, e, months, t, t0, t1,
            radius: 0.32 + 0.17 * Math.sqrt(months),
            pos: pathPoint(t),
            color: KIND_COLOR[e.kind] || COLORS.bone
        };
    });
}

export async function buildWorld({ scene, tier, fog, tick = async () => {} }) {
    const group = new T.Group();
    scene.add(group);
    const nodesData = buildNodesData();
    const tEnd = nodesData[nodesData.length - 1].t1 + 1.4;
    const tStart = -1.4;

    // Trazo completo (tenue) y trazo recorrido (luminoso)
    const pts = [];
    for (let t = tStart; t <= tEnd; t += 0.06) pts.push(...pathPoint(t).toArray());
    const ghostGeo = new LineGeometry();
    ghostGeo.setPositions(pts);
    const ghostMat = new LineMaterial({ color: COLORS.mist.getHex(), linewidth: 1.5, transparent: true, opacity: 0.55, fog: true });
    ghostMat.color.copy(COLORS.mist);
    const ghost = new Line2(ghostGeo, ghostMat);
    group.add(ghost);

    const traceGeo = new LineGeometry();
    traceGeo.setPositions(pts);
    const traceMat = new LineMaterial({ color: 0xffffff, linewidth: tier === 'low' ? 2.2 : 2.8, transparent: true, opacity: 0.95, fog: true });
    traceMat.color.setRGB(1.5, 0.95, 0.5); // HDR: arrastra al bloom sin quemar
    const trace = new Line2(traceGeo, traceMat);
    group.add(trace);
    const segs = pts.length / 3 - 1;
    await tick();

    // Nodos
    const nodes = nodesData.map((n) => {
        const geo = new T.SphereGeometry(n.radius, tier === 'low' ? 32 : 56, tier === 'low' ? 20 : 36);
        const mat = new T.ShaderMaterial({
            vertexShader: nodeVert,
            fragmentShader: nodeFrag,
            uniforms: {
                uColor: { value: n.color.clone() },
                uBase: { value: COLORS.ink2.clone() },
                uAccent: { value: COLORS.amber.clone() },
                uActive: { value: 0 },
                uHover: { value: 0 },
                uTime: { value: 0 },
                uFogColor: fog.color,
                uFogDensity: fog.density
            },
        });
        const mesh = new T.Mesh(geo, mat);
        mesh.position.copy(n.pos);
        mesh.userData.node = n;
        group.add(mesh);
        // volumen de impacto más generoso para ratón y dedo
        n.mesh = mesh;
        n.mat = mat;
        n.hit = new T.Sphere(n.pos.clone(), n.radius * 1.5 + 0.35);
        n.active = 0;
        n.hover = 0;
        return n;
    });

    await tick();

    // Halos aditivos
    const hg = new T.BufferGeometry();
    hg.setAttribute('position', new T.Float32BufferAttribute(nodes.flatMap((n) => n.pos.toArray()), 3));
    hg.setAttribute('aSize', new T.Float32BufferAttribute(nodes.map((n) => n.radius * 2.6), 1));
    hg.setAttribute('aColor', new T.Float32BufferAttribute(nodes.flatMap((n) => COLORS.amber2.toArray().map((v, j) => v * 0.55 + n.color.toArray()[j] * 0.45)), 3));
    const activeAttr = new T.Float32BufferAttribute(new Float32Array(nodes.length), 1);
    activeAttr.setUsage(T.DynamicDrawUsage);
    hg.setAttribute('aActive', activeAttr);
    const haloMat = new T.ShaderMaterial({
        vertexShader: haloVert,
        fragmentShader: haloFrag,
        uniforms: { uPixel: { value: 1 }, uTime: { value: 0 }, uFogColor: fog.color, uFogDensity: fog.density },
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending
    });
    const halo = new T.Points(hg, haloMat);
    halo.frustumCulled = false;
    group.add(halo);

    await tick();
    // Marcas de año a lo largo del camino
    const ticks = buildYearTicks(group, tStart, tEnd);

    return {
        group, nodes, ghost, trace, traceSegments: segs, halo, haloMat, activeAttr, ticks,
        tStart, tEnd, lineMats: [ghostMat, traceMat]
    };
}

function textTexture(text, { font, size, color, weight = '', w = 256, h = 96, align = 'center' }) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.font = `${weight} ${size}px ${font}`.trim();
    g.fillStyle = color;
    g.textAlign = align;
    g.textBaseline = 'middle';
    g.fillText(text, align === 'center' ? w / 2 : 6, h / 2);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

function buildYearTicks(group, tStart, tEnd) {
    const out = [];
    const font = '"Gloock", Georgia, serif';
    for (let y = 2012; y <= 2026; y++) {
        const t = y - ORIGIN;
        if (t < tStart || t > tEnd) continue;
        const p = pathPoint(t);
        const tex = textTexture(String(y), { font, size: 54, color: '#eee6d8' });
        const mat = new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0.0, depthWrite: false, fog: true });
        const s = new T.Sprite(mat);
        s.scale.set(2.6, 0.98, 1);
        s.position.set(p.x - 1.9, p.y - 1.55, p.z);
        s.userData.base = y % 5 === 0 || y === 2012 ? 0.62 : 0.34;
        group.add(s);
        // pequeña cruz sobre el camino
        const tickGeo = new T.BufferGeometry().setFromPoints([
            new T.Vector3(p.x - 0.28, p.y, p.z), new T.Vector3(p.x + 0.28, p.y, p.z),
            new T.Vector3(p.x, p.y - 0.28, p.z), new T.Vector3(p.x, p.y + 0.28, p.z)
        ]);
        const tick = new T.LineSegments(tickGeo, new T.LineBasicMaterial({ color: COLORS.bone, transparent: true, opacity: 0.35, fog: true }));
        group.add(tick);
        out.push(s);
    }
    return out;
}

/** Etiquetas de categoría sobre los grupos de skills (visibles en planos generales). */
export function buildGroupLabels(group, centers) {
    const font = '"Hanken Grotesk", system-ui, sans-serif';
    return skillGroups.map((g, i) => {
        const tex = textTexture(g.label.toUpperCase(), { font, weight: '600', size: 30, color: '#eee6d8', w: 512, h: 64 });
        const mat = new T.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false });
        const s = new T.Sprite(mat);
        s.scale.set(6.4, 0.8, 1);
        s.position.copy(centers[i]).add(new T.Vector3(0, 4.9, 0));
        group.add(s);
        return s;
    });
}
