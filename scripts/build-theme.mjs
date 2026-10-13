/**
 * build-theme.mjs — monta o theme.xml final do Blogger.
 *
 * 1. Lê src/theme.template.xml (esqueleto com placeholders).
 * 2. Gera o CSS do <b:skin>: tokens M3 gerados + styles.css (minificados).
 * 3. Injeta a URL do theme.js (ASSET_BASE, padrão GitHub Pages do projeto).
 * 4. Valida a boa formação do XML (fast-xml-parser) e grava dist/theme.xml.
 *
 * Placeholders do template:
 *   __M3_TOKENS__   → src/generated/tokens.css (claro + escuro)
 *   __M3_SKIN_CSS__ → src/styles.css minificado
 *   __M3_JS_URL__   → URL pública do theme.js
 */
import { build, transform } from 'esbuild';
import { XMLValidator } from 'fast-xml-parser';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => readFileSync(join(root, p), 'utf8');

const ASSET_BASE = (process.env.ASSET_BASE ||
  'https://deivid22srk.github.io/blogger-material-you').replace(/\/+$/, '');

const template = src('src/theme.template.xml');
const tokens = src('src/generated/tokens.css');
const styles = src('src/styles.css');

// Minifica o CSS do tema (mantém @media, custom properties e font shorthands)
const minified = await transform(tokens + '\n' + styles, {
  loader: 'css',
  minify: true,
  target: ['es2020'],
});
let skinCss = minified.code;

// Garantias estruturais do CDATA do Blogger
if (skinCss.includes(']]>')) {
  console.error('ERRO: CSS contém a sequência "]]>" — quebraria o CDATA do b:skin.');
  process.exit(1);
}

let out = template
  .replace('__M3_TOKENS__', () => skinCss)
  .replace('__M3_SKIN_CSS__', () => '')
  .replace('__M3_JS_URL__', () => `${ASSET_BASE}/theme.js`);

// Checagens de placeholders remanescentes
const leftover = out.match(/__(M3_[A-Z_]+)__/g);
if (leftover) {
  console.error('ERRO: placeholders não resolvidos:', leftover.join(', '));
  process.exit(1);
}

// ------------------- Validações estruturais -------------------
const errors = [];

// 1. Boa formação XML
const result = XMLValidator.validate(out, { allowBooleanAttributes: false });
if (result !== true) {
  errors.push(`XML malformado: ${JSON.stringify(result.err)}`);
}

// 2. Entidades nomeadas inválidas em XML puro (só amp/lt/gt/quot/apos são válidas)
const badEntities = out.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)[a-zA-Z]+;/g);
if (badEntities) {
  errors.push(`Entidades inválidas em XML: ${[...new Set(badEntities)].join(', ')}`);
}

// 3. Cada <b:section> precisa de id; ids de seção únicos
const sectionIds = [...out.matchAll(/<b:section[^>]*>/g)].map((m) => (m[0].match(/id='([^']+)'/) || [])[1]);
if (sectionIds.some((id) => !id)) errors.push('Há <b:section> sem id.');
const dupSections = sectionIds.filter((id, i) => sectionIds.indexOf(id) !== i);
if (dupSections.length) errors.push(`Seções com id duplicado: ${[...new Set(dupSections)].join(', ')}`);

// 4. Cada <b:widget> precisa de type/version/main ([\s>] evita b:widget-settings)
for (const m of out.matchAll(/<b:widget(?=[\s>])[^>]*>/g)) {
  const tag = m[0];
  if (!/type='[^']+'/.test(tag)) errors.push(`Widget sem type: ${tag}`);
  if (!/version='2'/.test(tag)) errors.push(`Widget sem version='2': ${tag}`);
  if (!/id='[^']+'/.test(tag)) errors.push(`Widget sem id: ${tag}`);
}
const widgetBlocks = out.match(/<b:widget(?=[\s>])[^>]*>[\s\S]*?<\/b:widget>/g) || [];
for (const w of widgetBlocks) {
  const id = (w.match(/id='([^']+)'/) || [])[1];
  if (!/<b:includable id='main'/.test(w)) errors.push(`Widget ${id} sem <b:includable id='main'>.`);
}

// 5. CDATA balanceado
const opens = (out.match(/<!\[CDATA\[/g) || []).length;
const closes = (out.match(/\]\]>/g) || []).length;
if (opens !== closes) errors.push(`CDATA desbalanceado: ${opens} aberturas x ${closes} fechamentos.`);

if (errors.length) {
  console.error('FALHA NA VALIDAÇÃO:\n- ' + errors.join('\n- '));
  process.exit(1);
}

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'theme.xml'), out);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`dist/theme.xml gerado: ${kb(out.length)} (skin ${kb(skinCss.length)}) · assets em ${ASSET_BASE}`);
