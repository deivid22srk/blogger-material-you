/**
 * Gera os tokens M3 padrão (esquema claro + escuro) a partir da cor semente
 * padrão e grava em src/generated/tokens.css.
 *
 * Esses tokens são a BASE de fallback embutida no <b:skin> do tema:
 * mesmo sem JavaScript (ou sem o theme.js do GitHub Pages), o blog já renderiza
 * com as cores Material 3 corretas. O theme.js recalcula tudo no cliente
 * quando a cor semente muda no Designer do Blogger.
 *
 * Motivo do esbuild: o pacote material-color-utilities 0.4.x tem imports
 * sem extensão que o Node ESM puro não resolve; bundlers resolvem.
 */
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = process.env.SEED_COLOR || '#6750a4';

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
  'inversePrimary', 'shadow', 'scrim',
];

const probe = `
import { argbFromHex, hexFromArgb, Hct, DynamicScheme, MaterialDynamicColors, Variant } from '@material/material-color-utilities';
const opts = { sourceColorHct: Hct.fromInt(argbFromHex('${SEED}')), variant: Variant.TONAL_SPOT, contrastLevel: 0 };
const l = new DynamicScheme({ ...opts, isDark: false });
const d = new DynamicScheme({ ...opts, isDark: true });
const roles = ${JSON.stringify(ROLES)};
let out = '';
for (const r of roles) out += r + ' ' + hexFromArgb(MaterialDynamicColors[r].getArgb(l)) + ' ' + hexFromArgb(MaterialDynamicColors[r].getArgb(d)) + '\\n';
console.log(out);
`;


const result = await build({
  stdin: { contents: probe, resolveDir: root, loader: 'js' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  logLevel: 'silent',
});

const tmp = join(root, 'scripts', '.mcu-bundle.tmp.mjs');
writeFileSync(tmp, result.outputFiles[0].text);
const { execFileSync } = await import('node:child_process');
const out = execFileSync(process.execPath, [tmp], { encoding: 'utf8' });

const lines = out.trim().split('\n').filter(Boolean);
if (lines.length !== ROLES.length) {
  console.error('Esperava', ROLES.length, 'roles, recebi', lines.length);
  process.exit(1);
}

const kebab = (role) => role.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const cssVar = (role) => `--md-sys-color-${kebab(role)}`;

const block = (dark) => {
  const rows = lines.map((ln) => {
    const [role, light, dk] = ln.split(' ');
    return `  ${cssVar(role)}: ${dark ? dk : light};`;
  });
  return dark ? ':root[data-theme="dark"] {\n' + rows.join('\n') + '\n}' : ':root {\n' + rows.join('\n') + '\n}';
};

const css = `/*
 * Tokens Material 3 gerados automaticamente (scripts/gen-tokens.mjs)
 * Semente padrão: ${SEED} · Variante TONAL_SPOT · contrastLevel 0
 * Claro em :root e escuro em :root[data-theme="dark"].
 * O theme.js regenera estes tokens no cliente conforme a cor semente
 * definida no Designer de Temas do Blogger ($(keycolor) → --m3-seed).
 */
${block(false)}

${block(true)}
`;

mkdirSync(join(root, 'src', 'generated'), { recursive: true });
writeFileSync(join(root, 'src', 'generated', 'tokens.css'), css);
console.log(`tokens.css gerado com ${ROLES.length * 2} tokens (semente ${SEED}).`);
