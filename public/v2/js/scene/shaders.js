/** GLSL de la escena. Niebla manual (exp²) para que los shaders propios encajen con el resto. */

const FOG_FRAG_PARS = /* glsl */ `
    uniform vec3 uFogColor;
    uniform float uFogDensity;
    float fogFactor(float depth) {
        float d = uFogDensity * depth;
        return 1.0 - exp(-d * d);
    }
`;

const NOISE = /* glsl */ `
    float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }
    float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
                   mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
    }
`;

/* ───────── Partículas de skills: órbitas por categoría ───────── */
export const skillsVert = /* glsl */ `
    attribute vec4 aOrbit;   // radio, ángulo inicial, velocidad, inclinación
    attribute vec3 aMisc;    // fase, tamaño, grupo
    uniform float uTime;
    uniform float uPixel;
    uniform vec3 uCenter[6];
    uniform vec3 uColor[6];
    uniform float uBoost;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDepth;
    void main() {
        int g = int(aMisc.z + 0.5);
        float a = aOrbit.y + uTime * aOrbit.z;
        vec3 p = vec3(cos(a), 0.0, sin(a)) * aOrbit.x;
        float ci = cos(aOrbit.w), si = sin(aOrbit.w);
        p = vec3(p.x, p.y * ci - p.z * si, p.y * si + p.z * ci);
        p.y += sin(a * 2.0 + aMisc.x) * 0.22;
        vec3 world = uCenter[g] + p;
        vec4 mv = modelViewMatrix * vec4(world, 1.0);
        vDepth = -mv.z;
        vColor = uColor[g];
        float tw = 0.65 + 0.35 * sin(uTime * 1.3 + aMisc.x * 6.2831);
        vAlpha = tw * smoothstep(0.8, 5.0, -mv.z);
        gl_PointSize = min(aMisc.y * uPixel * (26.0 / max(-mv.z, 1.0)) * uBoost, 46.0 * uPixel);
        gl_Position = projectionMatrix * mv;
    }
`;

export const dustVert = /* glsl */ `
    attribute vec3 aMisc;    // fase, tamaño, brillo
    uniform float uTime;
    uniform float uPixel;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDepth;
    void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.12 + aMisc.x * 12.0) * 0.5;
        p.y += cos(uTime * 0.10 + aMisc.x * 9.0) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        vColor = vec3(0.93, 0.9, 0.85);
        vAlpha = aMisc.z * (0.55 + 0.45 * sin(uTime * 0.8 + aMisc.x * 20.0)) * smoothstep(1.0, 6.0, -mv.z);
        gl_PointSize = min(aMisc.y * uPixel * (22.0 / max(-mv.z, 1.0)), 18.0 * uPixel);
        gl_Position = projectionMatrix * mv;
    }
`;

export const pointsFrag = /* glsl */ `
    ${FOG_FRAG_PARS}
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDepth;
    void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        a = a * a;
        float f = fogFactor(vDepth);
        gl_FragColor = vec4(vColor * 1.25, a * vAlpha * (1.0 - f));
        #include <colorspace_fragment>
    }
`;

/* ───────── Nodos: globos con retícula cartográfica ───────── */
export const nodeVert = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec2 vUv;
    varying float vDepth;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = -mv.xyz;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
    }
`;

export const nodeFrag = /* glsl */ `
    ${FOG_FRAG_PARS}
    uniform vec3 uColor;
    uniform vec3 uBase;
    uniform vec3 uAccent;
    uniform float uActive;
    uniform float uHover;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec2 vUv;
    varying float vDepth;
    void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.2);
        vec2 g = vec2(vUv.x * 24.0, vUv.y * 12.0);
        vec2 gl = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-4));
        float line = 1.0 - min(min(gl.x, gl.y), 1.0);
        float lit = 0.45 + 0.55 * clamp(dot(n, normalize(vec3(-0.4, 0.7, 0.6))), 0.0, 1.0);
        vec3 hue = mix(uColor, uAccent, uActive * 0.8);
        vec3 col = uBase * (0.6 + 0.6 * lit);
        col += hue * (fres * (1.0 + uActive * 0.9) + line * (0.2 + uActive * 0.4 + uHover * 0.35) * lit);
        col += hue * (uActive * 0.06 + uHover * 0.08);
        float f = fogFactor(vDepth);
        col = mix(col, uFogColor, f);
        gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
`;

/* Halos de los nodos (un punto grande por nodo, aditivo) */
export const haloVert = /* glsl */ `
    attribute float aSize;
    attribute float aActive;
    attribute vec3 aColor;
    uniform float uPixel;
    uniform float uTime;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDepth;
    void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        vColor = aColor;
        float pulse = 1.0 + aActive * 0.12 * sin(uTime * 2.2);
        vAlpha = (0.16 + aActive * 0.42) * smoothstep(0.5, 4.0, -mv.z);
        gl_PointSize = min(aSize * uPixel * (60.0 / max(-mv.z, 1.0)) * pulse * (1.0 + aActive * 0.4), 640.0 * uPixel);
        gl_Position = projectionMatrix * mv;
    }
