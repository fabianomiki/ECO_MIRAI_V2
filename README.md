# ECO MIRAI TECHNOLOGY — Site institucional

Site institucional estático e bilíngue (português / inglês) da ECO MIRAI TECHNOLOGY LTDA, representante comercial do Grupo KERUI no Brasil.

## Estrutura

```
├── index.html          Home — posicionamento, números e chamadas
├── empresa.html        Quem Somos, Missão e Valores, Presença (mapa)
├── portfolio.html      Quatro linhas de equipamentos + Galeria
├── kerui.html          Parceria KERUI — escala, fábrica e casos
├── contato.html        Departamentos e dados corporativos
├── css/styles.css      Estilos, cores e responsividade
├── js/i18n.js          Dicionário de traduções PT/EN
├── js/main.js          Idioma, menus, galeria e animações
├── assets/favicon.svg  Ícone do site
├── assets/galeria/     Fotos de produtos
├── server.js           Servidor local de desenvolvimento (Node)
└── .claude/            Config de desenvolvimento + servidor alternativo em Perl
```

O site é multipágina: cada página é um HTML independente que compartilha o mesmo CSS e JS. Não há build nem dependências externas.

## Como visualizar

Para servir por HTTP local:

```
node server.js
```

Depois acesse `http://localhost:4321`.

Se o Node não estiver disponível, há uma alternativa em Perl (que já vem com o Git for Windows), com o mesmo resultado:

```
perl .claude/dev-server.pl
```

Ambos servem a mesma pasta na porta 4321 e são apenas para desenvolvimento.

> Prefira servir por HTTP em vez de abrir o HTML direto do disco: em `file://` o
> navegador trata cada arquivo como origem isolada, o que pode bloquear o
> `localStorage` (a memória do idioma escolhido) e impede o carregamento do CSS
> e do JS em alguns navegadores.

## Publicação

Por ser 100% estático, o site roda em qualquer hospedagem de arquivos (hospedagem tradicional, Netlify, Vercel, GitHub Pages, S3). Envie os arquivos da raiz do projeto para a raiz do domínio.

**Não envie para produção:** `server.js`, `README.md` e a pasta `.claude/`.

**Antes de publicar, remova a linha `<meta name="robots" content="noindex, nofollow">`** que está no `<head>` das cinco páginas. Ela existe para impedir que buscadores indexem a versão de preview, que ainda tem contatos provisórios.

### Cabeçalhos de segurança recomendados

As páginas já trazem uma `Content-Security-Policy` via `<meta>`. Alguns cabeçalhos só funcionam via HTTP e devem ser configurados na hospedagem:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`frame-ancestors 'none'` (proteção contra clickjacking) **não funciona** dentro da tag `<meta>` — precisa vir do servidor. No Netlify use um arquivo `_headers`; na Vercel, `vercel.json`; no Apache, `.htaccess`.

## Idiomas

A troca PT/EN fica no cabeçalho, à direita, e acontece sem recarregar a página. O idioma escolhido é salvo no navegador (`localStorage`) e **persiste ao navegar entre as páginas**; na primeira visita, o site adota o idioma do navegador do visitante. Se o `localStorage` estiver bloqueado, a troca continua funcionando — apenas não é lembrada.

Todo texto visível é controlado por `js/i18n.js`. Para editar um conteúdo, localize a chave (por exemplo `hero.title`) e altere o texto **nos dois idiomas**. No HTML:

- `data-i18n` alimenta o texto do elemento;
- `data-i18n-alt` alimenta o `alt` de imagens;
- `data-i18n-aria` alimenta o `aria-label` de botões.

Cada página declara `<body data-page="…">`, e o dicionário usa esse valor para definir o `<title>` e a `description` por página (chaves `meta.<pagina>.title` e `meta.<pagina>.desc`).

## Galeria de fotos

A galeria fica em `portfolio.html` (`#galeria`) e exibe **nove fotos de produtos KERUI**, com ampliação em tela cheia ao clicar (setas do teclado navegam, `Esc` fecha, o foco fica preso no diálogo enquanto aberto).

As imagens foram extraídas da apresentação técnica oficial da KERUI e mostram equipamentos reais: compressores, vaso de pressão, unidades de nitrogênio e unidade de perfuração a ar. O aviso ao pé da galeria (`gallery.note`) atribui o material à KERUI — **mantenha essa atribuição** enquanto as fotos forem do fabricante parceiro.

Para trocar ou acrescentar fotos:

1. Copie os arquivos para `assets/galeria/`.
2. Em `portfolio.html`, na seção `#galeria`, ajuste o `src` e o `alt` de cada `<img>`.
3. Em `js/i18n.js`, ajuste as legendas nas chaves `gallery.cap1` a `gallery.cap9`, **nos dois idiomas**.

Para ter mais ou menos de nove fotos, duplique ou remova um bloco `<figure class="shot">` inteiro e crie/remova a chave correspondente no dicionário.

Formato recomendado: JPG ou WebP, cerca de 1600×1100 px, até ~400 KB por imagem. As fotos são recortadas na proporção 16:11 na grade, mas aparecem inteiras na ampliação (limitadas a 74% da altura da tela).

## Hero da home (carrossel de fundos)

