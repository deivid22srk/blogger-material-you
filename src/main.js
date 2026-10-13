/**
 * main.js — ponto de entrada do tema.
 *
 * 1. Importa SOMENTE os componentes Material Web usados no XML (bundle único).
 * 2. Inicializa a cor dinâmica Material You (color.js).
 * 3. Comportamentos do tema: app bar ao rolar, drawer mobile, diálogo de busca,
 *    FAB "voltar ao topo", tempo de leitura, posts relacionados (feed JSON do
 *    próprio blog) e compartilhamento nativo.
 *
 * Todos os import paths abaixo foram verificados no tarball @material/web@2.5.0.
 */

// ---------- Componentes Material Web ----------
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/divider/divider.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/progress/circular-progress.js';

// ---------- Cor dinâmica Material You ----------
import { initColor } from './color.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* ------------------------------------------------------------------ */
/* App bar: muda de superfície ao rolar (referência aShell You)        */
/* ------------------------------------------------------------------ */
function initAppBar() {
  const bar = $('#app-bar');
  if (!bar) return;
  const update = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ------------------------------------------------------------------ */
/* Drawer mobile (painel de navegação próprio, estilo M3 modal)        */
/* ------------------------------------------------------------------ */
function initDrawer() {
  const drawer = $('#m3-drawer');
  const scrim = $('#m3-drawer-scrim');
  const openBtn = $('#m3-drawer-open');
  if (!drawer || !scrim) return;

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    document.body.classList.toggle('m3-no-scroll', open);
    if (open) {
      const first = $('a, button', drawer);
      if (first) first.focus();
    }
  };

  openBtn && openBtn.addEventListener('click', () => setOpen(true));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
  });
  $$('[data-drawer-close]', drawer).forEach((el) =>
    el.addEventListener('click', () => setOpen(false)));
}

/* ------------------------------------------------------------------ */
/* Modal de busca (padrão M3 próprio, como o drawer)                   */
/* ------------------------------------------------------------------ */
function initSearchModal() {
  const modal = $('#search-modal');
  const scrim = $('#m3-search-scrim');
  if (!modal || !scrim) return;

  const setOpen = (open) => {
    modal.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    document.body.classList.toggle('m3-no-scroll', open);
    if (open) {
      requestAnimationFrame(() => {
        const field = $('md-outlined-text-field', modal) || $('input[name="q"]', modal);
        if (field) field.focus();
      });
    }
  };

  $$('[data-search-open]').forEach((btn) =>
    btn.addEventListener('click', () => setOpen(true)));
  $$('[data-search-close]').forEach((el) =>
    el.addEventListener('click', () => setOpen(false)));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) setOpen(false);
  });
}

/* ------------------------------------------------------------------ */
/* FAB "voltar ao topo"                                                */
/* ------------------------------------------------------------------ */
function initToTop() {
  const fab = $('#m3-to-top');
  if (!fab) return;
  const update = () => fab.classList.toggle('is-visible', window.scrollY > 600);
  update();
  window.addEventListener('scroll', update, { passive: true });
  fab.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  });
}

/* ------------------------------------------------------------------ */
/* Tempo de leitura (post individual)                                  */
/* ------------------------------------------------------------------ */
function initReadingTime() {
  const slot = $('#m3-reading-time');
  const body = $('.post-content');
  if (!slot || !body) return;
  const words = body.textContent.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const isPt = (document.documentElement.lang || '').toLowerCase().startsWith('pt');
  slot.textContent = isPt ? `${minutes} min de leitura` : `${minutes} min read`;
  slot.hidden = false;
}

/* ------------------------------------------------------------------ */
/* Posts relacionados — feed JSON do próprio blog por rótulo           */
/* ------------------------------------------------------------------ */
function renderRelatedCard(entry, currentPath) {
  const link = (entry.link || []).find((l) => l.rel === 'alternate');
  if (!link) return null;
  const url = new URL(link.href);
  if (url.pathname === currentPath) return null; // ignora o próprio post

  const title = entry.title && entry.title.$t ? entry.title.$t : '';
  let thumb = '';
  if (entry.media$thumbnail && entry.media$thumbnail.url) {
    // sobe a miniatura padrão (s72-c) para 320x180 recortada
    thumb = entry.media$thumbnail.url.replace(/\/s72(-c)?\//, '/w320-h180-c/');
  }

  const a = document.createElement('a');
  a.className = 'related-card';
  a.href = url.href;
  a.innerHTML = thumb
    ? `<span class="related-thumb"><img loading="lazy" decoding="async" src="${thumb}" alt=""></span>`
    : '<span class="related-thumb related-thumb--empty"><md-icon>article</md-icon></span>';
  const span = document.createElement('span');
  span.className = 'related-title';
  span.textContent = title; // textContent = seguro contra HTML no título
  a.appendChild(span);
  return a;
}

async function initRelatedPosts() {
  const wrap = $('#m3-related');
  if (!wrap || wrap.dataset.enabled !== 'true') return;

  const labels = $$('.related-label', wrap).map((s) => s.dataset.label).filter(Boolean);
  const list = $('#m3-related-list');
  const loader = $('#m3-related-loader');
  const currentPath = location.pathname;

  const tryFetch = async (label) => {
    const base = wrap.dataset.feedBase || '/feeds/posts/default';
    const url = label
      ? `${base}/-/${encodeURIComponent(label)}?alt=json&max-results=8`
      : `${base}?alt=json&max-results=8`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('feed ' + res.status);
    const feed = await res.json();
    return (feed.feed && feed.feed.entry ? feed.feed.entry : [])
      .map((entry) => renderRelatedCard(entry, currentPath))
      .filter(Boolean)
      .slice(0, 4);
  };

  try {
    let cards = [];
    for (const label of labels.slice(0, 2)) {
      cards = await tryFetch(label);
      if (cards.length) break;
    }
    if (!cards.length) cards = await tryFetch(''); // fallback: posts recentes
    if (loader) loader.hidden = true;
    if (cards.length) {
      cards.forEach((card) => list && list.appendChild(card));
    } else if (wrap.parentElement) {
      wrap.hidden = true;
    }
  } catch {
    if (loader) loader.hidden = true;
    wrap.hidden = true;
  }
}

/* ------------------------------------------------------------------ */
/* Compartilhamento: Web Share API + copiar link                       */
/* ------------------------------------------------------------------ */
function initShare() {
  const native = $('#m3-share-native');
  if (native) {
    native.hidden = !navigator.share;
    native.addEventListener('click', () => {
      navigator.share({
        title: document.title,
        url: location.href,
      }).catch(() => { /* usuário cancelou */ });
    });
  }

  const copy = $('#m3-share-copy');
  if (copy) {
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        const toast = $('#m3-toast');
        if (toast) {
          toast.classList.add('is-visible');
          setTimeout(() => toast.classList.remove('is-visible'), 2200);
        }
      } catch {
        /* clipboard indisponível */
      }
    });
  }
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
function boot() {
  initColor();
  initAppBar();
  initDrawer();
  initSearchModal();
  initToTop();
  initReadingTime();
  initRelatedPosts();
  initShare();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
