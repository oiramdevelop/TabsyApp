// ============================================================
//  verify.js — Lógica de la página de verificación de email
// ============================================================

import { api }    from '../core/api.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';

const params = new URLSearchParams(window.location.search);
const status = params.get('status') || 'pending';
const email  = params.get('email')  || '';

// ─── Mostrar la vista correcta ─────────────────────────────────
const vistas = ['pending', 'verified', 'already', 'invalid'];
const vistaActiva = vistas.includes(status) ? status : 'pending';
document.getElementById(`vista-${vistaActiva}`)?.classList.remove('hidden');

// Si es pending, pintar el correo
if (vistaActiva === 'pending' && email) {
    document.getElementById('email-pending').textContent = email;
}

// ─── Helper común de reenvío ───────────────────────────────────
async function reenviar(emailDestino) {
    if (!emailDestino) {
        toast('Introduce un correo válido', 'error');
        return;
    }
    loader.show();
    try {
        const data = await api.auth.resendVerification(emailDestino);
        toast(data.message || 'Te hemos reenviado el correo.', 'success');
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

// ─── Botones de reenvío ────────────────────────────────────────
document.getElementById('btn-reenviar-pending')?.addEventListener('click', () => {
    reenviar(email);
});

document.getElementById('btn-reenviar-invalid')?.addEventListener('click', () => {
    const e = document.getElementById('email-reenvio').value.trim();
    reenviar(e);
});