O fundo da home (`index.html`) alterna entre **três cenas em SVG**, com transição suave por fade a cada 6 segundos: (1) Amazônia & conexões — o hub; (2) petróleo & gás / tecnologia KERUI; (3) posicionamento estratégico — gerar negócios. Cada cena é um `<div class="hero__slide">`; a primeira tem a classe `is-active`.

O carrossel **pausa quando o mouse está sobre o hero** e respeita a preferência de sistema "reduzir animações" (nesse caso mostra apenas a primeira cena, sem troca). Toda a arte é vetorial e local — nenhuma imagem externa, coerente com a CSP.

Para trocar por fotos reais no futuro, substitua o conteúdo de cada `.hero__slide` por um `<img>` (ou mantenha o SVG). O degradê de leitura (`.hero__bg::after`) já garante o contraste do texto sobre qualquer fundo.

## Botões flutuantes (WhatsApp + SAC/FAQ)

Todas as páginas trazem, no canto inferior direito, dois botões fixos (`<div class="fab">`):

- **WhatsApp** (verde) — abre uma conversa em `wa.me`. **Número provisório** — ver "Pendências de conteúdo".
- **SAC / FAQ** (petróleo) — abre um e-mail para o SAC.

Os rótulos são bilíngues via `data-i18n-aria` e `data-i18n-title` (chaves `fab.whatsapp` e `fab.sac`).

## Mapa de atuação

O mapa da seção **Presença** (`empresa.html#presenca`) é um SVG desenhado à mão, sem biblioteca nem imagem externa. As formas usam **longitude e latitude reais**: o grupo tem `transform="scale(1,-1)"` porque no SVG o eixo Y cresce para baixo enquanto a latitude cresce para cima. Na prática, você escreve as coordenadas na ordem natural `longitude,latitude`.

O `viewBox="-118 -33 84 89"` cobre da Baixa Califórnia (–118°) ao litoral leste do Brasil (–34°), e do norte do México (33°) à Terra do Fogo (–56°).

**Para destacar um país** quando a atuação por lá for confirmada, acrescente um `<path>` com a classe `map__country` dentro do grupo espelhado, e a regra correspondente no CSS:

```css
.map__country{fill:var(--teal-300);stroke:#0a5f56;stroke-width:1;vector-effect:non-scaling-stroke}
```

**Para adicionar um marcador de cidade**, copie o bloco `.map__hq` e troque as coordenadas em `transform="translate(longitude, -latitude)"` — note o **sinal negativo na latitude**, porque o marcador fica fora do grupo espelhado. Manaus (–60,02; –3,1) vira `translate(-60.02, 3.1)`.

> Atenção ao `transform-box: fill-box` na regra `.map__pulse`. Sem ele, o padrão do SVG (`view-box`) faz o `transform-origin: center` apontar para o centro do viewBox, e o anel pulsante aparece longe do marcador.

O contorno é simplificado de propósito — é um mapa de referência institucional, não uma carta geográfica.

## Atribuição do conteúdo KERUI

Os números, capacidades industriais, especificações técnicas e casos de sucesso apresentados no Portfólio e na página da Parceria pertencem ao **Grupo KERUI**, fabricante parceiro. A página `kerui.html` traz um aviso explícito nesse sentido, e o texto de abertura deixa claro que a Eco Mirai é a representante comercial.

Essa separação é intencional: ela preserva a força comercial do argumento ("representamos quem tem essa estrutura") sem atribuir à Eco Mirai uma planta industrial que não é dela.

## Pendências de conteúdo

Os itens abaixo são provisórios e precisam ser confirmados antes da publicação:

- **Telefone:** `+55 (92) XXXX-XXXX` — a definir. A própria apresentação da Eco Mirai trazia o número zerado.
- **Número do WhatsApp (botão flutuante):** o botão aponta para `https://wa.me/5511933013000` — **(11) 93301-3000**, informado pelo cliente como número **temporário**. Note que o DDD é 11 (São Paulo), enquanto a sede da empresa é em Manaus (DDD 92); confirmar se este será o número definitivo de atendimento. Para trocar, edite o `href` em cada um dos cinco arquivos `.html` (formato `55` + DDD + número, só dígitos) — há um comentário logo acima da tag `<div class="fab">`.
- **E-mail do SAC:** o botão SAC/FAQ abre um e-mail para `sac@ecomirai.com.br` — endereço sugerido; confirmar com o provedor de e-mail.
- **E-mails departamentais:** `diretoria@`, `institucional@`, `juridico@`, `administrativo@` e `comercial@ecomirai.com.br` — sugeridos a partir das prioridades informadas; confirmar com o provedor de e-mail.
- **E-mail geral:** `contato@ecomirai.com.br` — informado como exemplo.
- **Endereço:** consta apenas "Manaus — Amazonas, Brasil". A apresentação oficial trazia "Rua Lorem Ipsum, nº 123" (texto de espaço reservado), então o endereço completo ainda precisa ser fornecido.
- **Logotipo:** a marca no cabeçalho usa um símbolo em SVG criado como espaço reservado. Substitua por um arquivo oficial quando disponível.
- **Linha de geradores a gás:** é a única das quatro linhas sem foto de produto na galeria — não havia imagem identificável com segurança no material recebido.

Para trocar telefone e e-mails, edite os valores em `contato.html` e as chaves correspondentes em `js/i18n.js`.
