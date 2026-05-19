// ============================================================
//  toast.js — Notificaciones tipo toast
// ============================================================

const _svg = (d, col) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">${d}</svg>`;
const COLORS = {
    success: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: _svg('<polyline points="20 6 9 17 4 12"/>', '#065f46') },
    error:   { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: _svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', '#991b1b') },
    info:    { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', icon: _svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', '#1e40af') },
    warning: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', icon: _svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', '#92400e') },
};

export function toast(message, type = 'info', duration = 3500) {
    const c = COLORS[type] ?? COLORS.info;

    const el = document.createElement('div');
    el.style.cssText = `
        position:fixed; bottom:24px; right:24px; z-index:9999;
        display:flex; align-items:center; gap:10px;
        background:${c.bg}; border:1.5px solid ${c.border}; color:${c.text};
        padding:12px 18px; border-radius:14px;
        font-family:'Inter',sans-serif; font-size:0.9rem; font-weight:500;
        box-shadow:0 8px 30px rgba(0,0,0,0.12);
        animation:toastIn 0.3s ease both;
        max-width:340px; line-height:1.4;
    `;
    el.innerHTML = `<span style="font-size:1.1rem;">${c.icon}</span><span>${message}</span>`;

    // Inyectar keyframe si no existe
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes toastIn  { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
            @keyframes toastOut { from{opacity:1;transform:translateY(0);}    to{opacity:0;transform:translateY(10px);} }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(el);

    setTimeout(() => {
        el.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, duration);
}
