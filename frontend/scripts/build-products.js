// Gera produtos/<id>/index.html: uma página por produto, para buscadores e links
// diretos. "Comprar agora" abre o mesmo produto na loja (index.html?produto=<id>).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
import {
  ETA,
  FREE_SHIP,
  SHIP_FEE,
  OPEN_H,
  CLOSE_H,
  PIX_LABEL,
} from "../js/config.js";
import { pix, inst } from "../js/commerce.js";

const root = new URL("../", import.meta.url);
const context = { window: {} };
vm.runInNewContext(
  await readFile(new URL("js/products.js", root), "utf8"),
  context,
);
const products = context.window.VSD_PRODUCTS;
const catName = Object.fromEntries(
  context.window.VSD_CATEGORIES.map((c) => [c.id, c.name]),
);
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
const pc = (v) => (v * 100).toFixed(2) + "%";
const abv = (p) => String(p.abv).replace(".", ",") + "%"; // 47.3 -> "47,3%", como na loja
const UP = "../../";

const siteUrl = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
if (siteUrl && !["http:", "https:"].includes(siteUrl.protocol))
  throw new Error("SITE_URL deve usar HTTP ou HTTPS");
if (siteUrl && !siteUrl.pathname.endsWith("/")) siteUrl.pathname += "/";

const isKit = (p) => Boolean(p.items);
const bottlesOf = (p) => (isKit(p) ? p.items.map((id) => byId[id]) : [p]);
const fullName = (p) => (isKit(p) ? `Kit ${p.name}` : `${p.brand} ${p.name}`);
// preço "de": o oldPrice da garrafa ou, no kit, a soma das garrafas avulsas
const listPrice = (p) =>
  isKit(p) ? bottlesOf(p).reduce((sum, b) => sum + b.price, 0) : p.oldPrice;
const discount = (p) => {
  const from = listPrice(p);
  return from > p.price ? Math.round((1 - p.price / from) * 100) : 0;
};

// Tira do lacre no gargalo: mesma geometria de NECK (js/seal.js) e de sealGeo() (js/app.js).
// O desenho (#vs-neck) é criado pelo seal.js, carregado no fim da página.
const NECK = { W: 40, H: 110, J: 58 };
function sealStyle(p) {
  const [w, h] = p.size;
  const s = p.seal || { y: 0.15 };
  const sw = s.w || 0.145;
  const sh = sw * (w / h) * (NECK.H / NECK.W);
  const top = s.y - (sh * NECK.J) / NECK.H;
  return `left:${pc(s.x || 0.5)};top:${pc(top)};width:${pc(sw)};height:${pc(sh)}`;
}
function shot(p, cls, { eager = false, alt = "" } = {}) {
  return `<span class="relative block shrink-0 ${cls}" style="aspect-ratio:${p.size[0]} / ${p.size[1]}"><img class="block size-full object-contain select-none" src="${UP}${esc(p.img)}" alt="${esc(alt)}" width="${p.size[0]}" height="${p.size[1]}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false"><svg class="pointer-events-none absolute -translate-x-1/2 overflow-visible drop-shadow-[0_.6px_1px_rgba(0,0,0,.45)]" viewBox="0 0 40 110" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="${sealStyle(p)}"><use href="#vs-neck"/></svg></span>`;
}
// garrafa sozinha, ou as garrafas do kit lado a lado (a do meio na frente), como na loja
function visual(p, opts = {}) {
  const bottles = bottlesOf(p);
  const n = bottles.length;
  const alt = (b) => (opts.alt ? `${b.brand} ${b.name} ${b.volume}` : "");
  if (n === 1) return shot(p, "h-full", { ...opts, alt: alt(p) });
  return bottles
    .map((b, k) =>
      shot(
        b,
        k === 1
          ? "z-[1] -mx-[5%] h-full"
          : n === 2
            ? "-mr-[3%] -ml-[5%] h-[96%]"
            : "-mx-[5%] h-[88%]",
        { ...opts, alt: alt(b) },
      ),
    )
    .join("");
}

