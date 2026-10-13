# NOTAS — Pesquisa e decisões do tema Blogger Material You

> Registro da Fase 1 (pesquisa obrigatória) antes de qualquer código.
> Data: 2026-10-13 · Autor: engenharia do tema `blogger-material-you`

---

## 1. Como funcionam os temas do Blogger (aprendizados verificados)

### 1.1 Fontes utilizadas

A documentação oficial de temas do Blogger está fragmentada (várias páginas de
`support.google.com/blogger` citadas pela comunidade foram removidas ou movidas).
Por isso, a fonte primária de verificação foram **temas reais em produção**,
baixados do GitHub e inspecionados tag por tag:

| Fonte | Papel |
|---|---|
| `bloggerpack/bloggerpack` → `starters/blank/dist/theme.xml` | Esqueleto mínimo **válido** de tema v3 (framework open-source de temas Blogger) |
| `joeyliu6/Blogger` → `Notable-modified.xml` | **Tema oficial do Blogger** (Notable) — markup padrão de PageList, BlogSearch, Attribution, BlogArchive, Profile |
| `fdciabdul/Premium-Blogger-Template` → `New Maggner.xml` | Sistema completo de comentários threadados (herdado do padrão Contempo) e SEO head |
| `jettheme/core` → `jettheme-v2.xml` | Widgets customizados modernos, `<Variable>` e `b:widget-settings` |
| Igniplex v2.6 | BlogArchive hierárquico, Profile v2 completo |

### 1.2 Estrutura obrigatória de um tema XML

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3'
      b:responsive='true'
      expr:dir='data:blog.languageDirection' expr:lang='data:blog.locale'
      xmlns='http://www.w3.org/1999/xhtml'
      xmlns:b='http://www.google.com/2005/gml/b'
      xmlns:data='http://www.google.com/2005/gml/data'
      xmlns:expr='http://www.google.com/2005/gml/expr'>
