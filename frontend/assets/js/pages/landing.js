// ============================================================
//  landing.js — Página pública: listado de bares
// ============================================================

import { api }    from '../core/api.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';

let _todosLosBares = [];

async function cargarBares() {
    loader.show();
    try {
        const bares = await api.bares.getAll();
        _todosLosBares = bares;
        renderBares(bares);
        window.onBarsLoaded?.(bares);
    } catch (err) {
        toast('Error cargando bares', 'error');
    } finally {
        loader.hide();
    }
}

function renderBares(bares) {
    const container = document.getElementById('lista-bares');
    if (!container) return;

    if (bares.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-16" style="color:rgba(15,34,64,0.4);">
                <div style="font-size:3rem;margin-bottom:12px;font-weight:700;color:rgba(15,34,64,0.2);">—</div>
                <p style="font-size:1rem;font-weight:600;">No hay bares disponibles aún</p>
            </div>`;
        return;
    }

    container.innerHTML = bares.map((b, i) => `
        <div class="bar-card reveal reveal-d${(i % 3) + 1}" style="cursor:pointer;" onclick="window.abrirReservaGuest(${b.id}, ${JSON.stringify(b.nombre).replace(/"/g, '&quot;')})">
            <div class="bar-thumb">
                ${b.imagen
                    ? `<img src="${b.imagen}" alt="${b.nombre}" />`
                    : `<span style="font-size:1.4rem;font-weight:700;color:rgba(255,255,255,0.3);">${b.nombre.charAt(0)}</span>`}
                ${b.horario_apertura
                    ? `<span class="horario-pill">${b.horario_apertura}–${b.horario_cierre ?? ''}</span>`
                    : ''}
            </div>
            <div style="padding:20px 22px;display:flex;flex-direction:column;gap:8px;flex:1;">
                <div>
                    <h3 style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:#0f2240;margin-bottom:4px;">${b.nombre}</h3>
                    <p style="font-size:0.83rem;color:rgba(15,34,64,0.5);"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${b.ciudad}${b.direccion ? ' · ' + b.direccion : ''}</p>
                    ${b.descripcion ? `<p style="font-size:0.83rem;color:rgba(15,34,64,0.55);margin-top:6px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${b.descripcion}</p>` : ''}
                </div>
                <div style="margin-top:auto;padding-top:12px;">
                    <span class="btn-reservar" style="display:block;text-align:center;">Reservar mesa</span>
                </div>
            </div>
        </div>
    `).join('');
    window.initReveal?.();
}

// Búsqueda en tiempo real
document.getElementById('search-bares')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtrados = _todosLosBares.filter(b =>
        b.nombre.toLowerCase().includes(q) || (b.ciudad || '').toLowerCase().includes(q)
    );
    renderBares(filtrados);
});

cargarBares();
