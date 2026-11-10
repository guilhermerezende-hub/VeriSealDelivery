import { mkdir, readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
import { FREE_SHIP, SHIP_FEE } from "../js/config.js";
import { pix } from "../js/commerce.js";

const root = new URL("../", import.meta.url);
const context = { window: {} };
vm.runInNewContext(
  await readFile(new URL("js/products.js", root), "utf8"),
  context,
);
const products = context.window.VSD_PRODUCTS;
const byId = Object.fromEntries(
  products.map((product) => [product.id, product]),
);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const money = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
// URLs absolutas de compartilhamento dependem do domínio real de publicação.
const siteUrl = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
if (siteUrl && !["http:", "https:"].includes(siteUrl.protocol))
  throw new Error("SITE_URL deve usar HTTP ou HTTPS");
if (siteUrl && !siteUrl.pathname.endsWith("/")) siteUrl.pathname += "/";

for (const product of products) {
  const kit = Boolean(product.items);
  const bottles = kit ? product.items.map((id) => byId[id]) : [product];
  const name = kit
    ? `Kit ${product.name}`
    : `${product.brand} ${product.name} ${product.volume}`;
  const title = `${name} | VeriSeal — Demonstração`;
  const description = `${product.desc} Catálogo ilustrativo: sem venda ou autenticação real.`;
  const canonical = siteUrl
    ? new URL(`produtos/${product.id}/`, siteUrl).href
    : null;
  const shareImage = siteUrl ? new URL(bottles[0].img, siteUrl).href : null;
  const document = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#042555">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="VeriSeal Delivery">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta name="twitter:card" content="${shareImage ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  ${canonical ? `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">` : ""}
  ${shareImage ? `<meta property="og:image" content="${esc(shareImage)}"><meta property="og:image:alt" content="${esc(name)}"><meta name="twitter:image" content="${esc(shareImage)}">` : ""}
  <link rel="icon" type="image/png" sizes="32x32" href="../../assets/img/favicon-32.png">
  <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg">
  <link rel="apple-touch-icon" href="../../assets/img/apple-touch-icon.png">
  <link rel="stylesheet" href="../../assets/css/site.css">
</head>
<body class="bg-white font-sans text-fg">
  <header class="bg-navy px-6 py-4 text-white"><a class="font-bold text-white" href="../../index.html">VeriSeal Delivery</a></header>
  <main class="mx-auto max-w-4xl px-6 py-8">
    <nav aria-label="Navegação"><a href="../../index.html#catalogo">← Voltar ao catálogo</a></nav>
    <p class="demo-notice">Demonstração: preços ilustrativos. Nenhum pedido, pagamento ou envio real é realizado.</p>
    <article class="grid gap-8 md:grid-cols-2">
      <div class="flex items-end justify-center rounded-3xl bg-surface p-6">${bottles.map((bottle) => `<img class="h-64 min-w-0 flex-1 object-contain" src="../../${esc(bottle.img)}" alt="${esc(bottle.brand + " " + bottle.name + " " + bottle.volume)}" width="${bottle.size[0]}" height="${bottle.size[1]}" decoding="async">`).join("")}</div>
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">${esc(name)}</h1>
        <p class="mt-4 text-fg-2">${esc(product.desc)}</p>
        <p class="mt-5 text-2xl font-bold">${money(product.price)}</p>
        <p class="text-ok">${money(pix(product.price))} no Pix simulado</p>
        <p class="mt-3 text-sm text-fg-2">Frete ilustrativo de ${money(SHIP_FEE)}, grátis a partir de ${money(FREE_SHIP)} em produtos, antes do desconto Pix. Cobertura e prazo não confirmados.</p>
        <a class="btn btn-primary mt-6" href="../../index.html?produto=${encodeURIComponent(product.id)}#catalogo">Ver na demonstração</a>
      </div>
    </article>
    ${kit ? `<section class="mt-8"><h2 class="text-xl font-bold">Garrafas deste kit</h2><ul class="mt-3 list-inside list-disc">${bottles.map((bottle) => `<li><a href="../${bottle.id}/">${esc(bottle.brand + " " + bottle.name + " " + bottle.volume)}</a></li>`).join("")}</ul></section>` : `<dl class="mt-8 grid grid-cols-2 gap-4"><div><dt>Volume</dt><dd class="font-semibold">${esc(product.volume)}</dd></div><div><dt>Teor alcoólico</dt><dd class="font-semibold">${esc(product.abv)}%</dd></div><div><dt>Origem</dt><dd class="font-semibold">${esc(product.origin)}</dd></div></dl>`}
    <p class="mt-8 text-sm text-fg-2">O lacre apresentado é uma demonstração visual e não comprova a autenticidade de produtos reais. Conteúdo destinado a maiores de 18 anos. Se beber, não dirija.</p>
  </main>
  <footer class="bg-surface px-6 py-6 text-center text-sm"><a href="../../sobre.html">Sobre o projeto, contato e políticas da demonstração</a></footer>
</body>
</html>
`;
  const directory = new URL(`produtos/${product.id}/`, root);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.html", directory), document.replace(/[\t ]+$/gm, ""));
}
console.log(`${products.length} páginas de produtos geradas.`);
