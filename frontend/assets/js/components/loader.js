// ============================================================
//  loader.js — Spinner de carga global
// ============================================================

export const loader = {
    show() {
        document.getElementById('tabsy-loader')?.remove();
        const el = document.createElement('div');
        el.id = 'tabsy-loader';
        el.className = 'fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm';
        el.innerHTML = `
            <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-amber-600 font-medium text-sm">Cargando...</span>
            </div>
        `;
        document.body.appendChild(el);
    },

    hide() {
        document.getElementById('tabsy-loader')?.remove();
    },
};