const LOGO = `<img class="aspect-wordmark h-[19px] w-auto max-sm:h-3" src="${UP}assets/brand/logo-light-bg.svg" alt="">
        <span class="rounded-md bg-navy px-[7px] py-[3px] text-[11px] leading-[1.2] font-bold tracking-[.04em] text-white uppercase">Delivery</span>`;

const HEADER = `<header class="sticky top-0 z-[500] border-b border-surface-2 bg-white/92 backdrop-blur-[18px] backdrop-saturate-180">
    <div class="mx-auto flex h-[68px] max-w-[1248px] items-center gap-3.5 px-6 max-sm:h-[60px] max-sm:gap-2 max-sm:px-4">
      <a class="flex shrink-0 items-center gap-2 no-underline" href="${UP}index.html" aria-label="VeriSeal Delivery — voltar à loja">
        ${LOGO}
      </a>
      <form class="min-w-0 flex-1 max-sm:hidden" action="${UP}index.html" method="get" role="search">
        <label class="flex h-[46px] max-w-[560px] items-center gap-2.5 rounded-xl border border-transparent bg-surface px-4 transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-accent focus-within:bg-white focus-within:shadow-focus">
          <i class="icon icon-search size-[19px] text-fg-2" aria-hidden="true"></i>
          <span class="sr-only">Buscar bebidas e marcas</span>
          <input class="min-w-0 flex-1 bg-transparent px-0.5 py-px text-[15px] outline-none placeholder:text-fg-3 focus-visible:shadow-none" type="search" name="busca" placeholder="Buscar whisky, gin, vodka…" autocomplete="off" enterkeyhint="search" required>
        </label>
      </form>
      <a class="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-[#e7f5fe] px-3.5 text-[14px] font-bold text-navy no-underline transition-colors duration-200 hover:bg-[#d4edfc] hover:no-underline max-lg:hidden" href="${UP}index.html#verificar">
        <i class="icon icon-contactless size-5 text-accent" aria-hidden="true"></i>
        Como verificar?
      </a>
      <a class="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-navy px-4 text-[14px] font-bold text-white no-underline transition-colors duration-200 hover:bg-navy-2 hover:no-underline max-sm:ml-auto max-sm:h-10 max-sm:px-3.5" href="${UP}index.html">
        <i class="icon icon-bag size-[18px]" aria-hidden="true"></i>
        Ir para a loja
      </a>
    </div>
  </header>`;

const footLink = (href, text) =>
  `<li><a class="foot-link" href="${UP}${href}">${text}</a></li>`;
