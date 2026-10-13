/**
 * color.js — Cor dinâmica Material You + gerenciador de modo claro/escuro/auto.
 *
 * 1. Lê a cor semente de `--m3-seed` (definida no <b:skin> via $(keycolor),
 *    editável pelo Designer de Temas do Blogger).
 * 2. Gera o esquema M3 completo (claro e escuro) com @material/material-color-utilities.
 * 3. Aplica os tokens `--md-sys-color-*` num <style> injetado no <head>
 *    (claro em :root, escuro em :root[data-theme="dark"]).
 * 4. Gerencia o modo (light/dark/auto) com localStorage + prefers-color-scheme,
 *    atualizando <html data-theme>, color-scheme e <meta name="theme-color">.
 *
 * O tema continua utilizável sem este arquivo: o <b:skin> já traz os tokens
 * padrão como fallback (gerados por scripts/gen-tokens.mjs).
 */
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  DynamicScheme,
  MaterialDynamicColors,
  Variant,
} from '@material/material-color-utilities';

/** Papéis M3 aplicados como tokens CSS (ordem estável). */
const ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'primaryFixed',
  'onPrimaryFixed', 'onPrimaryFixedVariant',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'background', 'onBackground', 'surface', 'onSurface', 'surfaceVariant',
  'onSurfaceVariant', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
  'surfaceContainerHigh', 'surfaceContainerHighest',
  'outline', 'outlineVariant', 'inverseSurface', 'inverseOnSurface',
  'inversePrimary',
];

const kebab = (role) => role.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/** Lê a cor semente definida no skin (fallback: roxo M3). */
function readSeed() {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--m3-seed')
    .trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#6750a4';
}

/** Gera tokens CSS para um esquema (claro/escuro). */
function buildTokenBlock(scheme, selector) {
  const rows = ROLES.map((role) => {
    const argb = MaterialDynamicColors[role].getArgb(scheme);
    return `  --md-sys-color-${kebab(role)}: ${hexFromArgb(argb)};`;
  }).join('\n');
  return `${selector} {\n${rows}\n}`;
}

/** Injeta um <style> com os dois esquemas gerados dinamicamente. */
function applyDynamicColors(seed) {
  const options = {
    sourceColorHct: Hct.fromInt(argbFromHex(seed)),
    variant: Variant.TONAL_SPOT,
    contrastLevel: 0,
  };
  const light = new DynamicScheme({ ...options, isDark: false });
  const dark = new DynamicScheme({ ...options, isDark: true });

  const css = [
    '/* Tokens gerados dinamicamente (color.js) — semente ' + seed + ' */',
    buildTokenBlock(light, ':root'),
    buildTokenBlock(dark, ':root[data-theme="dark"]'),
  ].join('\n\n');

  let style = document.getElementById('m3-dynamic-color');
  if (!style) {
    style = document.createElement('style');
    style.id = 'm3-dynamic-color';
    document.head.appendChild(style);
  }
  style.textContent = css;

  // Publica a semente efetiva para outros módulos e para depuração.
  document.documentElement.style.setProperty('--m3-seed-effective', seed);
  return { light, dark };
}

const MODE_KEY = 'm3-theme-mode'; // 'light' | 'dark' | 'auto'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

/** Modo salvo (ou auto). */
function savedMode() {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === 'light' || m === 'dark' || m === 'auto' ? m : 'auto';
  } catch {
    return 'auto';
  }
}

/** Modo efetivo: dark quando (auto e sistema escuro) ou dark explícito. */
function isDarkEffective(mode) {
  return mode === 'dark' || (mode === 'auto' && systemDark.matches);
}

/** Aplica o modo no <html> e no <meta name="theme-color">. */
function applyMode(mode) {
  const dark = isDarkEffective(mode);
  const root = document.documentElement;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-mode', mode);
  root.style.colorScheme = dark ? 'dark' : 'light';

  // Cor da barra do navegador acompanha a superfície do tema.
  const surface = getComputedStyle(root)
    .getPropertyValue(dark ? '--md-sys-color-surface' : '--md-sys-color-surface')
    .trim();
  let meta = document.querySelector('meta[name="theme-color"][data-dynamic]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('data-dynamic', '');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', surface || (dark ? '#141218' : '#fdf7ff'));

  // Ícone do botão de alternância reflete o modo.
  document.querySelectorAll('[data-theme-toggle] md-icon').forEach((icon) => {
    icon.textContent = mode === 'auto' ? 'brightness_auto'
      : mode === 'dark' ? 'dark_mode' : 'light_mode';
  });
}

/** Ciclo: auto → light → dark → auto. */
function cycleMode() {
  const next = { auto: 'light', light: 'dark', dark: 'auto' }[savedMode()] || 'auto';
  try {
    localStorage.setItem(MODE_KEY, next);
  } catch {
    /* modo fica só para a sessão */
  }
  applyMode(next);
}

/** Inicializa cor dinâmica + modo. Exportado para o main.js. */
export function initColor() {
  const seed = readSeed();
  applyDynamicColors(seed);
  applyMode(savedMode());

  // Sistema mudou e estamos em auto → reage.
  systemDark.addEventListener('change', () => {
    if (savedMode() === 'auto') applyMode('auto');
  });

  // Botões de alternância (top app bar, drawer, rodapé…).
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', cycleMode);
  });

  // Seed pode ser trocada em runtime (ex.: seletor do próprio blog).
  document.addEventListener('m3-seed-change', (event) => {
    const value = event.detail && event.detail.seed;
    if (value && /^#[0-9a-fA-F]{3,8}$/.test(value)) applyDynamicColors(value);
  });
}
