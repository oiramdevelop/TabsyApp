// ============================================================
//  login.js — Lógica de login y registro
// ============================================================

import { api }    from '../core/api.js';
import { auth }   from '../core/auth.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';

// Si ya está logueado, redirige a su panel
if (auth.isLoggedIn()) auth.redirectByRole();

// ─── Helpers UI para el caso "email no verificado" ─────────────
function mostrarBloqueVerificacion(email) {
    const cont = document.getElementById('aviso-verificacion');
    if (!cont) return;
    cont.dataset.email = email;
    cont.classList.remove('hidden');
}

async function reenviarVerificacion(email) {
    loader.show();
    try {
        const data = await api.auth.resendVerification(email);
        toast(data.message || 'Te hemos reenviado el correo.', 'success');
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

// Botón "reenviar" del bloque de aviso
document.getElementById('btn-reenviar-verif')?.addEventListener('click', () => {
    const cont = document.getElementById('aviso-verificacion');
    const email = cont?.dataset.email || document.getElementById('login-email').value;
    if (!email) {
        toast('Introduce tu correo arriba primero', 'error');
        return;
    }
    reenviarVerificacion(email);
});

// ─── LOGIN ───────────────────────────────────────────────────
document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Ocultamos avisos previos
    document.getElementById('aviso-verificacion')?.classList.add('hidden');

    loader.show();
    try {
        await auth.login(email, password);
        toast('¡Bienvenido a Tabsy!', 'success');
        setTimeout(() => auth.redirectByRole(), 800);
    } catch (err) {
        if (err.code === 'email_not_verified') {
            mostrarBloqueVerificacion(err.payload?.email || email);
            toast('Verifica tu correo antes de entrar', 'error');
        } else {
            toast(err.message, 'error');
        }
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
        // { message, email }
        await api.auth.register(name, email, password, confirm);
        toast('Cuenta creada. Revisa tu correo.', 'success');
        setTimeout(() => {
            window.location.href = '/pages/auth/verify.html?status=pending&email=' + encodeURIComponent(email);
        }, 900);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
});

// ─── REGISTRA TU BAR ─────────────────────────────────────────
document.getElementById('form-registro-bar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('rb-password').value;
    const confirm  = document.getElementById('rb-confirm').value;

    if (password !== confirm) {
        toast('Las contraseñas no coinciden', 'error');
        return;
    }

    const payload = {
        name:                 document.getElementById('rb-nombre').value,
        email:                document.getElementById('rb-email').value,
        password,
        password_confirmation: confirm,
        bar_nombre:           document.getElementById('rb-bar-nombre').value,
        bar_direccion:        document.getElementById('rb-bar-direccion').value,
        bar_ciudad:           document.getElementById('rb-bar-ciudad').value,
        bar_telefono:         document.getElementById('rb-bar-telefono').value || null,
        bar_descripcion:      document.getElementById('rb-bar-descripcion').value || null,
        google_place_id:      document.getElementById('rb-bar-place-id').value || null,
    };

    loader.show();
    try {
        await api.auth.registerBar(payload);
        toast('Cuenta y bar creados. Revisa tu correo.', 'success');
        setTimeout(() => {
            window.location.href = '/pages/auth/verify.html?status=pending&email=' + encodeURIComponent(payload.email);
        }, 900);
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