const FOOTER = `<footer class="bg-navy-ink pb-[calc(24px_+_env(safe-area-inset-bottom,0px))] text-[14px] leading-[1.55] text-white/62">
    <div class="border-b border-white/8 bg-navy-deep">
      <p class="mx-auto flex max-w-[1248px] items-center gap-3 px-6 py-3.5 text-[13px] font-semibold text-white/85 max-sm:px-4">
        <span class="grid h-7 shrink-0 place-items-center rounded-md border border-white/30 px-1.5 text-[12px] leading-none font-extrabold text-white" aria-hidden="true">18+</span>
        Venda proibida para menores de 18 anos. Se beber, não dirija. Aprecie com moderação.
      </p>
    </div>
    <div class="mx-auto grid max-w-[1248px] grid-cols-[1.5fr_repeat(3,1fr)] gap-10 px-6 pt-12 pb-10 max-md:grid-cols-3 max-md:gap-8 max-sm:grid-cols-2 max-sm:gap-x-6 max-sm:px-4 max-sm:pt-10">
      <div class="max-md:col-span-full">
        <a class="inline-flex items-center gap-2 rounded-lg no-underline hover:no-underline" href="${UP}index.html" aria-label="VeriSeal Delivery — ir para a loja">
          <img class="aspect-wordmark h-[19px] w-auto" src="${UP}assets/brand/logo-dark-bg.svg" alt="">
          <span class="rounded-md bg-white px-[7px] py-[3px] text-[11px] leading-[1.2] font-bold tracking-[.04em] text-navy uppercase">Delivery</span>
        </a>
        <p class="mt-4 max-w-[340px]">Delivery de bebidas com lacre inteligente em cada garrafa. Na entrega, você confere pelo celular se ela é original e nunca foi aberta.</p>
        <p class="mt-6 text-[11px] font-bold tracking-[.1em] text-white/45 uppercase">Formas de pagamento</p>
        <ul class="mt-2.5 flex flex-wrap gap-2">
          <li class="pay-chip"><i class="icon icon-pix" aria-hidden="true"></i>Pix</li>
          <li class="pay-chip"><i class="icon icon-card" aria-hidden="true"></i>Cartão de crédito</li>
          <li class="pay-chip"><i class="icon icon-cash" aria-hidden="true"></i>Pagamento na entrega</li>
        </ul>
      </div>
      <nav aria-labelledby="footShop">
        <h2 class="foot-title" id="footShop">Loja</h2>
        <ul class="foot-list">
          ${footLink("index.html?categoria=whisky#catalogo", "Whisky")}
          ${footLink("index.html?categoria=vodka#catalogo", "Vodka")}
          ${footLink("index.html?categoria=gin#catalogo", "Gin")}
          ${footLink("index.html?categoria=cachaca#catalogo", "Cachaça")}
          ${footLink("index.html#kits", "Kits e presentes")}
        </ul>
      </nav>
      <nav aria-labelledby="footOrder">
        <h2 class="foot-title" id="footOrder">Seu pedido</h2>
        <ul class="foot-list">
          ${footLink("index.html#ofertas", "Ofertas da semana")}
          ${footLink("index.html#mais-pedidos", "Mais pedidos")}
          ${footLink("login.html", "Entrar na conta")}
        </ul>
      </nav>
      <nav aria-labelledby="footSeal">
        <h2 class="foot-title" id="footSeal">Lacre VeriSeal</h2>
        <ul class="foot-list">
          ${footLink("index.html#como-funciona", "Como funciona")}
          ${footLink("index.html#verificar", "Verificar garrafa")}
          ${footLink("index.html#ajuda", "Perguntas frequentes")}
        </ul>
      </nav>
    </div>
    <div class="mx-auto max-w-[1248px] px-6 max-sm:px-4">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[13px]">
        <p>© 2026 VeriSeal Delivery. Todos os direitos reservados.</p>
        <nav class="flex flex-wrap gap-x-5 gap-y-2" aria-label="Informações institucionais">
          <a class="foot-link" href="${UP}sobre.html#empresa">Sobre nós</a>
          <a class="foot-link" href="${UP}entregadores.html">Seja entregador</a>
          <a class="foot-link" href="${UP}sobre.html#contato">Contato</a>
          <a class="foot-link" href="${UP}sobre.html#privacidade">Privacidade</a>
          <a class="foot-link" href="${UP}sobre.html#termos">Termos de uso</a>
        </nav>
      </div>
      <p class="mt-3 text-[12px] text-white/40">As marcas e imagens de produtos pertencem aos seus respectivos proprietários. Preços e estoque sujeitos a alteração.</p>
    </div>
  </footer>`;

const MEDIA_BG =
  "bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,rgba(3,175,251,.16),transparent_70%),radial-gradient(ellipse_42%_7%_at_50%_90%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e7ecf3)]";
const CARD_BG =
  "bg-[radial-gradient(ellipse_52%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)]";

function perk(iconHTML, title, text) {
  return `<li class="flex items-start gap-3.5">
            ${iconHTML}
            <span class="text-[14px] leading-snug"><b class="block font-semibold text-fg">${title}</b><span class="text-fg-2">${text}</span></span>
          </li>`;
}
const perkIcon = (name) =>
  `<span class="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-navy"><i class="icon icon-${name} size-5" aria-hidden="true"></i></span>`;
const SEAL_ICON = `<span class="grid size-10 shrink-0 place-items-center rounded-xl bg-navy"><img class="aspect-mark h-auto w-[23px]" src="${UP}assets/brand/logo-short-dark-bg.svg" alt=""></span>`;

