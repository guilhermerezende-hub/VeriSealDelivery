import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// Servidor local de desenvolvimento. Expõe somente os arquivos públicos do site.
http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const parts = pathname.split(/[\\/]/).filter(Boolean);
      const allowed = ["index.html", "sobre.html", "assets", "js", "produtos"];
      if (
        parts.some((part) => part.startsWith(".")) ||
        (parts.length && !allowed.includes(parts[0]))
      ) {
        response.writeHead(404).end("Não encontrado");
        return;
      }
      let file = path.resolve(root, ...parts);
      const relative = path.relative(root, file);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        response.writeHead(403).end("Acesso negado");
        return;
      }
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const content = await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(content);
    } catch {
      response.writeHead(404).end("Não encontrado");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`VeriSeal: http://127.0.0.1:${port}`),
  );
