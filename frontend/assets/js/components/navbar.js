// ============================================================
//  navbar.js — Navbar dinámica según el rol del usuario
// ============================================================

import { auth } from '../core/auth.js';

export function renderNavbar(containerId = 'navbar') {
    const user = auth.getUser();
    const container = document.getElementById(containerId);
    if (!container) return;

    const links = getLinksForRole(user?.role);
    const initial = user ? user.name.charAt(0).toUpperCase() : '';

    container.innerHTML = `
        <nav style="
            background:#0f2240;
            border-bottom:1px solid rgba(201,169,110,0.18);
            box-shadow:0 2px 24px rgba(15,34,64,0.4);
            position:fixed;top:0;left:0;right:0;z-index:1000;
            height:80px;display:flex;align-items:center;
        ">
            <div style="max-width:1280px;width:100%;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;">
                <a href="/" style="display:flex;align-items:center;text-decoration:none;">
                    <img src="/assets/images/logo2-2.png" alt="Tabsy"
                         style="height:72px;width:auto;" />
                </a>

                <div style="display:flex;align-items:center;gap:28px;">
                    ${links.map(l => `
                        <a href="${l.href}"
                           style="font-size:0.875rem;font-weight:500;color:rgba(255,255,255,0.62);text-decoration:none;letter-spacing:0.01em;padding-bottom:3px;border-bottom:2px solid transparent;transition:all 0.15s;"
                           onmouseover="this.style.color='white';this.style.borderBottomColor='#c9a96e'"
                           onmouseout="this.style.color='rgba(255,255,255,0.62)';this.style.borderBottomColor='transparent'">
                            ${l.label}
                        </a>
                    `).join('')}

                    ${user ? `
                        <div style="display:flex;align-items:center;gap:10px;padding-left:20px;border-left:1px solid rgba(255,255,255,0.1);">
                            <a href="/pages/perfil.html" style="text-decoration:none;display:flex;align-items:center;gap:10px;"
                               onmouseover="this.querySelector('.nav-avatar').style.boxShadow='0 0 0 2px #c9a96e'"
                               onmouseout="this.querySelector('.nav-avatar').style.boxShadow='none'">
                                ${user.avatar_url
                                    ? `<img class="nav-avatar" src="${user.avatar_url}" alt="${initial}"
                                           style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;transition:box-shadow 0.15s;" />`
                                    : `<div class="nav-avatar" style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#c9a96e,#b8924a);display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:800;color:white;flex-shrink:0;transition:box-shadow 0.15s;">
                                           ${initial}
                                       </div>`
                                }
                                <span style="font-size:0.82rem;color:rgba(255,255,255,0.5);">
                                    Hola, <strong style="color:white;font-weight:600;">${user.name.split(' ')[0]}</strong>
                                </span>
                            </a>
                            <a href="/pages/perfil.html"
                                style="font-size:0.78rem;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.12);padding:7px 16px;border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.15s;text-decoration:none;"
                                onmouseover="this.style.background='rgba(255,255,255,0.12)';this.style.color='rgba(255,255,255,0.7)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.45)'">
                                Perfil
                            </a>
                            <button id="btn-logout"
                                style="font-size:0.78rem;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.12);padding:7px 16px;border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.15s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.12)';this.style.color='rgba(255,255,255,0.7)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.45)'">
                                Salir
                            </button>
                        </div>
                    ` : `
                        <a href="/pages/auth/auth.html"
                            style="font-size:0.875rem;background:linear-gradient(135deg,#c9a96e,#b8924a);color:white;padding:10px 22px;border-radius:10px;font-weight:600;text-decoration:none;box-shadow:0 3px 14px rgba(201,169,110,0.28);letter-spacing:0.01em;"
                            onmouseover="this.style.boxShadow='0 6px 22px rgba(201,169,110,0.45)';this.style.transform='translateY(-1px)'"
                            onmouseout="this.style.boxShadow='0 3px 14px rgba(201,169,110,0.28)';this.style.transform='translateY(0)'">
                            Iniciar sesión
                        </a>
                    `}
                </div>
            </div>
        </nav>
    `;

    document.getElementById('btn-logout')?.addEventListener('click', () => auth.logout());
}

function getLinksForRole(role) {
    if (role === 'superadmin') return [
        { href: '/pages/admin/dashboard.html',   label: 'Dashboard' },
        { href: '/pages/admin/bares.html',        label: 'Bares' },
        { href: '/pages/admin/usuarios.html',     label: 'Usuarios' },
        { href: '/pages/admin/reservas.html',     label: 'Reservas' },
    ];
    if (role === 'bar_admin') return [
        { href: '/pages/bar-admin/dashboard.html', label: 'Dashboard' },
        { href: '/pages/bar-admin/mesas.html',     label: 'Mesas' },
        { href: '/pages/bar-admin/reservas.html',  label: 'Reservas' },
    ];
    if (role === 'cliente') return [
        { href: '/pages/cliente/bares.html',    label: 'Explorar bares' },
        { href: '/pages/cliente/reservas.html', label: 'Mis reservas' },
    ];
    return [{ href: '/', label: 'Ver bares' }];
}