function related(product) {
  const pool = [
    ...products.filter(
      (p) => p.category === product.category && p.id !== product.id,
    ),
    ...products.filter(
      (p) => isKit(p) && p.id !== product.id && p.items.includes(product.id),
    ),
    ...products.filter((p) => p.featured && p.id !== product.id),
    ...products.filter((p) => p.id !== product.id),
  ];
  return [...new Set(pool)].slice(0, 4);
}

function card(p) {
  const off = discount(p);
  const from = listPrice(p);
  const meta = isKit(p)
    ? `${p.items.length} garrafas · ${p.items.length} lacres`
    : `${p.volume} · ${abv(p)}`;
  return `<li>
          <a class="group flex h-full flex-col rounded-2xl border border-line bg-white p-2.5 text-fg no-underline transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-transparent hover:no-underline hover:shadow-lift" href="../${p.id}/">
            <span class="relative flex h-[220px] items-end justify-center overflow-hidden rounded-xl ${CARD_BG} px-3 pt-6 pb-4 max-sm:h-[170px] max-sm:pt-5">
              <span class="flex h-full items-end justify-center">${visual(p)}</span>
              ${off ? `<span class="absolute top-2.5 left-2.5 rounded-[7px] bg-sale px-2 py-[3px] text-[11px] font-bold text-white">-${off}%</span>` : ""}
            </span>
            <span class="px-1.5 pt-3 text-[11px] font-semibold tracking-[.06em] text-fg-2 uppercase">${esc(isKit(p) ? "Kit" : p.brand)}</span>
            <b class="px-1.5 text-[15px] leading-snug font-semibold">${esc(p.name)}</b>
            <span class="px-1.5 text-[13px] text-fg-2">${esc(meta)}</span>
            <span class="mt-auto flex flex-wrap items-baseline gap-x-2 px-1.5 pt-3 pb-1">
              ${from > p.price ? `<s class="text-[12px] text-fg-3">${money(from)}</s>` : ""}
              <b class="text-[17px] font-extrabold tracking-[-.02em]">${money(p.price)}</b>
            </span>
          </a>
        </li>`;
}

function kitList(product) {
  const counts = new Map();
  product.items.forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
  return `<h3 class="mt-9 text-[17px] font-bold">Garrafas deste kit</h3>
        <ul class="mt-3 grid gap-2.5">${[...counts]
          .map(([id, n]) => {
            const b = byId[id];
            return `
          <li>
            <a class="flex items-center gap-4 rounded-2xl border border-line bg-white p-3 pr-5 text-fg no-underline transition-[border-color,box-shadow] duration-200 hover:border-accent/40 hover:no-underline hover:shadow-card" href="../${b.id}/">
              <span class="flex h-16 w-12 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-[linear-gradient(#f4f8fd,#e3eaf4)] pt-1"><img class="h-[58px] w-auto max-w-none" src="${UP}${esc(b.img)}" alt="" loading="lazy" decoding="async"></span>
              <span class="min-w-0 flex-1"><b class="block font-semibold">${n > 1 ? `${n}× ` : ""}${esc(b.brand + " " + b.name)}</b><span class="text-[13px] text-fg-2">${esc(b.volume)} · ${abv(b)} · lacre VeriSeal</span></span>
              <span class="text-[14px] font-semibold whitespace-nowrap text-fg-2">${money(b.price)}</span>
              <i class="icon icon-chev-r size-4 text-fg-3" aria-hidden="true"></i>
            </a>
          </li>`;
          })
          .join("")}
        </ul>`;
}

function specs(product) {
  const kit = isKit(product);
  const bottles = bottlesOf(product);
  const rows = kit
    ? [
        ["Categoria", "Kit"],
        ["Garrafas", String(bottles.length)],
        ["Lacres VeriSeal", `${bottles.length}, um em cada garrafa`],
        [
          "Economia no kit",
          `${money(listPrice(product) - product.price)} em relação às garrafas avulsas`,
        ],
      ]
    : [
        ["Marca", product.brand],
        ["Categoria", catName[product.category]],
        ["Volume", product.volume],
        ["Teor alcoólico", abv(product)],
        ["Origem", product.origin],
        ["Lacre", "VeriSeal com chip NFC"],
      ];
  return rows
    .map(
      ([dt, dd]) =>
        `<div class="flex items-baseline justify-between gap-6 px-5 py-3.5 odd:bg-surface/60"><dt class="text-[14px] text-fg-2">${esc(dt)}</dt><dd class="text-right text-[14px] font-semibold text-fg">${esc(dd)}</dd></div>`,
    )
    .join("\n          ");
}

