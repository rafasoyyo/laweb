/** Google Analytics 4 (Firebase). Solo se carga si el visitante lo acepta en el banner de cookies. */

const MEASUREMENT_ID = 'G-3FRGPNNZM3';
const KEY = 'analytics-consent';

const read = () => {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
};
const write = (value) => {
    try { localStorage.setItem(KEY, value); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ }
};

function loadGA() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true });

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);
}

function showBanner() {
    const box = document.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML = `
        <p class="consent__text">Uso Google Analytics para contar visitas de forma anónima. ¿Lo permites?</p>
        <div class="consent__actions">
            <button type="button" class="consent__btn" data-choice="denied">Rechazar</button>
            <button type="button" class="consent__btn consent__btn--ok" data-choice="granted">Aceptar</button>
        </div>`;
    box.addEventListener('click', (e) => {
        const choice = e.target.closest('[data-choice]')?.dataset.choice;
        if (!choice) return;
        write(choice);
        box.remove();
        if (choice === 'granted') loadGA();
    });
    document.body.appendChild(box);
}

export function initAnalytics() {
    const choice = read();
    if (choice === 'granted') loadGA();
    else if (choice !== 'denied') showBanner();
}
