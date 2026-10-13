/** Skills como órbitas por categoría + polvo ambiental alrededor del camino. */
import * as T from '../../vendor/three/three.min.js';
import { skills, skillGroups } from '../data.js';
import { pathPoint, pathTangent, GROUP_COLOR } from './world.js';
import { skillsVert, dustVert, pointsFrag } from './shaders.js';

// Posición de cada categoría a lo largo del camino (años desde 2012,5) y lado
const PLACEMENT = {
    frontend: { t: 2.6, side: -1 },
    negocio: { t: 5.2, side: 1 },
    cloud: { t: 7.9, side: -1 },
    backend: { t: 10.4, side: 1 },
    lead: { t: 12.7, side: -1 },
    ia: { t: 14.4, side: 1 }
};

// PRNG determinista: la escena es igual en cada carga
function rng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function groupCenters() {
    const up = new T.Vector3(0, 1, 0);
    return skillGroups.map((g) => {
        const { t, side } = PLACEMENT[g.id];
        const p = pathPoint(t);
        const tan = pathTangent(t);
        const right = new T.Vector3().crossVectors(tan, up).normalize();
        return p.clone().addScaledVector(right, side * 8.2).add(new T.Vector3(0, side * 1.1, 0));
    });
}

export function buildSkillParticles({ group, tier, fog, centers }) {
    const rand = rng(7);
    const perGroupDust = tier === 'high' ? 240 : tier === 'mid' ? 150 : 60;
    const orbit = [];
    const misc = [];
    const idx = [];

    skillGroups.forEach((g, gi) => {
        const items = skills.filter((s) => s.group === g.id);
        const baseTilt = (rand() - 0.5) * 1.1;
        items.forEach((s, k) => {
            const R = 2.4 + (k % 4) * 0.75 + rand() * 0.35;
            const a0 = (k / items.length) * Math.PI * 2 + rand() * 0.4;
            const speed = (0.07 + rand() * 0.06) * (k % 2 ? 1 : -1) * (3.2 / R);
            const size = 5.6 + Math.min(s.uses || 0, 9) * 0.5;   // el tamaño depende de los usos reales del perfil
            orbit.push(R, a0, speed, baseTilt + (rand() - 0.5) * 0.25);
            misc.push(rand(), size, gi);
            idx.push(gi);
        });
        for (let d = 0; d < perGroupDust; d++) {
            const R = 1.6 + rand() * 4.4;
            orbit.push(R, rand() * Math.PI * 2, (0.05 + rand() * 0.1) * (3.2 / R) * (rand() > 0.5 ? 1 : -1), baseTilt + (rand() - 0.5) * 0.5);
            misc.push(rand(), 1.4 + rand() * 1.8, gi);
            idx.push(gi);
        }
    });

    const n = idx.length;
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('aOrbit', new T.Float32BufferAttribute(orbit, 4));
    geo.setAttribute('aMisc', new T.Float32BufferAttribute(misc, 3));
    const mat = new T.ShaderMaterial({
        vertexShader: skillsVert,
        fragmentShader: pointsFrag,
        uniforms: {
            uTime: { value: 0 },
            uPixel: { value: 1 },
            uBoost: { value: 1 },
            uCenter: { value: centers },
            uColor: { value: skillGroups.map((g) => GROUP_COLOR[g.id]) },
            uFogColor: fog.color,
            uFogDensity: fog.density
        },
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending
    });
    const points = new T.Points(geo, mat);
    points.frustumCulled = false;
    group.add(points);
    return { points, mat };
}

export function buildDust({ group, tier, fog, tStart, tEnd }) {
    const rand = rng(21);
    const n = tier === 'high' ? 1900 : tier === 'mid' ? 1100 : 420;
    const pos = new Float32Array(n * 3);
    const misc = new Float32Array(n * 3);
    const tmp = new T.Vector3();
    for (let i = 0; i < n; i++) {
        const t = tStart + rand() * (tEnd - tStart);
        pathPoint(t, tmp);
        const r = 2 + Math.pow(rand(), 0.7) * 17;
        const a = rand() * Math.PI * 2;
        pos[i * 3] = tmp.x + Math.cos(a) * r;
        pos[i * 3 + 1] = tmp.y + (rand() - 0.5) * 14;
        pos[i * 3 + 2] = tmp.z + (rand() - 0.5) * 8;
        misc[i * 3] = rand();
        misc[i * 3 + 1] = 1.1 + rand() * 1.9;
        misc[i * 3 + 2] = 0.25 + rand() * 0.55;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    geo.setAttribute('aMisc', new T.BufferAttribute(misc, 3));
    const mat = new T.ShaderMaterial({
        vertexShader: dustVert,
        fragmentShader: pointsFrag,
        uniforms: { uTime: { value: 0 }, uPixel: { value: 1 }, uFogColor: fog.color, uFogDensity: fog.density },
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending
    });
    const points = new T.Points(geo, mat);
    points.frustumCulled = false;
    group.add(points);
    return { points, mat };
}
