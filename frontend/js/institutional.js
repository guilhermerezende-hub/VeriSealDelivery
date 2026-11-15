import { COMPANY } from "./config.js";
import { formatPhone } from "./records.js";

const info = document.querySelector("#companyInfo");
if (COMPANY.legalName) {
  info.textContent =
    COMPANY.legalName + (COMPANY.cnpj ? ` · CNPJ: ${COMPANY.cnpj}` : "");
  info.hidden = false;
}

// E-mail e WhatsApp vêm de COMPANY (js/config.js) e entram como os primeiros
// cartões de contato. Montados com textContent: nada do config vira HTML.
const contacts = [];
if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(COMPANY.email))
  contacts.push({
    icon: "mail",
    label: "E-mail",
    value: COMPANY.email,
    href: "mailto:" + COMPANY.email,
  });
const wa = COMPANY.whatsapp;
if (/^\d{10,15}$/.test(wa))
  contacts.push({
    icon: "phone",
    label: "WhatsApp",
    // 5511987654321 -> +55 (11) 98765-4321
    value:
      wa.startsWith("55") && wa.length >= 12
        ? "+55 " + formatPhone(wa.slice(2))
        : "+" + wa,
    href: "https://wa.me/" + wa,
  });

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const channels = document.querySelector("#contactChannels");
contacts.reverse().forEach(({ icon, label, value, href }) => {
  const link = el("a", "doc-link-card");
  link.href = href;
  if (href.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noopener";
  }
  const badge = el("span", "doc-card-icon bg-accent/10 text-accent");
  const glyph = el("i", `icon icon-${icon}`);
  glyph.setAttribute("aria-hidden", "true");
  badge.append(glyph);
  const body = el("span", "min-w-0 flex-1");
  body.append(
    el("b", "doc-card-title", label),
    el("span", "doc-card-text break-words", value),
  );
  link.append(badge, body);
  const item = el("li");
  item.append(link);
  channels.prepend(item);
});

document.querySelector("#clearLocalData").addEventListener("click", () => {
  const status = document.querySelector("#clearDataStatus");
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("vsd:"))
      .forEach((key) => localStorage.removeItem(key));
    status.dataset.state = "ok";
    status.textContent =
      "Seus dados foram apagados deste navegador. Atualize outras abas abertas da loja.";
  } catch {
    status.dataset.state = "error";
    status.textContent =
      "O navegador bloqueou o acesso ao armazenamento. Limpe os dados do site nas configurações do navegador.";
  }
});

// Índice lateral: marca a seção que está na tela.
const tocLinks = [...document.querySelectorAll(".toc-link")];
const sections = tocLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
function markCurrent(id) {
  tocLinks.forEach((link) =>
    link.setAttribute(
      "aria-current",
      link.getAttribute("href") === "#" + id ? "true" : "false",
    ),
  );
}
// A seção atual é a última cujo título já passou de 40% da altura da tela;
// no fim da página, vale a última seção.
function updateToc() {
  if (!sections.length) return;
  const line = innerHeight * 0.4;
  let current = sections[0];
  sections.forEach((s) => {
    if (s.getBoundingClientRect().top <= line) current = s;
  });
  const end = document.documentElement.scrollHeight - 4;
  if (innerHeight + scrollY >= end) current = sections[sections.length - 1];
  markCurrent(current.id);
}
let tocFrame = 0;
addEventListener(
  "scroll",
  () => {
    cancelAnimationFrame(tocFrame);
    tocFrame = requestAnimationFrame(updateToc);
  },
  { passive: true },
);
addEventListener("resize", updateToc);
updateToc();
