/** Fotos del álbum como planos con shader: duotono + desenfoque + ruido que se corrigen al acercarse o con hover. */
import * as T from '../../vendor/three/three.min.js';
import { scenePhotos, photos } from '../data.js';
import { pathPoint, pathTangent, COLORS } from './world.js';
import { photoVert, photoFrag } from './shaders.js';

// Punto focal del crop (0..1) y formato del plano
const LAYOUT = {
    'niebla': { w: 4.6, h: 3.2, focus: [0.5, 0.5] },
    'roca': { w: 3.6, h: 4.4, focus: [0.4, 0.45] },
    'baobab': { w: 3.4, h: 4.6, focus: [0.55, 0.55] },
    'atardecer': { w: 5.0, h: 3.1, focus: [0.5, 0.5] },
    'cascada': { w: 3.6, h: 4.5, focus: [0.4, 0.5] },
    'retrato-bn': { w: 3.5, h: 4.4, focus: [0.5, 0.42] },
    'jardin': { w: 3.3, h: 4.6, focus: [0.5, 0.5] },
    'turbante': { w: 3.4, h: 4.5, focus: [0.5, 0.45] }
};

export function buildPhotos({ group, tier, fog, tStart, tEnd, nodes }) {
    const ids = tier === 'low' ? scenePhotos.filter((_, i) => i % 2 === 0) : scenePhotos;
    const loader = new T.TextureLoader();
    const up = new T.Vector3(0, 1, 0);
    const first = nodes[0].t;
    const last = nodes[nodes.length - 1].t;
    const items = [];

    ids.forEach((id, k) => {
        const meta = photos.find((p) => p.id === id);
        const lay = LAYOUT[id];
        // reparte los planos a lo largo del camino, entre nodos, alternando lado
        const u = (k + 0.55) / ids.length;
        const t = first + (last - first) * u + (k % 2 ? 0.35 : -0.2);
        const side = k % 2 ? 1 : -1;
        const p = pathPoint(t);
        const tan = pathTangent(t);
        const right = new T.Vector3().crossVectors(tan, up).normalize();
        const off = 9.6 + (k % 3) * 1.4;
        const pos = p.clone().addScaledVector(right, side * off);
        pos.y += (k % 3 - 1) * 1.1 + 0.3;

        const tex = loader.load(`img/tex/${id}.webp`);
        tex.colorSpace = T.SRGBColorSpace;
        tex.minFilter = T.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = 4;

        const aspect = lay.w / lay.h;
        const cover = aspect >= 1 ? new T.Vector2(1, 1 / aspect) : new T.Vector2(aspect, 1);
        const mat = new T.ShaderMaterial({
            vertexShader: photoVert,
            fragmentShader: photoFrag,
            uniforms: {
                uTex: { value: tex },
                uTime: { value: 0 },
                uReveal: { value: 0 },
                uCover: { value: cover },
                uFocus: { value: new T.Vector2(...lay.focus) },
                uDark: { value: new T.Color('#1b2533') },
                uMid: { value: new T.Color('#5d7391') },
                uLight: { value: new T.Color('#e2dccf') },
                uSeed: { value: k * 7.13 },
                uFogColor: fog.color,
                uFogDensity: fog.density
            },
            transparent: true,
            depthWrite: false,
            side: T.DoubleSide
        });
        const mesh = new T.Mesh(new T.PlaneGeometry(lay.w, lay.h, 14, 18), mat);
        mesh.position.copy(pos);
        // de cara al viajero (mirando hacia atrás por el camino) con un giro suave hacia el eje
        const normal = tan.clone().multiplyScalar(-1).addScaledVector(right, -side * 0.55).normalize();
        mesh.lookAt(pos.clone().addScaledVector(normal, 10));
        mesh.rotateZ((k % 3 - 1) * 0.04);
        mesh.userData.photo = { id, meta };
        group.add(mesh);
        items.push({ id, mesh, mat, reveal: 0, hover: 0, pos, w: lay.w, h: lay.h, caption: meta ? meta.caption : '' });
    });
    return items;
}
