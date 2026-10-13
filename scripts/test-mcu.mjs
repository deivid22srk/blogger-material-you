/**
 * Teste rápido: gera tokens M3 via MCU (empacotado com esbuild, pois o
 * pacote 0.4.0 tem imports sem extensão que o Node ESM não resolve sozinho).
 */
import { build } from 'esbuild';

const probe = `
import { argbFromHex, hexFromArgb, Hct, DynamicScheme, MaterialDynamicColors, Variant } from '@material/material-color-utilities';
const opts = { sourceColorHct: Hct.fromInt(argbFromHex('#6750a4')), variant: Variant.TONAL_SPOT, contrastLevel: 0 };
const l = new DynamicScheme({ ...opts, isDark: false });
const d = new DynamicScheme({ ...opts, isDark: true });
const roles = [
  'primary','onPrimary','primaryContainer','onPrimaryContainer',
  'surface','surfaceDim','surfaceBright','surfaceContainerLowest','surfaceContainerLow',
  'surfaceContainer','surfaceContainerHigh','surfaceContainerHighest',
  'onSurface','onSurfaceVariant','outline','outlineVariant',
  'primaryFixed','onPrimaryFixed','onPrimaryFixedVariant','inverseSurface','inverseOnSurface','inversePrimary',
  'secondaryContainer','onSecondaryContainer','tertiary','onTertiary','tertiaryContainer','onTertiaryContainer',
  'error','onError','errorContainer','onErrorContainer','scrim','shadow','surfaceVariant','background','onBackground','secondary','onSecondary','tertiaryPaletteKeyColor'
];
for (const r of roles) {
  const dc = MaterialDynamicColors[r];
  if (!dc) { console.log('MISSING', r); continue; }
  console.log(r + ' light=' + hexFromArgb(dc.getArgb(l)) + ' dark=' + hexFromArgb(dc.getArgb(d)));
}
`;

const result = await build({
  stdin: { contents: probe, resolveDir: process.cwd(), loader: 'js' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  logLevel: 'silent',
});

const out = result.outputFiles[0].text;
const tmp = new URL('./.mcu-bundle.tmp.mjs', import.meta.url);
const { writeFileSync } = await import('node:fs');
writeFileSync(tmp, out);
await import(tmp.href);

