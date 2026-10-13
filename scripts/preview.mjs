/**
 * preview.mjs — gera um harness estático que simula a saída do Blogger
 * (mesmo markup do theme.template.xml com dados de exemplo) e serve o
 * preview + dist via HTTP para inspeção visual/screenshots.
 *
 * Uso: node scripts/preview.mjs [porta]
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 4173);

const tokens = readFileSync(join(root, 'src/generated/tokens.css'), 'utf8');
const styles = readFileSync(join(root, 'src/styles.css'), 'utf8');

const thumb = (hue, label) =>
  `data:image/svg+xml;charset=utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">` +
      `<rect width="640" height="360" fill="hsl(${hue},45%,62%)"/>` +
      `<circle cx="530" cy="80" r="46" fill="hsl(${hue},60%,80%)" opacity="0.8"/>` +
      `<path d="M0 300 Q160 220 320 290 T640 280 L640 360 L0 360 Z" fill="hsl(${hue},40%,45%)" opacity="0.85"/>` +
      `<text x="24" y="52" font-family="sans-serif" font-size="26" fill="white" opacity="0.9">${label}</text></svg>`
  );

const avatar =
  `data:image/svg+xml;charset=utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#e9ddff"/><circle cx="48" cy="36" r="18" fill="#4d3d75"/><path d="M14 88 Q48 52 82 88 L82 96 L14 96 Z" fill="#4d3d75"/></svg>`
  );

const card = (hue, label, chip1, chip2, comments) => `
      <article class='post-card'>
        <a class='card-thumb' aria-label='Post de exemplo' href='#'>
          <img alt='' decoding='async' src='${thumb(hue, label)}' loading='lazy'/>
        </a>
        <div class='card-body'>
          <ul class='card-labels'>
            <li><a class='m3-chip' href='#'>${chip1}</a></li>
            <li><a class='m3-chip' href='#'>${chip2}</a></li>
          </ul>
          <h2 class='card-title'><a href='#'>${label} — um título de postagem Material You</a></h2>
          <p class='card-snippet'>Resumo do post em duas ou três linhas para demonstrar o corte do cartão Material 3 com superfície tonal e espaçamento confortável de leitura.</p>
          <div class='card-meta'>
            <time datetime='2026-10-01'><md-icon>schedule</md-icon>1 de out. de 2026</time>
            <span class='meta-sep'>•</span>
            <span>${comments} comentários</span>
          </div>
        </div>
      </article>`;

const html = `<!DOCTYPE html>
<html data-theme='light' data-mode='auto' lang='pt-BR'>
<head>
<meta charset='utf-8'/>
<meta name='viewport' content='width=device-width, initial-scale=1'/>
<title>Preview — Blogger Material You</title>
<link href='https://fonts.googleapis.com' rel='preconnect'/>
<link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
<link href='https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..800&amp;family=Roboto:wght@400;500;700&amp;family=Roboto+Mono:wght@400;500&amp;display=swap' rel='stylesheet'/>
<link href='https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&amp;display=block' rel='stylesheet'/>
<style>
${tokens}
${styles}
</style>
</head>
<body class='is-homepage view-index'>
<a class='skip-link' href='#main-content'>Ir para o conteúdo</a>

<header id='app-bar'>
  <div class='app-bar-left'>
    <md-icon-button id='m3-drawer-open' aria-label='Abrir menu'><md-icon>menu</md-icon></md-icon-button>
    <div class='brand'><div class='widget'><a class='brand-title' href='#'>Meu Blog Material</a></div></div>
  </div>
  <nav aria-label='Páginas' class='app-bar-nav'>
    <div class='section'><ul class='m3-tabs'>
      <li class='current'><a href='#'>Início</a></li>
      <li><a href='#'>Sobre</a></li>
      <li><a href='#'>Tutoriais</a></li>
      <li><a href='#'>Contato</a></li>
    </ul></div>
  </nav>
  <div class='app-bar-actions'>
    <md-icon-button aria-label='Pesquisar' data-search-open=''><md-icon>search</md-icon></md-icon-button>
    <md-icon-button aria-label='Alternar tema' data-theme-toggle=''><md-icon>light_mode</md-icon></md-icon-button>
  </div>
</header>

<div id='layout'>
  <main class='content' id='main-content'>
    <div class='post-grid'>
${card(262, 'Post com imagem', 'Material You', 'Web', 5)}
${card(200, 'Design de interface', 'Design', 'Tokens', 2)}
${card(150, 'Novidades da versão', 'Lançamento', 'Changelog', 0)}
      <article class='post-card'>
        <a class='card-thumb' href='#'><span class='card-thumb--empty'><md-icon>article</md-icon></span></a>
        <div class='card-body'>
          <ul class='card-labels'><li><a class='m3-chip' href='#'>Sem imagem</a></li></ul>
          <h2 class='card-title'><a href='#'>Post sem capa usa ícone placeholder elegante</a></h2>
          <p class='card-snippet'>Quando o post não tem imagem, o cartão exibe um ícone centralizado na superfície container alta.</p>
          <div class='card-meta'>
            <time datetime='2026-09-20'><md-icon>schedule</md-icon>20 de set. de 2026</time>
          </div>
        </div>
      </article>
    </div>
    <nav aria-label='Paginação' class='blog-pager'>
      <md-text-button href='#'><md-icon slot='icon'>arrow_back</md-icon>Recentes</md-text-button>
      <md-outlined-button href='#' trailing-icon>Antigas<md-icon slot='icon'>arrow_forward</md-icon></md-outlined-button>
    </nav>
  </main>

  <aside class='sidebar'>
    <div class='section'>
      <div class='widget'>
        <h3 class='title'><md-icon>trending_up</md-icon>Populares</h3>
        <div class='widget-content popular-posts'>
          <a class='popular-post' href='#'><span class='popular-index'>1</span><img class='popular-thumb' alt='' src='${thumb(262, '')}' loading='lazy'/><span class='popular-title'>Cartões Material You no Blogger</span></a>
          <a class='popular-post' href='#'><span class='popular-index'>2</span><img class='popular-thumb' alt='' src='${thumb(200, '')}' loading='lazy'/><span class='popular-title'>Tokens de cor dinâmica com MCU</span></a>
          <a class='popular-post' href='#'><span class='popular-index'>3</span><img class='popular-thumb' alt='' src='${thumb(150, '')}' loading='lazy'/><span class='popular-title'>Modo escuro automático e acessível</span></a>
        </div>
      </div>
      <div class='widget'>
        <h3 class='title'><md-icon>label</md-icon>Rótulos</h3>
        <div class='widget-content cloud-label'><ul>
          <li><a href='#'>Material You <span class='label-count'>(12)</span></a></li>
          <li><a href='#'>Blogger <span class='label-count'>(9)</span></a></li>
          <li><a href='#'>Web Components <span class='label-count'>(7)</span></a></li>
          <li><a href='#'>Design <span class='label-count'>(5)</span></a></li>
        </ul></div>
      </div>
      <div class='widget'>
        <h3 class='title'><md-icon>calendar_month</md-icon>Arquivo</h3>
        <div class='widget-content flat-archive'><ul>
          <li><a href='#'>outubro de 2026 <span class='label-count'>(4)</span></a></li>
          <li><a href='#'>setembro de 2026 <span class='label-count'>(6)</span></a></li>
        </ul></div>
      </div>
      <div class='widget'>
        <h3 class='title'><md-icon>account_circle</md-icon>Sobre mim</h3>
        <div class='widget-content profile-widget'>
          <div class='profile-card'>
            <img class='profile-avatar' alt='Autor' src='${avatar}' loading='lazy'/>
            <div>
              <div class='profile-name'>Deivid</div>
              <p class='profile-location'>Brasil</p>
              <p class='profile-about'>Escrevendo sobre web, design e Material You.</p>
              <a class='profile-visit' href='#'>Ver meu perfil completo<md-icon>arrow_forward</md-icon></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</div>

<footer id='footer'>
  <div class='footer-inner'>
    <div class='footer-widgets'>
      <div class='widget'><h3 class='title'><md-icon>link</md-icon>Links úteis</h3>
        <div class='widget-content'><ul>
          <li><a href='#'>Documentação Material 3 <md-icon>open_in_new</md-icon></a></li>
          <li><a href='#'>GitHub do projeto <md-icon>open_in_new</md-icon></a></li>
        </ul></div></div>
      <div class='widget'><h3 class='title'><md-icon>info</md-icon>Sobre o blog</h3>
        <div class='widget-content'><p>Um blog com visual Material You, cor dinâmica e componentes Material Web.</p></div></div>
    </div>
    <div class='footer-bottom'>
      <span>© 2026 Meu Blog Material</span>
      <div class='attribution'><a href='#'>Tecnologia do <strong>Blogger</strong></a></div>
    </div>
  </div>
</footer>

<div id='m3-drawer-scrim'></div>
<aside aria-label='Menu' id='m3-drawer' role='dialog'>
  <div class='drawer-header'>
    <span class='drawer-title'>Meu Blog Material</span>
    <button aria-label='Fechar menu' class='m3-icon-link' data-drawer-close='' type='button'><md-icon>close</md-icon></button>
  </div>
  <nav class='drawer-nav'><ul>
    <li class='current'><a href='#'><md-icon>home</md-icon>Início</a></li>
    <li><a href='#'><md-icon>description</md-icon>Sobre</a></li>
    <li><a href='#'><md-icon>description</md-icon>Tutoriais</a></li>
  </ul></nav>
  <div class='drawer-footer'>
    <button aria-label='Pesquisar' class='m3-icon-link' data-search-open='' type='button'><md-icon>search</md-icon></button>
    <button aria-label='Alternar tema' class='m3-icon-link' data-theme-toggle='' type='button'><md-icon>light_mode</md-icon></button>
    <span class='drawer-hint'>Material You</span>
  </div>
</aside>

<div id='m3-search-scrim'></div>
<div aria-modal='true' id='search-modal' role='dialog'>
  <div class='search-head'>
    <md-icon>search</md-icon>
    <h2>Pesquisar este blog</h2>
    <button aria-label='Fechar busca' class='m3-icon-link' data-search-close='' type='button'><md-icon>close</md-icon></button>
  </div>
  <div class='search-body'>
    <form action='#' method='get'>
      <md-outlined-text-field aria-label='Pesquisar' name='q' placeholder='Pesquisar este blog'></md-outlined-text-field>
      <md-filled-button type='submit'><md-icon slot='icon'>search</md-icon>Pesquisar</md-filled-button>
    </form>
  </div>
</div>

<md-fab aria-label='Voltar ao topo' id='m3-to-top' size='small'><md-icon>arrow_upward</md-icon></md-fab>
<div id='m3-toast' role='status'>Link copiado</div>

<script type='module' src='../dist/theme.js'></script>
</body>
</html>`;

mkdirSync(join(root, 'preview'), { recursive: true });
writeFileSync(join(root, 'preview', 'index.html'), html);

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer((req, res) => {
  let path = req.url.split('?')[0];
  if (path === '/') path = '/index.html';
  const file = join(root, 'preview', path.startsWith('/dist/') ? path.replace('/dist/', '../dist/') : path);
  try {
    const data = readFileSync(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('não encontrado: ' + path);
  }
});

server.listen(port, () => {
  console.log(`Preview servido em http://localhost:${port}/`);
  console.log('Ctrl+C para encerrar.');
});
