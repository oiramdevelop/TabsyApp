// ============================================================
//  auth.js — Gestión de sesión, token y protección de rutas
// ============================================================

import { api } from './api.js';

const TOKEN_KEY = 'tabsy_token';
const USER_KEY  = 'tabsy_user';

export const auth = {
    // ─── TOKEN ───────────────────────────────────────────────
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (t) => localStorage.setItem(TOKEN_KEY, t),

    // ─── USUARIO ─────────────────────────────────────────────
    getUser: () => {
        const u = localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
    },
    setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),

    // ─── SESIÓN ──────────────────────────────────────────────
    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

    login: async (email, password) => {
        const data = await api.auth.login(email, password);
        auth.setToken(data.token);
        auth.setUser(data.user);
        return data.user;
    },

    logout: async () => {
        try { await api.auth.logout(); } catch (_) {}
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/pages/auth/login.html';
    },

    // ─── ROLES ───────────────────────────────────────────────
    isSuperAdmin: () => auth.getUser()?.role === 'superadmin',
    isBarAdmin:   () => auth.getUser()?.role === 'bar_admin',
    isCliente:    () => auth.getUser()?.role === 'cliente',

    // ─── GUARDS (redirigen si no tienen permiso) ──────────────
    // Llama esto al inicio de páginas protegidas
    requireLogin: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = '/pages/auth/login.html';
            return false;
        }
        return true;
    },

    requireSuperAdmin: () => {
        if (!auth.isLoggedIn() || !auth.isSuperAdmin()) {
            window.location.href = '/pages/auth/login.html';
            return false;
        }
        return true;
    },

    requireBarAdmin: () => {
        if (!auth.isLoggedIn() || (!auth.isBarAdmin() && !auth.isSuperAdmin())) {
            window.location.href = '/pages/auth/login.html';
            return false;
        }
        return true;
    },

    // Redirige al panel correcto según el rol tras login
    redirectByRole: () => {
        const user = auth.getUser();
        if (!user) return;
        if (user.role === 'superadmin') window.location.href = '/pages/admin/dashboard.html';
        else if (user.role === 'bar_admin') window.location.href = '/pages/admin_bar/dashboard.html';
        else window.location.href = '/pages/cliente/bares.html';
    },

    // Refresca el usuario desde /api/me (útil si se cambia el rol en BD)
    refreshUser: async () => {
        try {
            const user = await api.auth.me();
            auth.setUser(user);
            return user;
        } catch (_) { return null; }
    },
};
