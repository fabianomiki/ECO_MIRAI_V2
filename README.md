# ECO MIRAI TECHNOLOGY — Site institucional

Site institucional estático e bilíngue (português / inglês) da ECO MIRAI TECHNOLOGY LTDA.

## Estrutura

```
eco-mirai/
├── index.html          Página única com todas as seções
├── css/styles.css      Estilos e responsividade
├── js/i18n.js          Dicionário de traduções PT/EN
├── js/main.js          Troca de idioma, menu mobile, animações, galeria
├── assets/favicon.svg  Ícone do site
├── assets/galeria/     Fotos da seção Galeria
├── server.js           Servidor local para desenvolvimento (Node)
└── .claude/            Config de desenvolvimento + servidor alternativo em Perl
```

## Como visualizar

Basta abrir `index.html` em qualquer navegador — o site não depende de build nem de dependências externas.

Para servir por HTTP local (recomendado ao testar):

```
node server.js
```

Depois acesse `http://localhost:4321`.

**Sem Node instalado?** Esta máquina não tem Node nem Python, então há uma alternativa em Perl (que já vem com o Git for Windows), com o mesmo resultado:

```
perl .claude/dev-server.pl
```

Os dois servem a mesma pasta na porta 4321 — use o que estiver disponível. Ambos são só para desenvolvimento e não vão para produção.

> Vale servir por HTTP em vez de abrir o `index.html` direto do disco: em `file://`
> o navegador trata cada arquivo como origem isolada, o que pode bloquear o
> `localStorage` (a memória do idioma escolhido) dependendo do navegador.

## Publicação

Por ser 100% estático, o site pode ser hospedado em qualquer serviço de arquivos estáticos (hospedagem tradicional, Netlify, Vercel, GitHub Pages, S3). Envie o conteúdo da pasta `eco-mirai/` para a raiz do domínio.

**Não envie para produção:** `server.js`, `README.md` e a pasta `.claude/` — são apenas de desenvolvimento e ficariam publicamente acessíveis.

### Cabeçalhos de segurança recomendados

O `index.html` já traz uma `Content-Security-Policy` via `<meta>`, que cobre a maior parte do risco. Alguns cabeçalhos só funcionam via HTTP e devem ser configurados na hospedagem:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`frame-ancestors 'none'` (proteção contra clickjacking) **não funciona** dentro da tag `<meta>` — precisa vir do servidor. No Netlify use um arquivo `_headers`; na Vercel, `vercel.json`; no Apache, `.htaccess`.

## Idiomas

A troca PT/EN acontece no canto superior direito, sem recarregar a página. O idioma escolhido fica salvo no navegador (`localStorage`); na primeira visita, o site adota o idioma do navegador do visitante.

Todo texto visível é controlado por `js/i18n.js`. Para editar um conteúdo, localize a chave correspondente (por exemplo `hero.title`) e altere o texto **nos dois idiomas**. O atributo `data-i18n` no HTML indica qual chave alimenta cada elemento.

## Galeria de fotos

A seção **Galeria** (`#galeria`) exibe fotos de produtos, equipamentos e instalações, com ampliação em tela cheia ao clicar (setas do teclado navegam, `Esc` fecha).

> **As seis fotos atuais são de banco de imagens (Unsplash), não são da Eco Mirai.**
> Foram colocadas apenas para dar acabamento profissional à apresentação. A
> [licença do Unsplash](https://unsplash.com/license) permite uso comercial sem
> atribuição, mas **imagens genéricas de banco não devem representar instalações
> próprias em material institucional** — troque por fotos reais da empresa antes
> de publicar. Os arquivos são todos locais (`assets/galeria/`); o site não
> depende de nenhum servidor externo.

Para colocar as fotos reais:

1. Copie os arquivos de imagem para `assets/galeria/`.
2. Em `index.html`, na seção `#galeria`, troque o `src` de cada `<img>` pelo nome do arquivo — por exemplo `src="assets/galeria/planta-manaus.jpg"`.
3. Em `js/i18n.js`, ajuste as legendas nas chaves `gallery.cap1` a `gallery.cap6`, **nos dois idiomas**.
4. Remova o parágrafo de aviso (`gallery.note`) quando todas as fotos definitivas estiverem no lugar.

Para ter mais ou menos de seis fotos, duplique ou remova um bloco `<figure class="shot">` inteiro e crie/remova a chave correspondente no dicionário.

Formato recomendado: JPG ou WebP, cerca de 1600×1100 px, até ~400 KB por imagem. As fotos são recortadas na proporção 16:11 na grade, mas aparecem inteiras na ampliação.

## Pendências de conteúdo

Os itens abaixo foram inseridos como provisórios e precisam ser confirmados antes da publicação:

- **Telefone:** `+55 (92) XXXX-XXXX` — a definir.
- **E-mails departamentais:** `diretoria@`, `institucional@`, `juridico@`, `administrativo@` e `comercial@ecomirai.com.br` — sugeridos com base nas prioridades informadas; confirmar com o provedor de e-mail.
- **E-mail geral:** `contato@ecomirai.com.br` — informado como exemplo.
- **Endereço:** consta apenas "Edifício Atrium, Manaus – AM"; recomenda-se complementar com rua, número, sala e CEP.
- **Logotipo:** a marca no cabeçalho usa um símbolo em SVG criado como espaço reservado. Substitua por um arquivo oficial quando disponível.
- **Fotos da galeria:** as seis imagens são de banco de imagens e ilustram apenas o setor. Substitua pelas fotos oficiais da empresa conforme a seção "Galeria de fotos" acima. O arquivo `assets/galeria/placeholder.svg` continua disponível caso queira adicionar novos espaços antes de ter a foto.

Para trocar telefone e e-mails, edite os valores em `index.html` (seção `#contato`) e as chaves correspondentes em `js/i18n.js`.
