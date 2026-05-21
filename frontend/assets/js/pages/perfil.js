import { api }    from '../core/api.js';
import { auth }   from '../core/auth.js';
import { toast }  from '../components/toast.js';
import { loader } from '../components/loader.js';
import { renderNavbar } from '../components/navbar.js';

if (!auth.requireLogin()) throw new Error('not logged in');

renderNavbar();

const user = auth.getUser();

// ─── Rellena UI con datos actuales ───────────────────────────
const inpName  = document.getElementById('inp-name');
const inpEmail = document.getElementById('inp-email');
const avatarImg     = document.getElementById('avatar-img');
const avatarInitial = document.getElementById('avatar-initial');
const avatarInput   = document.getElementById('avatar-input');
const avatarWrap    = document.getElementById('avatar-wrap');
const overlayLabel  = document.getElementById('overlay-label');

inpName.value  = user.name  || '';
inpEmail.value = user.email || '';
avatarInitial.textContent = (user.name || '?').charAt(0).toUpperCase();

function setAvatar(url) {
    if (url) {
        avatarImg.src = url;
        avatarImg.style.display = 'block';
        avatarInitial.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarInitial.style.display = 'flex';
    }
}

setAvatar(user.avatar_url);

// ─── Click en avatar → abre selector de fichero ──────────────
avatarWrap.addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    // Preview local inmediato
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);

    avatarWrap.classList.add('avatar-uploading');
    overlayLabel.textContent = 'Subiendo...';
    loader.show();
    try {
        const data = await api.perfil.uploadAvatar(file);
        // Actualiza localStorage con el nuevo avatar_url
        const updatedUser = { ...auth.getUser(), avatar_url: data.avatar_url, avatar: data.user.avatar };
        auth.setUser(updatedUser);
        setAvatar(data.avatar_url);
        toast('Foto actualizada correctamente', 'success');
    } catch (err) {
        toast(err.message || 'Error al subir la foto', 'error');
        setAvatar(user.avatar_url); // revierte al original
    } finally {
        loader.hide();
        avatarWrap.classList.remove('avatar-uploading');
        overlayLabel.textContent = 'Cambiar foto';
        avatarInput.value = '';
    }
});

// ─── Guardar nombre ───────────────────────────────────────────
document.getElementById('form-perfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inpName.value.trim();
    if (!name) return;

    loader.show();
    try {
        const data = await api.perfil.update(name);
        const updatedUser = { ...auth.getUser(), name: data.user.name };
        auth.setUser(updatedUser);
        toast('Perfil actualizado correctamente', 'success');
        // Refresca el initial del avatar si cambió el nombre
        avatarInitial.textContent = name.charAt(0).toUpperCase();
    } catch (err) {
        toast(err.message || 'Error al guardar', 'error');
    } finally {
        loader.hide();
    }
});