```

- `b:css='false'` → impede o Blogger de injetar o CSS padrão dos temas antigos.
- `b:layoutsVersion='3'` + `b:defaultwidgetversion='2'` → modo moderno (Layouts v3,
  widgets version 2). Todos os `<b:widget>` devem ter `version='2'`.
- `b:responsive='true'` → presente no tema oficial Notable; controla a visão mobile.
- Os namespaces `b:`, `data:`, `expr:` são **obrigatórios** ou o upload falha.

### 1.3 Tags de template (verificadas em uso real)

| Tag | Função |
|---|---|
| `<b:section id='…' name='…' maxwidgets='N' showaddelement='yes|no'>` | Área editável no painel Layout; `id` único obrigatório |
| `<b:widget id='X1' locked='true|false' title='…' type='Blog' version='2' visible='true'>` | Instância de gadget; `id` = Tipo+Número |
| `<b:widget-settings><b:widget-setting name='…'>valor</b:widget-setting></b:widget-settings>` | Configuração inicial do widget (aceita CDATA) |
| `<b:includable id='main' var='post'>…</b:includable>` | Corpo do widget; `main` é o ponto de entrada |
| `<b:include name='…' data='…' cond='…'/>` | Reutiliza includable; `data` repassa contexto |
| `<b:include name='super.main'/>` | Chama o **markup padrão do Blogger** para aquele includable (usado pelo Igniplex no BlogArchive) |
| `<b:loop values='data:posts' var='post' index='i'>` | Iteração |
| `<b:if cond='…'>/<b:elseif cond='…'>/<b:else/>` | Condicional |
| `<b:eval expr='…'/>` | Expressão inline |
| `<b:attr name='href' expr:value='…' cond='…'/>` | Atributo dinâmico |
| `<b:class cond='…' name='classe'/>` / `<b:class expr:name='…'/>` | Adiciona classe ao elemento pai |
| `<b:tag cond='…' name='a' expr:href='…'>` | Elemento dinâmico (Notable/Maggner) |
| `<b:message name='messages.authorSaid'><b:param …/></b:message>` | Mensagem localizada com parâmetros |
| `<b:with value='…' var='x'>` | Define variável de contexto |
| `<b:comment>…</b:comment>` | Comentário seguro |
| `<b:template-script inline='true' name='threaded_comments'/>` | Script interno do Blogger (comentários) |
| `<b:skin><![CDATA[ /* CSS + <Variable> */ ]]></b:skin>` | CSS do tema + definição de variáveis do Designer |
| `<b:template-skin>` | CSS do editor de Layout (apenas em `data:view.isLayoutMode`) |

### 1.4 Operadores de expressão verificados

- Concatenação: `expr:id='"post-" + data:post.id'` ✔
- Elvis / fallback: `data:post.link ?: data:post.url`, `data:cmtIframeInitialHeight ?: "90px"` ✔
- Operadores lógicos: `and`, `or`, `not`, `!=`, `==` ✔
- Pertença a conjunto: `data:imagePlacement in {"REPLACE","BEFORE_DESCRIPTION"}` ✔
- Operador pós-fixo de imagem: `data:post.featuredImage resizeImage 100` ✔
  e forma funcional: `resizeImage(data:authorPhoto.image, 100, "1:1")` ✔
- Coleções: `data:posts.notEmpty`, `data:posts.empty`, `data:posts.any`, `data:posts.first` ✔
- Escape em atributos: `&quot;` dentro de `expr:'…'` com aspas simples ✔
- Acesso a variável do Designer em expressões: `data:skin.vars.row_width` ✔ (nome com `.` vira `_`)

### 1.5 `data:` mais usados (todos vistos em temas reais)

**Globais:** `data:blog.title`, `data:blog.homepageUrl`, `data:blog.url.canonical`,
`data:blog.canonicalUrl`, `data:blog.searchUrl`, `data:blog.languageDirection`,
`data:blog.locale`, `data:blog.isMobileRequest`, `data:bloggerUrl`,
`data:view.title(.escaped)`, `data:view.description(.escaped)`,
`data:view.url.canonical`, `data:view.featuredImage`,
`data:view.isHomepage / isPost / isPage / isSingleItem / isMultipleItems / isSearch /
isLabelSearch / isArchive / isError / isPreview / isLayoutMode`,
`data:view.search.query(.escaped)`, `data:view.search.label`,
`data:view.search.resultsMessageHtml`, `data:view.archive.rangeMessage`.

**Post:** `data:post.id`, `data:post.title`, `data:post.body`, `data:post.url`,
`data:post.link`, `data:post.featuredImage`, `data:post.date` (+ `.iso8601`),
`data:post.lastUpdated.iso8601`, `data:post.author.name / .profileUrl /
.authorPhoto.image / .aboutMe`, `data:post.labels` (loop → `data:label.name/.url/.count`),
`data:post.numberOfComments`, `data:post.allowComments`, `data:post.allowNewComments`,
`data:post.noNewCommentsText`, `data:post.snippet` (widgets),
`data:post.commentSource`, `data:post.showThreadedComments`, `data:post.embedCommentForm`,
`data:post.commentHtml`, `data:post.cmtfpIframe`, `data:post.appRpcRelayPath`,
`data:post.commentSrc`, `data:post.commentJso/.commentMsgs/.commentConfig`,
`data:post.commentFormIframeSrc`, `data:post.commentsUrl`, `data:post.commentsUrlOnclick`,
`data:cmtIframeInitialHeight`, `data:showCmtPopup`, `data:this.messages.blogComment`.

**Widgets:** PageList → `data:links` (`link.href`, `link.title`, `link.isCurrentPage`);
Label → `data:labels` (`label.name/.url/.count`) + `data:this.display/.showFreqNumbers`;
BlogArchive → `data:this.style` (HIERARCHY/FLAT/MENU) e `data:this.data`
(`archive.name/.url/.post-count`); PopularPosts → `data:posts` com `post.title/.url/
.featuredImage/.date` + `data:postDisplay.showFeaturedImage/.showSnippet`;
Profile → `data:team`, `data:authors`, `data:displayname`, `data:aboutme`, `data:location`,
`data:userUrl`, `data:authorPhoto.image/.height/.width`;
Attribution → `data:bloggerUrl`, `data:imageAuthor`, `data:copyright`;
BlogSearch → `data:blog.searchUrl` + `data:view.search.query.escaped`;
Header → `data:title`, `data:image`, `data:imagePlacement`, `data:this.description`;
HTML/Text → `data:content`; ContactForm → `data:contactFormNameMsg/.contactFormEmailMsg/
.contactFormMessageMsg/.contactFormSendMsg` + `data:widget.instanceId`.

**Mensagens localizadas (`data:messages.*`) confirmadas:** `home`, `newer`, `older`,
`oldest`, `newest`, `noTitle`, `theresNothingHere`, `postAComment`, `postedBy`,
`searchThisBlog`, `showAll`, `noResultsFound`, `archive`, `visitProfile`,
`viewMyCompleteProfile`, `deleteComment`, `poweredByBlogger`, `moreEllipsis`.

### 1.6 Padrão dos comentários threadados (padrão Contempo, verificado no Maggner)

O fluxo oficial é:

```
commentPicker
├─ data:post.commentSource == 1        → iframeComments (Blogger/Google+ legacy)
├─ data:post.showThreadedComments      → threadedComments (nativo threadado)
└─ else                                → comments (lista simples)
```

`threadedComments` renderiza `<data:post.commentHtml/>` (o Blogger injeta a lista
completa) + `threadedCommentJs` com:

```xml
<script async='async' expr:src='data:post.commentSrc' type='text/javascript'/>
<b:template-script inline='true' name='threaded_comments'/>
<script>blogger.widgets.blog.initThreadedComments(
  <data:post.commentJso/>, <data:post.commentMsgs/>, <data:post.commentConfig/>);</script>
