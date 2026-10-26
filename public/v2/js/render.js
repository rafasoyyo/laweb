/** Pinta las secciones a partir de data.js. No hay contenido de perfil fuera de ese archivo. */
import {
    person, about, links, experience, skills, skillGroups, education, training,
    certifications, projects, languages, photos, galleryCount
} from './data.js';
import { $, esc, monthsBetween, fmtDuration, fmtPeriod, yearFrac, now } from './util.js';

const list = (items, cls) => `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

export function renderAbout() {
    $('#about-body').innerHTML =
        about.map((p) => `<p>${esc(p)}</p>`).join('') +
        `<p class="about__quote" lang="en">${esc(person.motto)}</p>`;
}

export function renderExperience() {
    $('#exp-list').innerHTML = experience.map((e, i) => {
        const months = monthsBetween(e.start, e.end);
        const title = e.roleShort || e.role;
        const where = [e.place].filter(Boolean).join(' · ');
        return `
        <li class="xp" data-index="${i}" data-id="${esc(e.id)}" tabindex="0" aria-label="${esc(title)}, ${esc(e.company)}">
            <article class="panel" data-reveal>
                <p class="xp__when">
                    <span>${esc(fmtPeriod(e.start, e.end))}</span>
                    <span>${esc(fmtDuration(months))}</span>
                    ${e.end ? '' : '<span class="xp__badge">Actual</span>'}
                </p>
                <h3 class="xp__role">${esc(title)}</h3>
                <p class="xp__co">${esc(e.company)}${where ? ` <span>· ${esc(where)}</span>` : ''}</p>
                ${e.roleShort ? `<p class="xp__sum" lang="en">${esc(e.role)}</p>` : ''}
                ${e.summary ? `<p class="xp__sum">${esc(e.summary)}</p>` : ''}
                ${e.stack.length ? list(e.stack, 'xp__stack') : ''}
            </article>
        </li>`;
    }).join('');
}

export function renderMatrix() {
    const total = experience.reduce((a, e) => a + monthsBetween(e.start, e.end), 0);
    const roles = experience.map((e) => {
        const m = monthsBetween(e.start, e.end);
        const co = e.company === 'Programador independiente' ? 'Independiente' : e.company;
        const role = e.roleShort || e.role;
        const year = String(parseInt(e.start, 10));
        // el nombre accesible empieza por el texto visible (WCAG 2.5.3) y añade el periodo completo
        const label = `${co} · ${role} · ${year}. ${fmtPeriod(e.start, e.end)}`;
        return `<li><button class="matrix__role" type="button" aria-pressed="false" data-id="${esc(e.id)}" data-kind="${e.kind}" data-m="${m}" aria-label="${esc(label)}"><span class="matrix__name" aria-hidden="true">${esc(co)}<em> · ${esc(role)} · ${year}</em></span></button></li>`;
    }).join('');

    const groups = skillGroups.map((g) => {
        const items = skills.filter((s) => s.group === g.id);
        return `
        <section class="group" aria-label="${esc(g.label)}">
            <h3 class="group__title">${esc(g.label)} <span class="group__count">${items.length}</span></h3>
            <ul class="group__list">
                ${items.map((s) => `
                <li><button class="skill${s.uses ? '' : ' skill--hollow'}" type="button" aria-pressed="false" data-skill="${esc(s.name)}" data-u="${s.uses || 0}">
                    <span class="skill__dot" aria-hidden="true"></span>${esc(s.name)}</button></li>`).join('')}
            </ul>
        </section>`;
    }).join('');

    $('#matrix').innerHTML = `
        <div>
            <ol class="matrix__roles" id="matrix-roles" aria-label="Puestos, ordenados en el tiempo y con ancho proporcional a su duración">${roles}</ol>
            <div class="matrix__axis" aria-hidden="true"><span>${esc(String(yearFrac(person.careerStart) | 0))}</span><span>${esc(String(parseInt(now(), 10)))}</span></div>
        </div>
        <p class="matrix__detail" id="matrix-detail" aria-live="polite"><strong>Elige un puesto o una aptitud</strong><span>Los datos son los que LinkedIn asocia a cada etapa.</span></p>
        <div class="matrix__groups">${groups}</div>`;
    return total;
}

export function renderEducation() {
    const row = (r, cls = '') => `
        <li class="row ${cls}">
            <p class="row__when">${esc(r.period)}</p>
            <div>
                <h4 class="row__title">${esc(r.title)}</h4>
                <p class="row__sub">${esc(r.school)}</p>
                ${r.note ? `<p class="row__note">${esc(r.note)}</p>` : ''}
            </div>
        </li>`;
    const cert = (c) => `
        <li class="row">
            <p class="row__when">${esc(c.issued)}</p>
            <div>
                <h4 class="row__title">${esc(c.title)}</h4>
                <p class="row__sub">${esc(c.issuer)}</p>
                <p class="row__note">Vencimiento: ${esc(c.expires)}</p>
            </div>
        </li>`;
    $('#edu-grid').innerHTML = `
        <div class="edu__col">
            <div><h3 class="list-title">Educación</h3><ul>${education.map((r) => row(r)).join('')}</ul></div>
            <div><h3 class="list-title">Formación complementaria</h3><ul>${training.map((r) => row(r, 'row--compact')).join('')}</ul></div>
        </div>
        <div class="edu__col">
            <div><h3 class="list-title">Licencias y certificaciones</h3><ul>${certifications.map(cert).join('')}</ul></div>
            <div><h3 class="list-title">Idiomas</h3><ul>${languages.map((l) => `<li class="row row--compact"><div><h4 class="row__title">${esc(l.name)}</h4></div></li>`).join('')}</ul></div>
        </div>`;
}

export function renderFigures() {
    const years = Math.floor((Date.parse(now() + '-01') - Date.parse(person.careerStart + '-01')) / (365.25 * 864e5));
    const companies = new Set(experience.filter((e) => e.kind !== 'own' && e.kind !== 'intern').map((e) => e.company.toLowerCase())).size;
    const lead = experience.filter((e) => e.kind === 'lead' || e.kind === 'cto');
    const figs = [
        { n: years, u: '', l: `años de experiencia profesional, desde ${person.careerStart.slice(0, 4)}` },
        { n: companies, u: '', l: 'empresas por las que he pasado' },
        { n: experience.length, u: '', l: 'puestos en mi perfil, incluidas unas prácticas y mi etapa independiente' },
        { n: lead.length, u: '', l: `roles de liderazgo: ${lead.map((e) => e.roleShort || e.role).join(' y ')}` },
        { n: certifications.length, u: '', l: `certificaciones: ${certifications.map((c) => c.issuer.replace(/ \(.*\)/, '')).join(' y ')}` }
    ];
    $('#figures').innerHTML = figs.map((f) => `
        <div class="fig"><dt class="fig__l">${esc(f.l)}</dt><dd class="fig__n" data-count="${f.n}">${f.n}</dd></div>`).join('');

    $('#projects').innerHTML = `<h3 class="list-title">Proyectos</h3>` + projects.map((p) => `
        <article class="project">
            <p class="project__when">${esc(p.period)}</p>
            <h4 class="project__name">${esc(p.name)}</h4>
            <div>
                <p class="project__text">${esc(p.text)}</p>
                ${p.stack.length ? list(p.stack, 'project__stack') : ''}
            </div>
        </article>`).join('');
}

/** Mezcla Fisher-Yates: cada carga de la página sortea qué fotos del álbum se muestran. */
function pickRandom(list, n) {
    const a = [...list];
    const rnd = new Uint32Array(a.length);
    (self.crypto || {}).getRandomValues ? crypto.getRandomValues(rnd) : rnd.forEach((_, i) => { rnd[i] = Math.random() * 4294967296; });
    for (let i = a.length - 1; i > 0; i--) {
        const j = rnd[i] % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
}

export function renderGallery() {
    $('#gallery').innerHTML = pickRandom(photos, galleryCount).map((p, i) => {
        const set = (ext) => p.sizes.map((w) => `img/personal/${p.id}-${w}.${ext} ${w}w`).join(', ');
        const mid = p.sizes.includes(960) ? 960 : p.sizes[p.sizes.length - 1];
        const sizes = '(min-width: 62rem) 30vw, (min-width: 36rem) 46vw, 92vw';
        const big = p.sizes[p.sizes.length - 1];
        return `
        <li class="shot">
            <figure>
                <button class="shot__btn" type="button" data-full="img/personal/${p.id}-${big}.webp" data-alt="${esc(p.alt)}" data-cap="${esc(p.caption)}" aria-label="Ampliar: ${esc(p.alt)}">
                    <picture>
                        <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
                        <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
                        <img src="img/personal/${p.id}-${mid}.webp" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async">
                    </picture>
                </button>
                <figcaption><span>${esc(p.caption)}</span><span class="num">${String(i + 1).padStart(2, '0')}</span></figcaption>
            </figure>
        </li>`;
    }).join('');
}

export function renderContact() {
    const email = links.email.join('@');
    $('#contact-links').innerHTML = `
        <li><a class="contact__link" href="${esc(links.linkedin)}" rel="me noopener" target="_blank">LinkedIn <small>/in/rafael-hernandez-navarro</small></a></li>
        <li><a class="contact__link" href="mailto:${esc(email)}">Correo <small>${esc(email)}</small></a></li>`;
}

export function renderAll() {
    renderAbout();
    renderExperience();
    renderMatrix();
    renderEducation();
    renderFigures();
    renderGallery();
    renderContact();
}