for (const product of products) {
  const kit = isKit(product);
  const bottles = bottlesOf(product);
  const name = kit
    ? `Kit ${product.name}`
    : `${product.brand} ${product.name} ${product.volume}`;
  const title = `${name} | VeriSeal Delivery`;
  const description = `${product.desc} Entregue com lacre VeriSeal.`;
  const canonical = siteUrl
    ? new URL(`produtos/${product.id}/`, siteUrl).href
    : null;
  const shareImage = siteUrl ? new URL(bottles[0].img, siteUrl).href : null;
  const off = discount(product);
  const from = listPrice(product);
  const parcel = inst(product.price);
  const category = catName[product.category];
  const eyebrow = kit ? `Kit · ${bottles.length} garrafas` : esc(category);
  const meta = kit
    ? `${bottles.length} garrafas · ${bottles.length} lacres VeriSeal`
    : `${esc(product.volume)} · ${abv(product)} vol · ${esc(product.origin)}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: product.desc,
    sku: product.id,
    category,
    brand: { "@type": "Brand", name: product.brand },
    ...(shareImage ? { image: shareImage } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      ...(canonical ? { url: canonical } : {}),
    },
  };
  const document = `<!doctype html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
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
  <link rel="icon" type="image/png" sizes="32x32" href="${UP}assets/img/favicon-32.png">
  <link rel="icon" type="image/svg+xml" href="${UP}assets/img/favicon.svg">
  <link rel="apple-touch-icon" href="${UP}assets/img/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${UP}assets/css/site.css">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
</head>
<body class="overflow-x-hidden bg-white text-[16px] leading-normal tracking-[-.006em] text-fg antialiased">
  <a class="absolute -top-[60px] left-4 z-[2000] rounded-full bg-fg px-4 py-2.5 text-white focus:top-3" href="#conteudo">Pular para o conteúdo</a>

  ${HEADER}

  <main class="mx-auto w-full max-w-[1248px] px-6 pt-5 pb-20 max-sm:px-4 max-sm:pt-4 max-sm:pb-14" id="conteudo">
    <nav class="text-[13px] text-fg-2" aria-label="Você está aqui">
      <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li><a class="text-fg-2 no-underline hover:text-accent hover:no-underline" href="${UP}index.html">Início</a></li>
        <li aria-hidden="true"><i class="icon icon-chev-r size-3.5 text-fg-3"></i></li>
        <li><a class="text-fg-2 no-underline hover:text-accent hover:no-underline" href="${UP}index.html?categoria=${product.category}#catalogo">${esc(category)}</a></li>
        <li aria-hidden="true"><i class="icon icon-chev-r size-3.5 text-fg-3"></i></li>
        <li class="min-w-0 truncate font-semibold text-fg" aria-current="page">${esc(fullName(product))}</li>
      </ol>
    </nav>

    <article class="mt-5 grid grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] items-start gap-14 max-md:grid-cols-1 max-md:gap-8">
      <div class="relative overflow-hidden rounded-3xl ${MEDIA_BG} px-8 pt-16 pb-10 max-sm:rounded-[20px] max-sm:px-4 max-sm:pt-14 max-sm:pb-7">
        <div class="absolute top-4 left-4 z-[2] flex flex-wrap gap-2">
          ${off ? `<span class="rounded-lg bg-sale px-2.5 py-1 text-[13px] font-bold text-white">-${off}%${kit ? " no kit" : ""}</span>` : ""}
          ${product.badge ? `<span class="rounded-lg bg-white px-2.5 py-1 text-[13px] font-bold text-badge shadow-card">${esc(product.badge)}</span>` : ""}
        </div>
        <span class="absolute top-4 right-4 z-[2] inline-flex items-center gap-1.5 rounded-full bg-navy py-1 pr-3 pl-2 text-[12px] font-bold text-white">
          <img class="aspect-mark h-auto w-[20px]" src="${UP}assets/brand/logo-short-dark-bg.svg" alt="">
          ${kit ? `${bottles.length} lacres` : "Lacrado"}
        </span>
        <div class="flex h-[460px] items-end justify-center max-md:h-[400px] max-sm:h-[300px]">${visual(product, { eager: true, alt: true })}</div>
        <p class="mt-7 flex items-center justify-center gap-2 text-center text-[13px] font-bold text-navy max-sm:mt-5">
          <img class="aspect-mark h-auto w-[22px]" src="${UP}assets/brand/logo-short-light-bg.svg" alt="">
          ${kit ? "Cada garrafa com o próprio lacre VeriSeal" : "Lacre VeriSeal com NFC na tampa"}
        </p>
      </div>

      <div class="min-w-0 pt-2 max-md:pt-0">
        <p class="text-[13px] font-bold tracking-[.08em] text-fg-2 uppercase">${eyebrow}</p>
        <h1 class="mt-2 text-[clamp(30px,3.4vw,42px)] leading-[1.06] font-extrabold tracking-[-.035em]">${esc(fullName(product))}</h1>
        <p class="mt-2.5 text-[15px] text-fg-2">${meta}</p>
        ${product.notes?.length ? `<ul class="mt-4 flex flex-wrap gap-2">${product.notes.map((n) => `<li class="rounded-full border border-line px-3 py-1 text-[13px] text-fg-2">${esc(n)}</li>`).join("")}</ul>` : ""}

        <div class="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card max-sm:p-5">
          ${from > product.price ? `<p class="flex items-center gap-2.5 text-[15px] text-fg-3"><s>${money(from)}</s><span class="rounded-md bg-sale/10 px-1.5 py-0.5 text-[12px] font-bold text-sale">-${off}%</span></p>` : ""}
          <p class="mt-1 text-[42px] leading-none font-extrabold tracking-[-.035em] max-sm:text-[36px]">${money(product.price)}</p>
          <p class="mt-3 text-[14px] text-fg-2"><b class="font-bold text-ok">${money(pix(product.price))} no Pix</b> (${PIX_LABEL} off)${parcel ? ` · ou ${parcel.n}x de ${money(parcel.v)} sem juros` : ""}</p>
          <a class="btn btn-primary mt-5 h-[54px] w-full text-[17px] shadow-[0_10px_24px_-10px_rgba(0,106,168,.7)]" href="${UP}index.html?produto=${encodeURIComponent(product.id)}#catalogo">
            <i class="icon icon-cart" aria-hidden="true"></i>
            Comprar agora
          </a>
          <ul class="mt-6 grid gap-4 border-t border-line pt-5">
          ${perk(perkIcon("moto"), `Entrega em ${ETA}`, `Pedidos das ${OPEN_H}h às ${CLOSE_H}h.`)}
          ${perk(perkIcon("truck"), `Frete de ${money(SHIP_FEE)}`, `Grátis a partir de ${money(FREE_SHIP)} em produtos, antes do desconto Pix.`)}
          ${perk(SEAL_ICON, kit ? `${bottles.length} lacres VeriSeal` : "Lacre VeriSeal", "Na entrega, aproxime o celular do lacre e confira se a garrafa nunca foi aberta.")}
          </ul>
        </div>
      </div>
    </article>

    <section class="mt-16 grid grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] gap-14 border-t border-line pt-14 max-md:grid-cols-1 max-md:gap-10 max-sm:mt-12 max-sm:pt-10" aria-label="Detalhes do produto">
      <div>
        <h2 class="text-[26px] leading-tight font-extrabold tracking-[-.03em]">Sobre o produto</h2>
        <p class="mt-4 text-[16px] leading-[1.75] text-fg-2">${esc(product.desc)}</p>
        ${kit ? kitList(product) : ""}
      </div>
      <div>
        <h2 class="text-[26px] leading-tight font-extrabold tracking-[-.03em]">Ficha técnica</h2>
        <dl class="mt-4 overflow-hidden rounded-2xl border border-line">
          ${specs(product)}
        </dl>
      </div>
    </section>

    <section class="mt-16 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_45%_80%_at_85%_30%,rgba(3,173,249,.2),transparent_70%),radial-gradient(ellipse_90%_100%_at_75%_30%,#0b3f86_0%,var(--color-navy-deep)_52%,var(--color-navy-ink)_100%)] px-[clamp(24px,5vw,56px)] py-[clamp(32px,5vw,56px)] text-white max-sm:mt-12 max-sm:rounded-[20px]" aria-labelledby="sealTitle">
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-12 max-md:grid-cols-1 max-md:gap-8">
        <div>
          <p class="inline-flex items-center gap-2 text-[14px] font-bold text-cyan"><img class="aspect-mark h-auto w-6" src="${UP}assets/brand/logo-short-dark-bg.svg" alt="">Lacre VeriSeal</p>
          <h2 class="mt-3 text-[clamp(26px,3vw,36px)] leading-[1.08] font-extrabold tracking-[-.035em]" id="sealTitle">Confira ${kit ? "cada garrafa" : "a garrafa"} na hora da entrega.</h2>
          <p class="mt-3 max-w-[460px] text-[16px] leading-[1.6] text-[#b9c6db]">O lacre cruza a tampa e o gargalo e se rompe quando a garrafa é aberta. Sem aplicativo: a verificação abre direto no navegador.</p>
          <a class="btn btn-light group mt-6" href="${UP}index.html#como-funciona">
            Ver como funciona
            <i class="icon icon-arrow-r transition-transform duration-[250ms] ease-smooth group-hover:translate-x-[3px]" aria-hidden="true"></i>
          </a>
        </div>
        <ol class="grid gap-3">
          <li class="flex items-start gap-4 rounded-2xl bg-white/6 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.09)]">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-cyan font-mono text-[14px] font-semibold text-navy-ink">1</span>
            <span><b class="block text-[16px] text-white">Aproxime o celular do lacre</b><span class="mt-0.5 block text-[14px] leading-snug text-[#a1aec4]">O chip NFC fica no topo da tampa, embaixo do holograma.</span></span>
          </li>
          <li class="flex items-start gap-4 rounded-2xl bg-white/6 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.09)]">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-cyan font-mono text-[14px] font-semibold text-navy-ink">2</span>
            <span><b class="block text-[16px] text-white">Toque no aviso “Etiqueta NFC”</b><span class="mt-0.5 block text-[14px] leading-snug text-[#a1aec4]">A página de verificação abre no navegador, já com o resultado.</span></span>
          </li>
          <li class="flex items-start gap-4 rounded-2xl bg-white/6 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.09)]">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-cyan font-mono text-[14px] font-semibold text-navy-ink">3</span>
            <span><b class="block text-[16px] text-white">Íntegro ou violado</b><span class="mt-0.5 block text-[14px] leading-snug text-[#a1aec4]">Lacre rompido? Recuse a entrega na hora e o valor do item é reembolsado.</span></span>
          </li>
        </ol>
      </div>
    </section>

    <section class="mt-16 max-sm:mt-12" aria-labelledby="relatedTitle">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <h2 class="text-[26px] leading-tight font-extrabold tracking-[-.03em]" id="relatedTitle">Você também pode gostar</h2>
        <a class="group inline-flex items-center gap-1.5 text-[14px] font-bold text-accent hover:no-underline" href="${UP}index.html?categoria=${product.category}#catalogo">
          Ver ${kit ? "todos os kits" : `tudo em ${esc(category)}`}
          <i class="icon icon-arrow-r size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"></i>
        </a>
      </div>
      <ul class="mt-5 grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:gap-3">
        ${related(product).map(card).join("\n        ")}
      </ul>
    </section>
  </main>

  ${FOOTER}

  <script src="${UP}js/seal.js"></script>
</body>
</html>
`;
  const directory = new URL(`produtos/${product.id}/`, root);
  await mkdir(directory, { recursive: true });
  await writeFile(
    new URL("index.html", directory),
    document.replace(/[\t ]+$/gm, ""),
  );
}
console.log(`${products.length} páginas de produtos geradas.`);