```

O formulário usa iframe colorido: `BLOG_CMT_createIframe('<data:post.appRpcRelayPath/>')`
e `<a id='comment-editor-src' expr:href='data:post.commentFormIframeSrc + "&skin=contempo"'/>`.

**Descoberta-chave (bloggerpack):** o widget `Blog` tem ~40 includables padrão do
Blogger. Para assumir o controle total sem "vazamento" do markup default, define-se
`main` próprio e **neutralizam-se os demais com includables vazios**
(`<b:includable id='commentPicker'/>` etc.), implementando apenas os que o tema usa.

### 1.7 Variáveis do Designer de Temas

Ficam **dentro de um comentário CSS** no CDATA do `<b:skin>`:

```xml
<b:skin><![CDATA[/*
<Variable name="keycolor" description="Main Color" type="color" default="#6750a4" value="#6750a4"/>
<Group description="Tipografia" selector="body">
  <Variable name="body.font" description="Fonte" type="font"
    default="400 16px Roboto Flex, sans-serif" value="400 16px Roboto Flex, sans-serif"/>
</Group>
*/ … CSS … ]]></b:skin>
```

Tipos vistos: `color`, `font`, `length` (com `min`/`max`), `background`, `automatic`;
atributos extras: `hideEditor="true"`. Uso no CSS: `$(keycolor)`; uso em expressões:
`data:skin.vars.body_font`.

### 1.8 Erros comuns de upload (mapeados)

- `&` solto em URLs dentro de atributos → usar `&amp;`.
- `<`/`>` literais em texto de atributos/includables → escapar.
- Script inline: envolver em `<script>//<![CDATA[ … //]]></script>`; alternativamente
  escapar aspas com `&#39;`/`&quot;` (padrão visto no Maggner).
- `]]>` nunca pode aparecer dentro de CDATA.
- Widget sem `<b:includable id='main'>` ou `<b:section>` sem `id` único → rejeição.
- Referências a `data:` inexistentes → rejeição no momento de salvar/restaurar
  (por isso todo `data:` usado neste tema foi conferido em tema real).

