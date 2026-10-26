/** Interacción del DOM: navegación, reveal, cifras, matriz de skills y lightbox. */
import { experience, skills } from './data.js';
import { $, $$, fmtPeriod, prefersReducedMotion } from './util.js';

export function initNav() {
    const nav = $('#nav');
    const toggle = $('.nav__toggle', nav);
    const links = $('#nav-links');

    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('nav--open', open);
        document.documentElement.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', (e) => e.target.closest('a') && setOpen(false));
    addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            nav.classList.toggle('nav--solid', scrollY > 24);
        });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Sección activa en el menú
    const map = new Map($$('a[href^="#"]', links).map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            map.forEach((a) => a.removeAttribute('aria-current'));
            map.get(en.target.id)?.setAttribute('aria-current', 'true');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

export function initReveal() {
    const els = $$('[data-reveal]');
    const reduced = prefersReducedMotion();
    if (reduced || !('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('is-in'));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add('is-in');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        els.forEach((el) => io.observe(el));
    }

    // Cifras: cuenta hasta el valor real al entrar en pantalla
    const nums = $$('[data-count]');
    if (reduced) return;
    const cio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            cio.unobserve(en.target);
            const el = en.target;
            const target = Number(el.dataset.count);
            const t0 = performance.now();
            const step = (t) => {
                const k = Math.min(1, (t - t0) / 1100);
                el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
                if (k < 1) requestAnimationFrame(step);
            };
            el.textContent = '0';
            requestAnimationFrame(step);
            setTimeout(() => { el.textContent = target; }, 1500);   // por si la pestaña no pinta fotogramas
        });
    }, { threshold: 0.6 });
    nums.forEach((n) => cio.observe(n));
}

/** Matriz carrera × aptitudes: pasar el ratón o pulsar para cruzar puestos y skills. */
export function initMatrix() {
    const rolesEl = $('#matrix-roles');
    const detail = $('#matrix-detail');
    const roleBtns = $$('.matrix__role', rolesEl);
    const skillBtns = $$('.skill', $('#matrix'));
    const byRole = new Map(experience.map((e) => [e.id, e]));
    roleBtns.forEach((b) => { b.parentElement.style.flex = `${b.dataset.m} 1 0`; });
    skillBtns.forEach((b) => b.style.setProperty('--u', Math.min(Number(b.dataset.u), 9)));

    // skill -> puestos (explícitos en la skill o en la lista de aptitudes del puesto)
    const skillRoles = new Map();
    skills.forEach((s) => {
        const set = new Set(s.where || []);
        experience.forEach((e) => e.stack.includes(s.name) && set.add(e.id));
        skillRoles.set(s.name, set);
    });
    const roleSkills = (id) => skills.filter((s) => skillRoles.get(s.name).has(id)).map((s) => s.name);

    let pinned = null;
    const setDetail = (title, text) => { detail.innerHTML = ''; const s = document.createElement('strong'); s.textContent = title; const p = document.createElement('span'); p.textContent = text; detail.append(s, p); };

    const showRole = (id) => {
        const e = byRole.get(id);
        const names = new Set(roleSkills(id));
        skillBtns.forEach((b) => {
            const hit = names.has(b.dataset.skill);
            b.classList.toggle('is-hit', hit);
            b.classList.toggle('is-dim', !hit);
        });
        rolesEl.classList.add('has-focus');
        const txt = names.size
            ? `${names.size} aptitudes que LinkedIn asocia a este puesto.`
            : 'LinkedIn no asocia aptitudes concretas a este puesto.';
        setDetail(`${e.roleShort || e.role} · ${e.company}`, `${fmtPeriod(e.start, e.end)}. ${txt}`);
    };
    const showSkill = (name) => {
        const set = skillRoles.get(name);
        const s = skills.find((x) => x.name === name);
        roleBtns.forEach((b) => b.classList.toggle('is-hint', set.has(b.dataset.id)));
        rolesEl.classList.add('has-hint');
        const where = [...set].map((id) => byRole.get(id).company);
        const uses = s.uses ? `Figura en ${s.uses} etapas del perfil.` : 'LinkedIn no indica en cuántas etapas figura.';
        setDetail(name, `${uses}${where.length ? ` Asociada a: ${[...new Set(where)].join(', ')}.` : ''}`);
    };
    const reset = () => {
        rolesEl.classList.remove('has-hint', 'has-focus');
        roleBtns.forEach((b) => b.classList.remove('is-hint'));
        skillBtns.forEach((b) => b.classList.remove('is-hit', 'is-dim'));
        if (pinned) showRole(pinned);
        else setDetail('Elige un puesto o una aptitud', 'Los datos son los que LinkedIn asocia a cada etapa.');
    };

    roleBtns.forEach((b) => {
        const id = b.dataset.id;
        b.addEventListener('pointerenter', () => showRole(id));
        b.addEventListener('focus', () => showRole(id));
        b.addEventListener('pointerleave', reset);
        b.addEventListener('blur', reset);
        b.addEventListener('click', () => {
            pinned = pinned === id ? null : id;
            roleBtns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.id === pinned)));
            pinned ? showRole(id) : reset();
        });
    });
    skillBtns.forEach((b) => {
        const name = b.dataset.skill;
        const on = () => showSkill(name);
        b.addEventListener('pointerenter', on);
        b.addEventListener('focus', on);
        b.addEventListener('pointerleave', reset);
        b.addEventListener('blur', reset);
        b.addEventListener('click', () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
    });
}

export function initGallery() {
    const dlg = $('#lightbox');
    const img = $('#lightbox-img');
    const cap = $('#lightbox-cap');
    $('#gallery').addEventListener('click', (e) => {
        const btn = e.target.closest('.shot__btn');
        if (!btn) return;
        img.src = btn.dataset.full;
        img.alt = btn.dataset.alt;
        cap.textContent = btn.dataset.cap;
        dlg.showModal();
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { img.removeAttribute('src'); });
}
