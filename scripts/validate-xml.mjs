/**
 * validate-xml.mjs — valida a boa formação e regras estruturais de um
 * theme.xml do Blogger (usado no build e no CI).
 *
 * Uso: node scripts/validate-xml.mjs dist/theme.xml
 */
import { XMLValidator } from 'fast-xml-parser';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const file = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'theme.xml');
const xml = readFileSync(file, 'utf8');
const errors = [];

const result = XMLValidator.validate(xml, { allowBooleanAttributes: false });
if (result !== true) errors.push(`XML malformado: ${JSON.stringify(result.err)}`);

const badEntities = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)[a-zA-Z]+;/g);
if (badEntities) errors.push(`Entidades inválidas: ${[...new Set(badEntities)].join(', ')}`);

const sectionIds = [...xml.matchAll(/<b:section[^>]*>/g)].map((m) => (m[0].match(/id='([^']+)'/) || [])[1]);
if (sectionIds.some((id) => !id)) errors.push('Há <b:section> sem id.');
const dup = sectionIds.filter((id, i) => sectionIds.indexOf(id) !== i);
if (dup.length) errors.push(`Seções duplicadas: ${[...new Set(dup)].join(', ')}`);

for (const m of xml.matchAll(/<b:widget(?=[\s>])[^>]*>/g)) {
  const tag = m[0];
  if (!/type='[^']+'/.test(tag)) errors.push(`Widget sem type: ${tag}`);
  if (!/version='2'/.test(tag)) errors.push(`Widget sem version='2': ${tag}`);
}
for (const w of xml.match(/<b:widget(?=[\s>])[^>]*>[\s\S]*?<\/b:widget>/g) || []) {
  const id = (w.match(/id='([^']+)'/) || [])[1];
  if (!/<b:includable id='main'/.test(w)) errors.push(`Widget ${id} sem main.`);
}

const opens = (xml.match(/<!\[CDATA\[/g) || []).length;
const closes = (xml.match(/\]\]>/g) || []).length;
if (opens !== closes) errors.push(`CDATA desbalanceado (${opens} x ${closes}).`);

if (errors.length) {
  console.error('VALIDAÇÃO FALHOU:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`✔ ${file} válido (${(xml.length / 1024).toFixed(1)} KB, ${sectionIds.length} seções).`);
