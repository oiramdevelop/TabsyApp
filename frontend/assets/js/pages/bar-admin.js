// ============================================================
//  bar-admin.js — Panel del admin de bar: mesas y reservas
// ============================================================

import { auth }   from '../core/auth.js';
import { api }    from '../core/api.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';
import { modal }  from '../components/modal.js';
import { renderNavbar } from '../components/navbar.js';

if (!auth.requireBarAdmin()) throw new Error('No autorizado');

renderNavbar();

const user  = auth.getUser();
const barId = user.bar_id;

// ─── RESERVAS DEL BAR ─────────────────────────────────────────
async function cargarReservas() {
    loader.show();
    try {
        const reservas = await api.reservas.porBar(barId);
        renderReservas(reservas);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

function renderReservas(reservas) {
    const container = document.getElementById('reservas-bar');
    if (!container) return;

    if (reservas.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-center py-8">No hay reservas aún.</p>`;
        return;
    }

    const estadoColor = {
        pendiente:  'bg-yellow-100 text-yellow-700',
        confirmada: 'bg-green-100 text-green-700',
        cancelada:  'bg-gray-100 text-gray-500',
        rechazada:  'bg-red-100 text-red-600',
    };

    container.innerHTML = reservas.map(r => `
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-start shadow-sm">
            <div>
                <p class="font-bold text-gray-800">${r.user?.name}</p>
                <p class="text-sm text-gray-500">${r.mesa?.numero} · ${r.num_personas} personas</p>
                <p class="text-sm text-gray-500">${r.fecha} · ${r.hora}</p>
                ${r.notas ? `<p class="text-xs italic text-gray-400 mt-1">"${r.notas}"</p>` : ''}
            </div>
            <div class="flex flex-col items-end gap-2">
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${estadoColor[r.estado]}">${r.estado}</span>
                ${r.estado === 'pendiente' ? `
                    <div class="flex gap-2">
                        <button data-id="${r.id}" data-estado="confirmada"
                            class="btn-estado text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition">
                            Confirmar
                        </button>
                        <button data-id="${r.id}" data-estado="rechazada"
                            class="btn-estado text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
                            Rechazar
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.btn-estado').forEach(btn => {
        btn.addEventListener('click', async () => {
            const accion = btn.dataset.estado === 'confirmada' ? 'confirmar' : 'rechazar';
            const confirmed = await modal.confirm(`¿${accion} reserva?`, '');
            if (!confirmed) return;
            try {
                await api.reservas.cambiarEstado(btn.dataset.id, btn.dataset.estado);
                toast(`Reserva ${btn.dataset.estado}`, 'success');
                cargarReservas();
            } catch (err) {
                toast(err.message, 'error');
            }
        });
    });
}

// ─── GESTIÓN DE MESAS ─────────────────────────────────────────
async function cargarMesas() {
    const mesas = await api.mesas.getByBar(barId);
    const container = document.getElementById('lista-mesas');
    if (!container) return;

    container.innerHTML = mesas.map(m => `
        <div class="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center shadow-sm">
            <div>
                <p class="font-semibold text-gray-800">${m.numero}</p>
                <p class="text-sm text-gray-500">${m.capacidad} personas · ${m.ubicacion}</p>
            </div>
            <div class="flex gap-2">
                <button data-id="${m.id}" class="btn-toggle-mesa text-xs px-3 py-1 rounded-lg border transition
                    ${m.activa ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'}">
                    ${m.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button data-id="${m.id}" class="btn-del-mesa text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                    Borrar
                </button>
            </div>
        </div>
    `).join('');

    // Toggle activa/inactiva
    container.querySelectorAll('.btn-toggle-mesa').forEach(btn => {
        btn.addEventListener('click', async () => {
            const mesa = mesas.find(m => m.id == btn.dataset.id);
            await api.mesas.update(barId, btn.dataset.id, { activa: !mesa.activa });
            toast('Mesa actualizada', 'success');
            cargarMesas();
        });
    });

    // Borrar mesa
    container.querySelectorAll('.btn-del-mesa').forEach(btn => {
        btn.addEventListener('click', async () => {
            const ok = await modal.confirm('¿Borrar mesa?', 'Se eliminarán también sus reservas.');
            if (!ok) return;
            await api.mesas.delete(barId, btn.dataset.id);
            toast('Mesa eliminada', 'info');
            cargarMesas();
        });
    });
}

// ─── CREAR MESA ───────────────────────────────────────────────
document.getElementById('form-mesa')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        numero:    document.getElementById('mesa-numero').value,
        capacidad: parseInt(document.getElementById('mesa-capacidad').value),
        ubicacion: document.getElementById('mesa-ubicacion').value,
    };
    try {
        await api.mesas.create(barId, data);
        toast('Mesa creada', 'success');
        e.target.reset();
        cargarMesas();
    } catch (err) {
        toast(err.message, 'error');
    }
});

// ─── INIT ─────────────────────────────────────────────────────
cargarReservas();
cargarMesas();
