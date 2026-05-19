// ============================================================
//  api.js — Capa de comunicación con el backend Laravel
//  Todas las llamadas fetch de Tabsy pasan por aquí
// ============================================================

const BASE_URL = '/api';

// Helper interno: construye headers con token si existe
function headers(extra = {}) {
    const token = localStorage.getItem('tabsy_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...extra,
    };
}

// Helper interno: procesa la respuesta y lanza error si no es ok
async function request(method, endpoint, body = null) {
    const options = { method, headers: headers() };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
        // Laravel devuelve errores en data.message o data.error
        const msg = data.message || data.error || 'Error desconocido';
        throw new Error(msg);
    }

    return data;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const api = {
    auth: {
        login:    (email, password)        => request('POST', '/login',    { email, password }),
        register: (name, email, password, password_confirmation) => request('POST', '/register', { name, email, password, password_confirmation }),
        logout:   ()                       => request('POST', '/logout'),
        me:       ()                       => request('GET',  '/me'),
    },

    // ─── BARES ───────────────────────────────────────────────────────────────
    bares: {
        getAll:  ()        => request('GET',    '/bares'),
        getOne:  (id)      => request('GET',    `/bares/${id}`),
        stats:   (id)      => request('GET',    `/bares/${id}/stats`),
        create:  (data)    => request('POST',   '/bares',        data),
        update:  (id, data)=> request('PUT',    `/bares/${id}`,  data),
        delete:  (id)      => request('DELETE', `/bares/${id}`),
    },

    // ─── MESAS ───────────────────────────────────────────────────────────────
    mesas: {
        getByBar: (barId, fecha = null, hora = null) => {
            let url = `/bares/${barId}/mesas`;
            if (fecha && hora) url += `?fecha=${fecha}&hora=${hora}`;
            return request('GET', url);
        },
        create:  (barId, data)       => request('POST',   `/bares/${barId}/mesas`,         data),
        update:  (barId, mesaId, data)=> request('PUT',   `/bares/${barId}/mesas/${mesaId}`, data),
        delete:  (barId, mesaId)     => request('DELETE', `/bares/${barId}/mesas/${mesaId}`),
    },

    // ─── RESERVAS ────────────────────────────────────────────────────────────
    reservas: {
        misReservas:  ()            => request('GET',   '/mis-reservas'),
        crear:        (data)        => request('POST',  '/reservas',                     data),
        crearGuest:   (data)        => request('POST',  '/reservas/guest',               data),
        cancelar:     (id)          => request('PATCH', `/reservas/${id}/cancelar`),
        porBar:       (barId)       => request('GET',   `/bares/${barId}/reservas`),
        cambiarEstado:(id, estado)  => request('PATCH', `/reservas/${id}/estado`,        { estado }),
        todas:        ()            => request('GET',   '/reservas'),
    },

    // ─── USUARIOS (solo superadmin) ───────────────────────────────────────────
    usuarios: {
        getAll:  ()         => request('GET',    '/usuarios'),
        create:  (data)     => request('POST',   '/usuarios',        data),
        update:  (id, data) => request('PUT',    `/usuarios/${id}`,  data),
        delete:  (id)       => request('DELETE', `/usuarios/${id}`),
    },
};
