// ============================================================
//  cliente.js — Panel del cliente: ver bares, reservar, mis reservas
// ============================================================

import { auth }   from '../core/auth.js';
import { api }    from '../core/api.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';
import { modal }  from '../components/modal.js';
import { renderNavbar } from '../components/navbar.js';

if (!auth.requireLogin()) throw new Error('No autorizado');

renderNavbar();

// ─── MIS RESERVAS ─────────────────────────────────────────────
async function cargarMisReservas() {
    loader.show();
    try {
        const reservas = await api.reservas.misReservas();
        renderReservas(reservas);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

function renderReservas(reservas) {
    const container = document.getElementById('mis-reservas');
    if (!container) return;

    if (reservas.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-center py-8">No tienes reservas aún.</p>`;
        return;
    }

    const estadoColor = {
        pendiente:  'bg-yellow-100 text-yellow-700',
        confirmada: 'bg-green-100 text-green-700',
        cancelada:  'bg-gray-100 text-gray-500',
        rechazada:  'bg-red-100 text-red-600',
    };

    container.innerHTML = reservas.map(r => `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex justify-between items-start">
            <div>
                <h3 class="font-bold text-gray-800">${r.bar?.nombre ?? 'Bar'}</h3>
                <p class="text-sm text-gray-500 mt-1">
                    ${r.mesa?.numero} · ${r.num_personas} personas
                </p>
                <p class="text-sm text-gray-500">${r.fecha} a las ${r.hora}</p>
                ${r.notas ? `<p class="text-xs text-gray-400 mt-1 italic">"${r.notas}"</p>` : ''}
            </div>
            <div class="flex flex-col items-end gap-2">
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${estadoColor[r.estado]}">
                    ${r.estado}
                </span>
                ${['pendiente', 'confirmada'].includes(r.estado) ? `
                    <button data-id="${r.id}" class="btn-cancelar text-xs text-red-500 hover:underline">
                        Cancelar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Eventos cancelar
    container.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const confirmed = await modal.confirm(
                '¿Cancelar reserva?',
                'Esta acción no se puede deshacer.'
            );
            if (!confirmed) return;
            try {
                await api.reservas.cancelar(btn.dataset.id);
                toast('Reserva cancelada', 'info');
                cargarMisReservas();
            } catch (err) {
                toast(err.message, 'error');
            }
        });
    });
}

// ─── NUEVA RESERVA ────────────────────────────────────────────
async function cargarBares() {
    const bares = await api.bares.getAll();
    const sel = document.getElementById('reserva-bar');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecciona un bar...</option>' +
        bares.map(b => `<option value="${b.id}">${b.nombre} — ${b.ciudad}</option>`).join('');
    return bares;
}

async function cargarMesas(barId, fecha, hora) {
    if (!barId || !fecha || !hora) return;
    const mesas = await api.mesas.getByBar(barId, fecha, hora);
    const sel = document.getElementById('reserva-mesa');
    if (!sel) return;

    const disponibles = mesas.filter(m => m.disponible !== false);
    if (disponibles.length === 0) {
        sel.innerHTML = '<option value="">No hay mesas disponibles</option>';
        return;
    }
    sel.innerHTML = '<option value="">Elige una mesa...</option>' +
        disponibles.map(m => `
            <option value="${m.id}">${m.numero} · ${m.capacidad} personas · ${m.ubicacion}</option>
        `).join('');
}

document.getElementById('reserva-bar')?.addEventListener('change', () => actualizarMesas());
document.getElementById('reserva-fecha')?.addEventListener('change', () => actualizarMesas());
document.getElementById('reserva-hora')?.addEventListener('change',  () => actualizarMesas());

function actualizarMesas() {
    const barId = document.getElementById('reserva-bar')?.value;
    const fecha = document.getElementById('reserva-fecha')?.value;
    const hora  = document.getElementById('reserva-hora')?.value;
    if (barId && fecha && hora) cargarMesas(barId, fecha, hora);
}

document.getElementById('form-reserva')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        bar_id:       document.getElementById('reserva-bar').value,
        mesa_id:      document.getElementById('reserva-mesa').value,
        fecha:        document.getElementById('reserva-fecha').value,
        hora:         document.getElementById('reserva-hora').value,
        num_personas: parseInt(document.getElementById('reserva-personas').value),
        notas:        document.getElementById('reserva-notas')?.value || null,
    };

    loader.show();
    try {
        await api.reservas.crear(data);
        toast('Reserva enviada. Pendiente de confirmación.', 'success');
        e.target.reset();
        cargarMisReservas();
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
});

// ─── INIT ─────────────────────────────────────────────────────
window.__cargarMisReservas = cargarMisReservas;

cargarBares().then(() => {
    // Pre-seleccionar bar si viene como ?bar=ID desde la página de bares
    const barId = new URLSearchParams(window.location.search).get('bar');
    if (barId) {
        const sel = document.getElementById('reserva-bar');
        if (sel) sel.value = barId;
    }
});
cargarMisReservas();
