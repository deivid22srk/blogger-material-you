/**
 * pages-index.mjs — gera dist/index.html: página de apresentação do projeto
 * no GitHub Pages, com links para o theme.xml, theme.js e instruções rápidas.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${pkg.name} — tema Material You para Blogger</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..800&display=swap" rel="stylesheet">
<style>
:root { color-scheme: light dark; }
body {
  margin: 0; min-height: 100dvh; display: grid; place-items: center;
  font-family: 'Roboto Flex', Roboto, system-ui, sans-serif; line-height: 1.6;
  background: #f2ecf4; color: #1d1b20; padding: 24px;
}
@media (prefers-color-scheme: dark) {
  body { background: #141218; color: #e6e0e9; }
}
main { max-width: 640px; }
h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); margin: 0 0 .4em; }
code {
  font-family: ui-monospace, monospace; font-size: .85em;
  background: rgba(127,127,127,.14); padding: 2px 8px; border-radius: 8px;
}
a.btn {
  display: inline-block; margin: 4px 8px 4px 0; padding: 10px 22px;
  border-radius: 999px; text-decoration: none; font-weight: 600;
  background: #6750a4; color: #fff;
}
a.btn.ghost { background: transparent; color: inherit; box-shadow: inset 0 0 0 1px rgba(127,127,127,.5); }
ol li, ul li { margin-bottom: .5em; }
</style>
</head>
<body>
<main>
  <h1>Blogger Material You</h1>
  <p>Tema <strong>Material 3 / Material You</strong> para o Blogger com cor dinâmica
  (seed configurável no Designer de Temas), modo claro/escuro/automático e
  componentes <code>@material/web</code>. Versão ${pkg.version}.</p>
  <p>
    <a class="btn" href="theme.xml">Baixar theme.xml</a>
    <a class="btn ghost" href="theme.js">theme.js</a>
    <a class="btn ghost" href="https://github.com/deivid22srk/blogger-material-you">GitHub</a>
  </p>
  <h2>Instalação</h2>
  <ol>
    <li>No painel do Blogger: <strong>Tema</strong> → seta ao lado de “Personalizar” → <strong>Restaurar</strong>.</li>
    <li><strong>Faça backup do tema atual</strong> antes (Botão “Fazer backup”).</li>
    <li>Envie o arquivo <code>theme.xml</code> baixado e confirme.</li>
  </ol>
  <h2>Personalizar</h2>
  <ul>
    <li><strong>Cor semente:</strong> Tema → Personalizar → Avançado → “Material You — cores”.</li>
    <li><strong>Claro/escuro/auto:</strong> botão no app bar do blog (fica salvo no navegador do visitante).</li>
  </ul>
</main>
</body>
</html>
`;

writeFileSync(join(root, 'dist', 'index.html'), html);
console.log('dist/index.html gerado para o GitHub Pages.');