---

## 2. Material You (Material 3) para Web — aprendizados

### 2.1 Estado atual do `@material/web` (verificado no npm e no README oficial)

- Versão estável atual: **2.5.0** (`npm view @material/web`).
- ⚠️ O README oficial diz: *"MWC is in maintenance mode pending new maintainers"*
  (discussão #5642). O projeto não recebe novos componentes; bugfixes continuam.
  **Implicação**: escolhemos um conjunto conservador de componentes maduros e
  complementamos com CSS próprio (M3 fiel) para o que não existe no pacote.

### 2.2 Componentes que EXISTEM no pacote 2.5.0 (verificado no tarball npm)

```
button/        filled-button, outlined-button, text-button, elevated-button, filled-tonal-button
iconbutton/    icon-button, filled-icon-button, filled-tonal-icon-button, outlined-icon-button
fab/           fab, branded-fab
chips/         assist-chip, filter-chip, input-chip, suggestion-chip (+ chip-set)
dialog/        dialog
divider/       divider
elevation/     elevation
icon/          icon
list/          list, list-item
menu/          menu, menu-item, sub-menu
progress/      circular-progress, linear-progress
ripple/        ripple
tabs/          tabs (primary-tab, secondary-tab)
textfield/     filled-text-field, outlined-text-field
select/        filled-select, outlined-select (+ select-option)
switch/ slider/ checkbox/ radio/ checkbox
typography/    md-typescale-styles.js
labs/card/     elevated-card, filled-card  (⚠ experimental — não usaremos)
```

**Importante:** NÃO existem `md-elevated-card` estável, `md-navigation-bar`,
`md-navigation-drawer` nem `md-navigation-rail` no pacote estável 2.5.0.
→ Cartões, gaveta e barra inferior serão **elementos próprios estilizados com os
tokens M3** (âncoras reais `<a>` — melhor para SEO e para o Blogger).

### 2.3 Tokens e tipografia

- Os componentes consomem `--md-sys-color-*` (ex.: `--md-sys-color-primary`).
  Cabe ao autor **fornecer** os tokens; o `@material/material-color-utilities`
  gera o esquema a partir de uma cor semente.
- Tiposcale via `import {styles as typescaleStyles} from
  '@material/web/typography/md-typescale-styles.js'` (exemplo do README oficial).
- Ícones: `md-icon` usa fonte de ícones; configuramos `--md-icon-font` para
  **Material Symbols Rounded** (Google Fonts) com ligaduras (ex.: `<md-icon>search</md-icon>`).
- Fonte: **Roboto Flex** (Google Fonts, variável) + fallback system-ui.

### 2.4 `@material/material-color-utilities` 0.4.0 — API verificada no `.d.ts`

```ts
themeFromSourceColor(source: number, customColors?): Theme
// Theme { source, schemes: { light: Scheme, dark: Scheme }, palettes: {...} }
applyTheme(theme, { dark?: boolean, target?: HTMLElement,
                    brightnessSuffix?: boolean, paletteTones?: number[] })
hexFromArgb(argb: number): string
argbFromHex(hex: string): number
```

`Scheme.props` devolve pares como `primary`, `onPrimary`, `primaryContainer`,
`onPrimaryContainer`, `surface`, `surfaceContainerLow/…/Highest`, `outline`,
`outlineVariant`, etc. O `applyTheme` aplica `--md-sys-color-*` num elemento alvo —
mas como precisamos dos **dois** esquemas (claro e escuro) simultâneos com
alternância sem recalcular, faremos o set manual dos tokens:
claro em `:root` e escuro em `:root[data-theme="dark"]` (gerado via CSSOM).

---

## 3. Análise da referência visual — https://ashellyou.github.io/

O site **aShell You** é uma landing page Material You (app Android), construída
com tokens próprios no espírito do M3. **Nenhum código foi copiado**; extraímos a
linguagem visual (tokens e estruturas) e recriamos tudo com implementação própria.

### 3.1 O que medimos (tokens.css / styles.css do site)

- **Superfícies M3 completas**: `surface`, `surface-bright`, `surface-container-low/
  /high/highest`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`,
  `primary/primary-container/…`, `secondary-container`, `tertiary(-container)`, `error(-container)`.
- **Cor dinâmica por matiz**: `--hue` único controla tudo em `oklch()`; tertiary = hue+60.
  → No nosso tema, o equivalente é o esquema HCT do Material Color Utilities a partir
  da cor semente.
- **Formas**: escala `--shape-xs…3xl` = 8/12/16/20/28/36/48px e `--shape-full: 999px`;
  cartões com raios grandes (16–20px), pílulas plenas em botões/nav/chips.
- **Tipografia**: *Google Sans Flex* (eixos opsz/wdth/wght/ROND) + *Google Sans Code*
  (mono) + *Material Symbols Rounded*. Escala: label .875rem, body 1.0625rem,
  title 1.375rem, headline/display com `clamp()` fluido.
  → Equivalente acessível no Blogger: **Roboto Flex** + Material Symbols Rounded.
- **App bar**: sticky, altura 4.5rem, fundo `surface`; ao rolar → `surface-container`
  + hairline `outline-variant` (classe `is-scrolled`).
- **Movimento**: easings M3 (`standard` cubic-bezier(0.2,0,0,1), `emphasized`
  (0.05,0.7,0.1,1)) e durações 150–900ms.
- **Acessibilidade**: link "skip", `sr-only`, contraste alto, foco visível.
- **Estrutura de página**: appbar (brand + nav + ações), hero com display grande,
  grade de cartões (`mcard` com cabeçalho/corpo/status), painéis com forma "panel"
  (raio enorme), chips, seções alternando superfícies tonais.

### 3.2 O que replicamos/adaptamos no tema

| Do site | No tema Blogger |
|---|---|
| App bar sticky com mudança ao rolar | Top app bar M3 idêntico (classe `is-scrolled`) |
| Cartões grandes arredondados, superfícies tonais | Cartões de post (thumb 16:9, título, resumo, chips de rótulos, data) |
| Pílulas/chips arredondados | Chips de rótulo como `<a>` com forma full |
| Display/headline fluidos | `clamp()` na tipografia do blog |
| Botões tonais/filled M3 | Botões `md-*` no pager, busca, 404, compartilhamento |
| `theme-color` por esquema | `<meta name="theme-color">` claro/escuro atualizado por JS |
| Raio enorme em painéis | Drawer mobile, diálogos e cartões de comentário com raio xl |
| Movimento M3 | Mesmas easings/durações; respeita `prefers-reduced-motion` |

---

## 4. Decisão crítica: build ou sem build?

### 4.1 Fatos

1. O Blogger aceita **um único arquivo XML** e não executa npm/Vite/bundler.
2. `@material/web` é distribuído como ES modules com *bare imports*
   (`import '@material/web/button/filled-button.js'`) que **não resolvem no
   navegador** sem import map ou bundler.
3. O README oficial mostra o caminho *buildless* oficial: **import map apontando
   para `https://esm.run/@material/web/`** + `import '@material/web/all.js'`.

### 4.2 Opção A — CDN ESM (esm.run) sem build

✅ Simples, sem pipeline. ❌ Porém:
- `all.js` carrega **todos** os componentes (centenas de KB) ou exige dezenas de
  imports individuais no XML (cada um uma requisição ao CDN que reescreve módulos);
- dependência de terceiro no caminho crítico de renderização (esm.run/jsDelivr
  reescrevendo bare imports em runtime);
- sem controle de versão fino/minificação/árvore: qualquer mudança do CDN pode
  quebrar o blog silenciosamente;
- difícil cachear corretamente.

**Veredito: viável, mas frágil para um tema que será instalado por outras pessoas.**

### 4.3 Opção B — Com build ✅ (ESCOLHIDA)

Pipeline Vite que empacota **apenas os componentes usados** + o código do tema
(`color.js`, `main.js`) num único `theme.js` minificado (~90 KB, ~30 KB gzip),
publicado no **GitHub Pages** com URL estável:

```
https://deivid22srk.github.io/blogger-material-you/theme.js
```

- O XML do Blogger referencia o `theme.js` via `<script type='module' src='…' defer>`.
- Todo o **CSS do layout** vive no `<b:skin>` (inline, editável pelo Designer),
  com tokens M3 como fallback mesmo sem JS; o JS só sobrescreve os tokens quando
  a cor dinâmica é calculada.
- GitHub Actions valida o XML, publica artefato e o Pages — o tema nunca quebra
  por causa de CDN externo.
- Bônus: o jsDelivr também serve o repositório (`cdn.jsdelivr.net/gh/…`) como
  fallback documentado.

### 4.4 Consequências da decisão

- Precisamos do workflow `.github/workflows/build.yml` (Fase 3) — feito.
- O `theme.js` é cacheado com hash de versão no path do Pages (branch main).
- Se o GitHub Pages estiver desligado, o tema continua funcionando com os tokens
  de fallback do `<b:skin>` (sem cor dinâmica), degradação graciosa.

---

## 5. Decisões de arquitetura do tema

| Tema | Decisão | Motivo |
|---|---|---|
| Cartões de post | `<a>`/`<article>` próprios com tokens M3 | `md-elevated-card` não existe estável; âncoras reais = SEO |
| Navegação desktop | Lista M3-tabs com `<a>` reais (indicador pílula) | `md-tabs` não renderiza âncoras → pior SEO |
| Drawer mobile | Painel próprio com scrim + `dialog`-like M3 | `md-navigation-drawer` não existe no pacote |
| Chips de rótulo | `<a>` com forma M3 full | `md-filter-chip` não tem `href` |
| Botões, FAB, dialog de busca, text-field, ícones, divider, progress | Componentes `@material/web` reais | Maduros, acessíveis, ripple nativo |
| Cor dinâmica | MCU `themeFromSourceColor` no cliente, lendo `--m3-seed` do `<b:skin>` (`$(keycolor)`) | Seed configurável no Designer do Blogger sem tocar no JS |
| Claro/escuro/auto | `data-theme` no `<html>` + `localStorage` + `prefers-color-scheme` | Padrão M3 |
| Posts relacionados | Feed JSON do próprio blog (`/feeds/posts/default/-/rótulo`) via JS | Não há data tag nativa |
| Tempo de leitura | JS client-side a partir do `post.body` | Não há data tag nativa |
| JSON-LD `BlogPosting` | JS a partir das meta tags renderizadas | Evita refs `data:` não verificadas dentro de `<script>` |
| Compartilhar | Web Share API + fallback X/WhatsApp/Telegram/cópia | Sem dependências |
| Widgets incluídos por padrão | Header, Blog, PageList, BlogSearch, PopularPosts, Label, BlogArchive, Profile, HTML, Attribution, LinkList | Núcleo útil |
| Followers / ContactForm / FeaturedPost | Não incluídos por padrão; podem ser adicionados via **Layout** (o Blogger aplica markup default) e herdam o CSS de `.widget` | Reduz risco de validação; ContactForm tem markup pronto na documentação interna do projeto |

---

## 6. Checklist de validação do XML (executada no build)

1. Boa formação via `fast-xml-parser` (e `xmllint` quando disponível).
2. Proibido `]]>` dentro de CDATA; `&` sempre escapado fora de CDATA.
3. Toda seção com `id` único; todo widget com `main`.
4. Nenhum `data:` fora da lista verificada (§1.5).
5. Preview local (harness estático) com screenshots desktop/mobile claro/escuro.
