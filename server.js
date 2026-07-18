/* Servidor estático para desenvolvimento local — não é necessário em produção.
   Uso: node server.js  →  http://localhost:4321
   Static dev server — not required in production. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 4321;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    /* decodeURIComponent lanca URIError em URL malformada (ex.: "/%").
       Sem este try/catch a excecao derruba o processo inteiro. */
    let rel;
    try {
      rel = decodeURIComponent(req.url.split("?")[0]);
    } catch (e) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("URL malformada / Malformed URL");
    }
    if (rel === "/") rel = "/index.html";

    const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ""));

    /* startsWith(ROOT) casaria com uma pasta irma "..._backup"; path.relative
       so aceita caminhos realmente contidos na raiz. */
    const inside = path.relative(ROOT, file);
    if (inside.startsWith("..") || path.isAbsolute(inside)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Forbidden");
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        });
        /* nao devolve o caminho pedido: evita refletir entrada do usuario */
        return res.end("Nao encontrado / Not found");
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log("Eco Mirai → http://localhost:" + PORT));
