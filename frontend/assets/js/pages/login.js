// ============================================================
//  login.js — Lógica de login y registro
// ============================================================

import { auth } from '../core/auth.js';
import { toast } from '../components/toast.js';
import { loader } from '../components/loader.js';

// Si ya está logueado, redirige a su panel
if (auth.isLoggedIn()) auth.redirectByRole();

// ─── LOGIN ───────────────────────────────────────────────────
document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    loader.show();
    try {
        await auth.login(email, password);
        toast('¡Bienvenido a Tabsy!', 'success');
        setTimeout(() => auth.redirectByRole(), 800);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
});

// ─── REGISTRO ────────────────────────────────────────────────
document.getElementById('form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('reg-name').value;
    const email    = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;

    if (password !== confirm) {
        toast('Las contraseñas no coinciden', 'error');
        return;
    }

    loader.show();
    try {
        const { token, user } = await import('../core/api.js').then(m =>
            m.api.auth.register(name, email, password, confirm)
        );
        auth.setToken(token);
        auth.setUser(user);
        toast('Cuenta creada correctamente. Bienvenido.', 'success');
        setTimeout(() => auth.redirectByRole(), 800);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
});

// ─── Toggle entre login y registro ───────────────────────────
document.getElementById('toggle-register')?.addEventListener('click', () => {
    document.getElementById('section-login').classList.add('hidden');
    document.getElementById('section-register').classList.remove('hidden');
});

document.getElementById('toggle-login')?.addEventListener('click', () => {
    document.getElementById('section-register').classList.add('hidden');
    document.getElementById('section-login').classList.remove('hidden');
});
