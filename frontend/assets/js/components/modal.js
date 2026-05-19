// ============================================================
//  modal.js — Modal genérico reutilizable
//  Uso: modal.show({ title, body, onConfirm, confirmText })
// ============================================================

export const modal = {
    show({ title = '', body = '', onConfirm = null, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
        // Elimina modal previo si existe
        document.getElementById('tabsy-modal')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tabsy-modal';
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';

        overlay.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 transform scale-95 opacity-0 transition-all duration-200" id="modal-box">
                <h2 class="text-xl font-bold text-gray-800 mb-3">${title}</h2>
                <div class="text-gray-600 mb-6">${body}</div>
                <div class="flex justify-end gap-3">
                    <button id="modal-cancel"
                        class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                        ${cancelText}
                    </button>
                    ${onConfirm ? `
                    <button id="modal-confirm"
                        class="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition">
                        ${confirmText}
                    </button>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animación entrada
        requestAnimationFrame(() => {
            document.getElementById('modal-box').classList.remove('scale-95', 'opacity-0');
        });

        const close = () => overlay.remove();

        overlay.getElementById?.('modal-cancel')?.addEventListener('click', close);
        overlay.querySelector('#modal-cancel')?.addEventListener('click', close);

        if (onConfirm) {
            overlay.querySelector('#modal-confirm').addEventListener('click', () => {
                onConfirm();
                close();
            });
        }

        // Cierra al clickar fuera
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    },

    // Modal de confirmación rápida (devuelve Promise)
    confirm(title, message) {
        return new Promise((resolve) => {
            modal.show({
                title,
                body: message,
                confirmText: 'Sí, confirmar',
                onConfirm: () => resolve(true),
            });
        });
    },
};
