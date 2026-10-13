/** Cámara guiada por scroll: planos clave (general → 2012 → cada nodo → general) con curvas suaves. */
import * as T from '../../vendor/three/three.min.js';
import { pathPoint, pathTangent } from './world.js';

const UP = new T.Vector3(0, 1, 0);
const smoother = (f) => f * f * f * (f * (f * 6 - 15) + 10);

export function createRig({ nodes, stage, isSmall }) {
    let keys = [];
    let posCurve = null;
    let lookCurve = null;

    const center = pathPoint((nodes[0].t + nodes[nodes.length - 1].t) / 2);

    const overview = (high) => ({
        pos: center.clone().add(new T.Vector3(high ? 66 : 92, high ? 52 : 26, high ? 34 : 14)),
        look: center.clone().add(new T.Vector3(0, -1, 0)),
        fog: 0.0042,
        shiftX: -0.17,
        shiftY: 0,
        labels: 1,
        time: null
    });

    // Hero: mirando por el camino desde antes de 2012, con el futuro desvaneciéndose en la niebla
    const heroPose = () => {
        const t0 = -0.5;
        const tan = pathTangent(t0);
        const right = new T.Vector3().crossVectors(tan, UP).normalize();
        const p = pathPoint(t0);
        return {
            pos: p.clone().addScaledVector(tan, -12).addScaledVector(right, -6.5).add(new T.Vector3(0, 4.2, 0)),
            look: pathPoint(6.8).add(new T.Vector3(3.2, -0.6, 0)),
            fog: 0.0085,
            shiftX: -0.1,
            shiftY: 0,
            labels: 1,
            time: -0.5
        };
    };

    const nodePose = (n) => {
        const tan = pathTangent(n.t);
        const right = new T.Vector3().crossVectors(tan, UP).normalize();
        const back = 7.2 + n.radius * 2.8;
        const pos = n.pos.clone().addScaledVector(tan, -back).addScaledVector(right, 2.6 + n.radius * 0.6);
        pos.y += 1.7 + n.radius * 0.5;
        return {
            pos,
            look: n.pos.clone().addScaledVector(tan, 1.2),
            fog: 0.021,
            shiftX: 0.2,
            shiftY: 0,
            labels: 0,
            time: n.t
        };
    };

    const aboutPose = () => {
        const n = nodes[0];
        const tan = pathTangent(n.t - 1.2);
        const p = pathPoint(n.t - 1.2);
        const right = new T.Vector3().crossVectors(tan, UP).normalize();
        return {
            pos: p.clone().addScaledVector(tan, -15).addScaledVector(right, 7).add(new T.Vector3(0, 4.6, 0)),
            look: p.clone().addScaledVector(tan, 6),
            fog: 0.013,
            shiftX: 0.16,
            shiftY: 0,
            labels: 0.0,
            time: -0.5
        };
    };

    /** Mide posiciones de scroll de cada plano clave a partir del DOM. */
    function measure() {
        const vh = innerHeight;
        const top = (el) => el.getBoundingClientRect().top + scrollY;
        const mid = (el) => top(el) + el.offsetHeight / 2 - vh / 2;
        const aboutEl = document.getElementById('sobre-mi');
        const items = [...document.querySelectorAll('.xp')];
        const small = isSmall();

        const hero = heroPose();
        const about = aboutPose();
        const finale = overview(true);
        finale.time = nodes[nodes.length - 1].t1;
        hero.time = -0.5;
        if (small) {
            // móvil: el contenido ocupa la parte baja, la escena se eleva
            hero.shiftX = 0; hero.shiftY = 0.2;
            about.shiftX = 0; about.shiftY = 0.22;
            finale.shiftX = 0; finale.shiftY = 0.0;
            hero.look.add(new T.Vector3(0, 0, -6));
            finale.pos.addScaledVector(finale.pos.clone().sub(center).normalize(), 40);
        }

        const list = [{ y: 0, ...hero }, { y: mid(aboutEl), ...about }];
        nodes.forEach((n, i) => {
            const p = nodePose(n);
            if (small) { p.shiftX = 0; p.shiftY = 0.21; }
            list.push({ y: mid(items[i]), ...p });
        });
        const end = top(stage) + stage.offsetHeight - vh;
        list.push({ y: Math.max(end, list[list.length - 1].y + vh * 0.5), ...finale });

        // asegura orden estrictamente creciente
        for (let i = 1; i < list.length; i++) if (list[i].y <= list[i - 1].y) list[i].y = list[i - 1].y + 1;
        keys = list;
        posCurve = new T.CatmullRomCurve3(keys.map((k) => k.pos), false, 'centripetal');
        lookCurve = new T.CatmullRomCurve3(keys.map((k) => k.look), false, 'centripetal');
    }

    const tmpPos = new T.Vector3();
    const tmpLook = new T.Vector3();

    /** Estado de cámara para una posición de scroll (y). */
    function sample(y, out) {
        if (!keys.length) measure();
        const last = keys.length - 1;
        let k = 0;
        while (k < last - 1 && y >= keys[k + 1].y) k++;
        const a = keys[k];
        const b = keys[k + 1];
        const f = Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y)));
        const e = smoother(f);
        const u = (k + e) / last;
        posCurve.getPoint(u, tmpPos);
        lookCurve.getPoint(u, tmpLook);
        out.pos.copy(tmpPos);
        out.look.copy(tmpLook);
        out.fog = a.fog + (b.fog - a.fog) * e;
        out.shiftX = a.shiftX + (b.shiftX - a.shiftX) * e;
        out.shiftY = a.shiftY + (b.shiftY - a.shiftY) * e;
        out.labels = a.labels + (b.labels - a.labels) * e;
        out.time = a.time + (b.time - a.time) * e;
        out.key = k + e;                 // índice de clave continuo
        // nodo más cercano al centro de la pantalla (claves 2..n+1 son nodos)
        const near = Math.round(k + e);
        out.node = near >= 2 && near <= keys.length - 2 ? near - 2 : -1;
        out.keyCount = keys.length;
        return out;
    }

    return { measure, sample };
}