`;

export const haloFrag = /* glsl */ `
    ${FOG_FRAG_PARS}
    varying vec3 vColor;
    varying float vAlpha;
    varying float vDepth;
    void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(1.0 - d, 0.0), 2.4);
        float ring = (1.0 - smoothstep(0.5, 0.52, d)) * smoothstep(0.44, 0.5, d) * 0.5;
        float f = fogFactor(vDepth);
        gl_FragColor = vec4(vColor * 1.15, (a * 0.7 + ring) * vAlpha * (1.0 - f * 0.6));
        #include <colorspace_fragment>
    }
`;

/* ───────── Fotos: crop, desenfoque, ruido y duotono que se corrige al acercarse ───────── */
export const photoVert = /* glsl */ `
    uniform float uTime;
    uniform float uReveal;
    varying vec2 vUv;
    varying float vDepth;
    void main() {
        vUv = uv;
        vec3 p = position;
        float w = sin(p.x * 1.1 + uTime * 0.5) * cos(p.y * 0.9 + uTime * 0.4);
        p.z += w * 0.22 * (1.0 - uReveal * 0.8);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
    }
`;

export const photoFrag = /* glsl */ `
    ${FOG_FRAG_PARS}
    ${NOISE}
    uniform sampler2D uTex;
    uniform float uTime;
    uniform float uReveal;
    uniform vec2 uCover;
    uniform vec2 uFocus;
    uniform vec3 uDark;
    uniform vec3 uMid;
    uniform vec3 uLight;
    uniform float uSeed;
    varying vec2 vUv;
    varying float vDepth;
    void main() {
        float un = 1.0 - uReveal;
        vec2 uv = vUv;
        // distorsión por ruido que se calma al revelar
        float n1 = vnoise(uv * 5.0 + uSeed + uTime * 0.12);
        float n2 = vnoise(uv * 9.0 - uSeed - uTime * 0.09);
        uv += (vec2(n1, n2) - 0.5) * 0.045 * un;
        // cortes horizontales sutiles
        uv.x += (hash21(vec2(floor(uv.y * 38.0), floor(uTime * 1.5 + uSeed))) - 0.5) * 0.012 * un * un;
        // crop tipo "cover" con punto focal
        vec2 cuv = (uv - 0.5) * uCover + 0.5 + (uFocus - 0.5) * (1.0 - uCover);
        // desenfoque de 9 taps
        float r = (0.0015 + 0.013 * un);
        vec3 col = texture2D(uTex, cuv).rgb * 0.25;
        col += texture2D(uTex, cuv + vec2( r, 0.0)).rgb * 0.125;
        col += texture2D(uTex, cuv + vec2(-r, 0.0)).rgb * 0.125;
        col += texture2D(uTex, cuv + vec2(0.0,  r)).rgb * 0.125;
        col += texture2D(uTex, cuv + vec2(0.0, -r)).rgb * 0.125;
        col += texture2D(uTex, cuv + vec2( r,  r) * 0.7).rgb * 0.0625;
        col += texture2D(uTex, cuv + vec2(-r,  r) * 0.7).rgb * 0.0625;
        col += texture2D(uTex, cuv + vec2( r, -r) * 0.7).rgb * 0.0625;
        col += texture2D(uTex, cuv + vec2(-r, -r) * 0.7).rgb * 0.0625;
        // duotono tinta → ámbar
        float l = pow(dot(col, vec3(0.299, 0.587, 0.114)), 0.65);
        vec3 duo = mix(uDark, uMid, smoothstep(0.02, 0.55, l));
        duo = mix(duo, uLight, smoothstep(0.5, 1.0, l));
        float k = uReveal * uReveal * (3.0 - 2.0 * uReveal);
        vec3 outc = mix(duo, col, k);
        // grano
        outc += (hash21(gl_FragCoord.xy + uTime) - 0.5) * 0.035 * (0.4 + un);
        // bordes suaves + filete
        float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float mask = smoothstep(0.0, 0.05, edge);
        float frame = 1.0 - smoothstep(0.0, 0.004, abs(edge - 0.006));
        outc = mix(outc, vec3(0.93, 0.9, 0.85), frame * 0.55);
        float f = fogFactor(vDepth);
        float alpha = mask * (0.55 + 0.45 * uReveal) * (1.0 - f) * smoothstep(7.0, 15.0, vDepth);
        gl_FragColor = vec4(outc * 0.92, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
`;

/* ───────── Cielo: bruma azulada y un brillo cálido hacia el futuro (-z) ───────── */
export const skyVert = /* glsl */ `
    varying vec3 vDir;
    void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
    }
`;

export const skyFrag = /* glsl */ `
    ${NOISE}
    uniform vec3 uTop;
    uniform vec3 uHorizon;
    uniform vec3 uBottom;
    uniform vec3 uGlow;
    varying vec3 vDir;
    void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c = mix(uHorizon, uTop, smoothstep(0.0, 0.7, h));
        c = mix(c, uBottom, 1.0 - smoothstep(-0.55, 0.0, h));
        float band = 1.0 - smoothstep(0.0, 0.32, abs(h - 0.02));
        float g = pow(max(dot(d, normalize(vec3(-0.45, 0.0, -1.0))), 0.0), 26.0);
        c += uGlow * g * band * 0.24;
        float g2 = pow(max(dot(d, normalize(vec3(0.7, 0.0, 0.3))), 0.0), 8.0);
        c += uHorizon * g2 * band * 0.25;
        c += (hash21(gl_FragCoord.xy) - 0.5) * 0.004;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
`;
