// ============================================================
//  landing.js — Página pública: listado de bares
// ============================================================

import { api }    from '../core/api.js';
import { auth }   from '../core/auth.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';

let _todosLosBares = [];

// Si hay sesión activa, la landing deja de comportarse como si el
// visitante fuera anónimo: el botón de acceso pasa a ser su perfil.
function actualizarNavSegunSesion() {
    const user = auth.getUser();
    if (!user) return;

    const destino = user.role === 'superadmin' ? '/pages/admin/dashboard.html'
        : user.role === 'bar_admin' ? '/pages/admin_bar/dashboard.html'
        : '/pages/cliente/reservas.html';
    const etiqueta = user.role === 'cliente' ? 'Mis reservas' : 'Mi panel';
    const initial = user.name.charAt(0).toUpperCase();

    const desktopLink = document.getElementById('nav-login-link');
    if (desktopLink) {
        desktopLink.outerHTML = `
            <a href="/pages/perfil.html" style="display:flex;align-items:center;gap:9px;text-decoration:none;">
                <span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#c9a96e,#b8924a);display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;color:white;">${initial}</span>
                <span style="font-size:0.82rem;color:rgba(255,255,255,0.6);">Hola, <strong style="color:white;">${user.name.split(' ')[0]}</strong></span>
            </a>
            <a href="${destino}" style="background:linear-gradient(135deg,#c9a96e,#b8924a);color:white;padding:10px 22px;border-radius:10px;font-weight:600;font-size:0.875rem;text-decoration:none;box-shadow:0 3px 14px rgba(201,169,110,0.28);letter-spacing:0.01em;">${etiqueta}</a>
        `;
    }

    const mobileLink = document.getElementById('mobile-login-link');
    if (mobileLink) {
        mobileLink.outerHTML = `
            <a href="/pages/perfil.html" style="font-size:1rem;font-weight:600;color:rgba(255,255,255,0.75);text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.07);display:block;">Hola, ${user.name.split(' ')[0]}</a>
            <a href="${destino}" style="display:block;background:linear-gradient(135deg,#c9a96e,#b8924a);color:white;padding:14px 22px;border-radius:12px;font-weight:700;font-size:0.95rem;text-decoration:none;text-align:center;margin-top:6px;box-shadow:0 4px 16px rgba(201,169,110,0.3);">${etiqueta} →</a>
        `;
    }
}
actualizarNavSegunSesion();

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
