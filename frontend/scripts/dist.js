// Monta frontend/dist/ com os arquivos públicos do site, prontos para enviar à
// hospedagem pelo FileZilla (pasta public_html da HostGator).
//
//   npm run dist -- --api https://seu-app.runasp.net/api [--dominio www.seusite.com.br]
//
// --api      endereço público da API em C# (gravado em dist/js/config.js)
// --dominio  domínio do site, mostrado na barra da tela de verificação (opcional)
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "dist");
const PUBLIC = [
  "index.html",
  "login.html",
  "sobre.html",
  "entregadores.html",
  "painel.html",
  "assets",
  "js",
  "produtos",
  "styles",
];

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

let api = String(option("api") || process.env.VERISEAL_API_URL || "")
  .trim()
  .replace(/\/+$/, "");
if (!/^https?:\/\/[^/\s]+/i.test(api)) {
  console.error(
    "Informe o endereço público da API. Exemplo:\n  npm run dist -- --api https://seu-app.runasp.net/api",
  );
  process.exit(1);
}
if (!/\/api$/i.test(api)) api += "/api";
if (/^http:\/\//i.test(api))
  console.warn(
    "Atenção: a API está sem HTTPS. Um site aberto com https:// não consegue chamar uma API http://.",
  );
const domain = String(option("dominio") || "")
  .trim()
  .replace(/^https?:\/\//i, "")
  .replace(/\/.*$/, "");

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const item of PUBLIC)
  await cp(path.join(root, item), path.join(out, item), { recursive: true });

const configFile = path.join(out, "js", "config.js");
const original = await readFile(configFile, "utf8");
let config = original.replace(
  /export const API_PUBLIC_URL = ".*?";/,
  `export const API_PUBLIC_URL = ${JSON.stringify(api)};`,
);
if (config === original)
  throw new Error("Não encontrei API_PUBLIC_URL em js/config.js.");
if (domain)
  config = config.replace(
    /export const SITE_HOST = ".*?";/,
    `export const SITE_HOST = ${JSON.stringify(domain)};`,
  );
await writeFile(configFile, config);

await writeFile(
  path.join(out, ".htaccess"),
  `# VeriSeal Delivery: configuração do Apache da hospedagem (HostGator).
Options -Indexes
DirectoryIndex index.html

# Sempre abrir com https:// (cadeado). Só funciona depois que o SSL do domínio
# estiver ativo no cPanel; antes disso, apague este bloco.
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

<IfModule mod_mime.c>
  AddType text/javascript .js
  AddType image/webp .webp
  AddType image/svg+xml .svg
</IfModule>

# HTML e JS sempre conferidos com o servidor, para uma nova publicação aparecer na hora.
<IfModule mod_headers.c>
  <FilesMatch "\\.(html|js)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`,
);

async function count(dir) {
  let files = 0,
    bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await count(full);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += (await stat(full)).size;
    }
  }
  return { files, bytes };
}
const total = await count(out);
console.log(
  `Pronto: frontend/dist com ${total.files} arquivos (${(total.bytes / 1048576).toFixed(1)} MB).`,
);
console.log(`API: ${api}${domain ? `  ·  domínio: ${domain}` : ""}`);
console.log("Envie TODO o conteúdo de frontend/dist para a pasta public_html.");
