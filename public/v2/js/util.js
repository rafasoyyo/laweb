/** Utilidades compartidas (fechas del perfil, formato, helpers de DOM). */

const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'];

export const now = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const parts = (ym) => ym.split('-').map(Number);

/** Meses entre dos AAAA-MM contando ambos extremos (igual que LinkedIn). */
export const monthsBetween = (start, end) => {
    const [y1, m1] = parts(start);
    const [y2, m2] = parts(end || now());
    return (y2 - y1) * 12 + (m2 - m1) + 1;
};

export const fmtDuration = (months) => {
    const y = Math.floor(months / 12);
    const m = months % 12;
    const ys = y ? `${y} ${y === 1 ? 'año' : 'años'}` : '';
    const ms = m ? `${m} ${m === 1 ? 'mes' : 'meses'}` : '';
    return [ys, ms].filter(Boolean).join(' ');
};

export const fmtMonth = (ym) => {
    const [y, m] = parts(ym);
    return `${MESES[m - 1]} ${y}`;
};

export const fmtPeriod = (start, end) => `${fmtMonth(start)} – ${end ? fmtMonth(end) : 'actualidad'}`;

/** Tiempo decimal en años (2012.5 = mitad de 2012) del inicio del mes dado. */
export const yearFrac = (ym) => {
    const [y, m] = parts(ym);
    return y + (m - 1) / 12;
};

export const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
