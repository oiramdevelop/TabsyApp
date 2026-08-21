// ============================================================
//  admin.js — Panel del SuperAdmin: bares, usuarios, reservas
// ============================================================

import { auth }   from '../core/auth.js';
import { api }    from '../core/api.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';
import { modal }  from '../components/modal.js';
import { renderNavbar } from '../components/navbar.js';

if (!auth.requireSuperAdmin()) throw new Error('No autorizado');

renderNavbar();

// ─── BARES ────────────────────────────────────────────────────
let _planes = [];

export async function cargarBares() {
    loader.show();
    try {
        const [bares] = await Promise.all([
            api.bares.getAll(),
            _planes.length ? Promise.resolve() : api.planes.getAll().then(p => { _planes = p; }),
        ]);
        renderBares(bares);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

function renderBares(bares) {
    const container = document.getElementById('lista-bares');
    if (!container) return;

    container.innerHTML = bares.map(b => {
        const esFree = b.plan?.nombre !== 'pro';
        const otroPlan = _planes.find(p => p.nombre === (esFree ? 'pro' : 'free'));
        return `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex justify-between items-start">
            <div>
                <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold text-gray-800">${b.nombre}</h3>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${esFree ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-700'}">${b.plan?.etiqueta ?? 'Free'}</span>
                    ${!b.activo ? '<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pendiente de aprobación</span>' : ''}
                </div>
                <p class="text-sm text-gray-500">${b.direccion}, ${b.ciudad}</p>
                <p class="text-xs text-gray-400 mt-1">${b.horario_apertura ?? ''} – ${b.horario_cierre ?? ''}</p>
            </div>
            <div class="flex gap-2">
                ${!b.activo ? `
                <button data-id="${b.id}" class="btn-aprobar-bar text-xs px-3 py-1 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition">
                    Aprobar
                </button>` : ''}
                ${otroPlan ? `
                <button data-id="${b.id}" data-plan="${otroPlan.id}" class="btn-plan-bar text-xs px-3 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition">
                    Pasar a ${otroPlan.etiqueta}
                </button>` : ''}
                <button data-id="${b.id}" class="btn-edit-bar text-xs px-3 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition">
                    Editar
                </button>
                <button data-id="${b.id}" class="btn-del-bar text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                    Borrar
                </button>
            </div>
        </div>
    `;
    }).join('');

    container.querySelectorAll('.btn-aprobar-bar').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await api.bares.update(btn.dataset.id, { activo: true });
                toast('Bar aprobado, ya es visible públicamente', 'success');
                cargarBares();
            } catch (err) {
                toast(err.message, 'error');
            }
        });
    });

    container.querySelectorAll('.btn-plan-bar').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await api.bares.update(btn.dataset.id, { plan_id: btn.dataset.plan });
                toast('Plan actualizado', 'success');
                cargarBares();
            } catch (err) {
                toast(err.message, 'error');
            }
        });
    });

    container.querySelectorAll('.btn-del-bar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const ok = await modal.confirm('¿Borrar bar?', 'Se eliminarán todas sus mesas y reservas.');
            if (!ok) return;
            await api.bares.delete(btn.dataset.id);
            toast('Bar eliminado', 'info');
            cargarBares();
        });
    });
}

document.getElementById('form-bar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre:           document.getElementById('bar-nombre').value,
        direccion:        document.getElementById('bar-direccion').value,
        ciudad:           document.getElementById('bar-ciudad').value,
        telefono:         document.getElementById('bar-telefono')?.value,
        descripcion:      document.getElementById('bar-descripcion')?.value,
        horario_apertura: document.getElementById('bar-apertura')?.value,
        horario_cierre:   document.getElementById('bar-cierre')?.value,
        google_place_id:  document.getElementById('bar-place-id')?.value || null,
    };
    loader.show();
    try {
        await api.bares.create(data);
        toast('Bar creado correctamente', 'success');
        e.target.reset();
        const pp = document.getElementById('place-preview');
        if (pp) pp.style.display = 'none';
        cargarBares();
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
});

// ─── USUARIOS ─────────────────────────────────────────────────
export async function cargarUsuarios() {
    loader.show();
    try {
        const usuarios = await api.usuarios.getAll();
        renderUsuarios(usuarios);
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

function renderUsuarios(usuarios) {
    const container = document.getElementById('lista-usuarios');
    if (!container) return;

    const roleColor = {
        superadmin: 'bg-purple-100 text-purple-700',
        bar_admin:  'bg-blue-100 text-blue-700',
        cliente:    'bg-gray-100 text-gray-600',
    };

    container.innerHTML = usuarios.map(u => `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex justify-between items-center">
            <div>
                <p class="font-semibold text-gray-800">${u.name}</p>
                <p class="text-sm text-gray-500">${u.email}</p>
                ${u.bar ? `<p class="text-xs text-gray-400">${u.bar.nombre}</p>` : ''}
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${roleColor[u.role]}">${u.role}</span>
                <button data-id="${u.id}" class="btn-del-user text-xs text-red-500 hover:underline">
                    Borrar
                </button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.btn-del-user').forEach(btn => {
        btn.addEventListener('click', async () => {
            const ok = await modal.confirm('¿Borrar usuario?', 'Esta acción es irreversible.');
            if (!ok) return;
            await api.usuarios.delete(btn.dataset.id);
            toast('Usuario eliminado', 'info');
            cargarUsuarios();
        });
    });
}

document.getElementById('form-usuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bares = Array.from(document.getElementById('user-bar')?.selectedOptions || []).map(o => o.value);
    const data = {
        name:     document.getElementById('user-name').value,
        email:    document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role:     document.getElementById('user-role').value,
        bares,
    };
    loader.show();
    try {
        await api.usuarios.create(data);
        toast('Usuario creado', 'success');
        e.target.reset();
        cargarUsuarios();
        window.loadStats?.();
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
});

// ─── RESERVAS GLOBALES ────────────────────────────────────────
export async function cargarTodasReservas() {
    loader.show();
    try {
        const reservas = await api.reservas.todas();
        const container = document.getElementById('todas-reservas');
        if (!container) return;
        container.innerHTML = reservas.map(r => `
            <div class="bg-white rounded-xl border border-gray-100 p-4 text-sm">
                <span class="font-semibold">${r.user?.name}</span> →
                <span>${r.bar?.nombre}</span> ·
                <span>${r.mesa?.numero}</span> ·
                <span>${r.fecha} ${r.hora}</span> ·
                <span class="font-medium text-amber-600">${r.estado}</span>
            </div>
        `).join('');
    } catch (err) {
        toast(err.message, 'error');
    } finally {
        loader.hide();
    }
}

// ─── INIT (llama solo lo que exista en la página actual) ──────
if (document.getElementById('lista-bares'))    cargarBares();
if (document.getElementById('lista-usuarios')) cargarUsuarios();
if (document.getElementById('todas-reservas')) cargarTodasReservas();
