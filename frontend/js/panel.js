// Painel da loja (painel.html): CRUD de lacres e clientes direto no banco,
// pela API em C#. Tudo que aparece aqui vem do MySQL em JSON.
import { $, $$, esc, icon, norm } from "./ui.js";
import { api } from "./api.js";
import { apiUrl } from "./config.js";
import {
  SEAL_CODE_RE,
  formatSealCode,
  randomSealCode,
  formatPhone,
  isoDate,
  isoDateTime,
  parseLocal,
  brDate,
  brDateTime,
} from "./records.js";

const PRODUCTS = (window.VSD_PRODUCTS || []).filter((p) => !p.items);
const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const productName = (id) => {
  const p = productById[id];
  return p ? `${p.brand} ${p.name} · ${p.volume}` : id;
};

const state = {
  lacres: { items: [], error: "", loading: true, updatedAt: null },
  clientes: { items: [], error: "", loading: true, updatedAt: null },
  avisos: { items: [], error: "", loading: true, updatedAt: null },
};
const TAB_NAMES = { lacres: "Lacres", clientes: "Clientes", avisos: "Avisos" };
let sealFilter = "all";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const pad = (n) => String(n).padStart(2, "0");
const timeOf = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Tabela no computador; abaixo de 1000 px cada linha vira um cartão e cada
// célula mostra o próprio rótulo (data-label).
const TABLE = "w-full border-collapse text-left text-[14px] max-md:block";
const THEAD =
  "border-b border-line bg-surface/70 text-[11.5px] tracking-[.05em] text-fg-2 uppercase max-md:hidden";
const TH = "px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5";
const TBODY = "max-md:block";
const TR =
  "border-t border-line transition-colors duration-150 first:border-t-0 hover:bg-surface/50 max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-3.5 max-md:px-5 max-md:py-4 max-sm:px-4";
const TD =
  "px-4 py-3.5 align-middle first:pl-5 last:pr-5 max-md:p-0! max-md:before:mb-1 max-md:before:block max-md:before:text-[11px] max-md:before:font-semibold max-md:before:tracking-[.05em] max-md:before:text-fg-3 max-md:before:uppercase max-md:before:content-[attr(data-label)] max-md:empty:hidden";
const WIDE = "max-md:col-span-2";
const ACTIONS_TD = `${WIDE} max-md:before:hidden`;
const NOWRAP = "whitespace-nowrap";
const MUTED = "text-[13px] text-fg-3";
const ICON_BTN =
  "grid size-9 place-items-center rounded-lg border border-line bg-white text-fg-2 transition-colors duration-200 [&_.icon]:size-[17px]";
const EDIT_BTN = `${ICON_BTN} hover:border-accent hover:text-accent`;
const DELETE_BTN = `${ICON_BTN} hover:border-bad hover:bg-bad/6 hover:text-bad`;
const ACTIONS =
  "flex justify-end gap-2 max-md:justify-start max-md:border-t max-md:border-line max-md:pt-3.5";

const pill = (text, tone) =>
  `<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-bold whitespace-nowrap ${tone}"><i class="size-1.5 rounded-full bg-current" aria-hidden="true"></i>${text}</span>`;
const OK_PILL = "bg-ok-fill/12 text-ok";
const BAD_PILL = "bg-bad/10 text-bad";
const WARN_PILL = "bg-badge/10 text-badge";
const INFO_PILL = "bg-accent/10 text-accent";
const NEUTRAL_PILL = "bg-surface-2 text-fg-2";

const code = (text) =>
  `<span class="font-mono text-[13.5px] font-semibold tracking-[.02em] whitespace-nowrap text-navy">${esc(text)}</span>`;

function thumb(p) {
  if (!p)
    return `<span class="grid h-11 w-9 shrink-0 place-items-center rounded-lg bg-surface text-fg-3">${icon("tag", "size-4")}</span>`;
  return `<span class="flex h-11 w-9 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-[linear-gradient(#f4f8fd,#e3eaf4)] pt-1"><img class="h-[38px] w-auto max-w-none" src="${esc(p.img)}" alt="" decoding="async"></span>`;
}

function initials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
const AVATAR_TONES = [
  "bg-accent/12 text-accent",
  "bg-ok-fill/14 text-ok",
  "bg-badge/12 text-badge",
  "bg-navy/10 text-navy",
  "bg-cyan/16 text-[#04679a]",
];

// Mensagens de carregando, erro e lista vazia ---------------------------------

function emptyBox({ icon: name, title, text = "", action = "", tone = "" }) {
  return `<div class="flex flex-col items-center px-6 py-14 text-center max-sm:py-10">
    <span class="grid size-12 place-items-center rounded-2xl ${tone || "bg-surface text-fg-3"}">${icon(name, "size-6")}</span>
    <p class="mt-4 text-[16px] font-bold text-fg">${title}</p>
    ${text ? `<p class="mt-1 max-w-[420px] text-[14px] leading-relaxed text-fg-2">${text}</p>` : ""}
    ${action ? `<div class="mt-5">${action}</div>` : ""}
  </div>`;
}

function skeleton(label) {
  const row = `<div class="flex animate-pulse items-center gap-4 px-5 py-4">
      <span class="h-11 w-9 shrink-0 rounded-lg bg-surface-2"></span>
      <span class="flex-1 space-y-2.5"><span class="block h-3 w-2/5 rounded-full bg-surface-2"></span><span class="block h-3 w-3/5 rounded-full bg-surface"></span></span>
      <span class="h-6 w-20 shrink-0 rounded-full bg-surface-2 max-sm:hidden"></span>
    </div>`;
  return `<div class="divide-y divide-line"><p class="sr-only">${label}</p>${row}${row}${row}</div>`;
}

const retryBtn = `<button class="btn btn-ghost btn-sm" type="button" data-retry>${icon("refresh")}Tentar de novo</button>`;

function listState(key, { noun, empty }) {
  const s = state[key];
  if (s.loading) return skeleton(`Carregando ${noun}…`);
  if (s.error)
    return emptyBox({
      icon: "alert",
      tone: "bg-bad/10 text-bad",
      title: `Não foi possível carregar ${noun}`,
      text: esc(s.error),
      action: retryBtn,
    });
  if (!s.items.length) return emptyBox(empty);
  return "";
}

function noMatch(text) {
  return emptyBox({
    icon: "search",
    title: "Nada encontrado",
    text,
  });
}

function setSummary(key, el, shown, noun) {
  const s = state[key];
  const box = $(el);
  if (s.loading) box.textContent = "Carregando…";
  else if (s.error) box.textContent = "Sem conexão com o banco de dados";
  else if (shown === s.items.length)
    box.textContent = plural(s.items.length, noun[0], noun[1]);
  else
    box.textContent = `Mostrando ${shown} de ${plural(s.items.length, noun[0], noun[1])}`;
  $(`[data-updated="${key}"]`).textContent =
    s.updatedAt && !s.error ? `Atualizado às ${timeOf(s.updatedAt)}` : "";
}

function setStat(name, value, hint = "") {
  $(`[data-stat="${name}"]`).textContent = value;
  $(`[data-stat-hint="${name}"]`).textContent = hint;
}

const ready = (key) => !state[key].loading && !state[key].error;
const percent = (part, total) =>
  total ? `${Math.round((part / total) * 100)}% do total` : "";

// Lacres ---------------------------------------------------------------------

function renderSealStats() {
  if (!ready("lacres")) {
    ["total", "ok", "opened", "checks"].forEach((n) =>
      setStat(`lacres-${n}`, "–"),
    );
    return;
  }
  const items = state.lacres.items;
  const opened = items.filter((s) => s.status === "opened").length;
  const checks = items.reduce((n, s) => n + (Number(s.verificacoes) || 0), 0);
  const products = new Set(items.map((s) => s.produtoId)).size;
  setStat(
    "lacres-total",
    items.length,
    items.length ? `em ${plural(products, "produto", "produtos")}` : "",
  );
  setStat(
    "lacres-ok",
    items.length - opened,
    percent(items.length - opened, items.length),
  );
  setStat(
    "lacres-opened",
    opened,
    opened ? "garrafas que foram abertas" : "nenhuma garrafa aberta",
  );
  setStat(
    "lacres-checks",
    checks,
    items.length ? "leituras feitas pelos clientes" : "",
  );
}

function renderSeals() {
  renderSealStats();
  const box = $("#sealList");
  const pending = listState("lacres", {
    noun: "os lacres",
    empty: {
      icon: "lock",
      title: "Nenhum lacre cadastrado ainda",
      text: "Cadastre o primeiro lacre ou confirme um pedido na loja: cada garrafa enviada ganha o seu.",
      action: `<button class="btn btn-primary btn-sm" type="button" data-new-seal>${icon("plus")}Novo lacre</button>`,
    },
  });
  if (pending) {
    box.innerHTML = pending;
    setSummary("lacres", "#sealSummary", 0, ["lacre", "lacres"]);
    return;
  }
  const search = $("#sealSearch").value.trim();
  const q = norm(search);
  const items = state.lacres.items.filter(
    (s) =>
      (sealFilter === "all" || s.status === sealFilter) &&
      (!q ||
        norm(`${s.codigo} ${productName(s.produtoId)} ${s.lote}`).includes(q)),
  );
  setSummary("lacres", "#sealSummary", items.length, ["lacre", "lacres"]);
  if (!items.length) {
    const which =
      sealFilter === "opened"
        ? " violado"
        : sealFilter === "ok"
          ? " íntegro"
          : "";
    box.innerHTML = noMatch(
      search
        ? `Nenhum lacre${which} encontrado para “${esc(search)}”.`
        : `Nenhum lacre${which} no momento.`,
    );
    return;
  }
  box.innerHTML = `<table class="${TABLE}"><thead class="${THEAD}"><tr>
      <th class="${TH}" scope="col">Código</th><th class="${TH}" scope="col">Produto</th><th class="${TH}" scope="col">Fabricado em</th>
      <th class="${TH}" scope="col">Conferido no envio</th><th class="${TH}" scope="col">Situação</th><th class="${TH}" scope="col"><span class="sr-only">Ações</span></th>
    </tr></thead><tbody class="${TBODY}">${items
      .map((s) => {
        const c = esc(s.codigo);
        const p = productById[s.produtoId];
        const checks = Number(s.verificacoes) || 0;
        const sent = parseLocal(s.enviadoEm);
        return `<tr class="${TR}" data-row="${c}">
        <td class="${TD}" data-label="Código">${code(s.codigo)}</td>
        <td class="${TD} ${WIDE} max-md:row-start-2" data-label="Produto"><div class="flex min-w-0 items-center gap-3">${thumb(p)}<div class="min-w-0"><b class="block font-semibold text-fg md:max-w-[300px] md:truncate">${esc(p ? `${p.brand} ${p.name}` : s.produtoId)}</b><span class="block ${MUTED}">${p ? esc(p.volume) + " · " : ""}Lote ${esc(s.lote)}</span></div></div></td>
        <td class="${TD} ${NOWRAP}" data-label="Fabricado em">${brDate(s.fabricadoEm)}</td>
        <td class="${TD} ${NOWRAP}" data-label="Conferido no envio">${sent ? `${brDate(s.enviadoEm)}<span class="block ${MUTED}">às ${timeOf(sent)}</span>` : `<span class="${MUTED}">Ainda não enviado</span>`}</td>
        <td class="${TD} max-md:col-start-2 max-md:row-start-1 max-md:justify-self-end max-md:before:hidden" data-label="Situação">${s.status === "opened" ? pill("Violado", BAD_PILL) : pill("Íntegro", OK_PILL)}<span class="mt-1.5 block ${MUTED} max-md:text-right">${plural(checks, "verificação", "verificações")}</span></td>
        <td class="${TD} ${ACTIONS_TD}" data-label=""><div class="${ACTIONS}">
          <button class="${EDIT_BTN}" type="button" data-edit-seal="${c}" aria-label="Editar lacre ${c}" title="Editar">${icon("edit")}</button>
          <button class="${DELETE_BTN}" type="button" data-delete-seal="${c}" aria-label="Excluir lacre ${c}" title="Excluir">${icon("trash")}</button>
        </div></td></tr>`;
      })
      .join("")}</tbody></table>`;
}

const sealDialog = $("#sealDialog");
const sealForm = $("#sealForm");
let editingSeal = null;

function suggestedLot(d = new Date()) {
  return `L${String(d.getFullYear()).slice(2)}-${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}
const toInput = (value) => (value ? String(value).slice(0, 16) : "");
const fromInput = (value) =>
  !value ? null : value.length === 16 ? value + ":00" : value;

function ensureProductOption(id) {
  const select = sealForm.elements.produtoId;
  if (!id || [...select.options].some((o) => o.value === id)) return;
  select.add(new Option(id, id));
}

function syncOpenedField() {
  const opened = sealForm.elements.status.value === "opened";
  $("#sealOpenedField").hidden = !opened;
  if (opened && !sealForm.elements.abertoEm.value)
    sealForm.elements.abertoEm.value = toInput(isoDateTime(new Date()));
}

function openSealForm(seal = null) {
  closeClientForm();
  editingSeal = seal ? seal.codigo : null;
  sealForm.reset();
  clearFormError(sealForm);
  const f = sealForm.elements;
  $("#sealFormTitle").textContent = seal
    ? `Editar lacre ${seal.codigo}`
    : "Novo lacre";
  $("#sealFormText").textContent = seal
    ? "Atualize o produto, o lote ou a situação deste lacre."
    : "O código vai impresso no lacre e é o que o cliente digita para conferir a garrafa.";
  f.codigo.value = seal ? seal.codigo : randomSealCode();
  f.codigo.readOnly = !!seal;
  $("#sealNewCode").hidden = !!seal;
  ensureProductOption(seal?.produtoId);
  f.produtoId.value = seal ? seal.produtoId : "";
  f.lote.value = seal ? seal.lote : suggestedLot();
  f.fabricadoEm.value = seal ? seal.fabricadoEm : isoDate(new Date());
  f.status.value = seal ? seal.status : "ok";
  f.enviadoEm.value = toInput(seal?.enviadoEm);
  f.abertoEm.value = toInput(seal?.abertoEm);
  sealForm.dataset.order = seal?.pedidoId ?? "";
  syncOpenedField();
  if (!sealDialog.open) sealDialog.showModal();
  $("#sealFormTitle").focus();
}

function closeSealForm() {
  editingSeal = null;
  clearFormError(sealForm);
  if (sealDialog.open) sealDialog.close();
}

function readSealForm() {
  const f = sealForm.elements;
  const status = f.status.value;
  return {
    codigo: formatSealCode(f.codigo.value),
    produtoId: f.produtoId.value,
    pedidoId: sealForm.dataset.order ? Number(sealForm.dataset.order) : null,
    lote: f.lote.value.trim(),
    fabricadoEm: f.fabricadoEm.value,
    status,
    enviadoEm: fromInput(f.enviadoEm.value),
    abertoEm: status === "opened" ? fromInput(f.abertoEm.value) : null,
  };
}

function checkSeal(data) {
  if (!SEAL_CODE_RE.test(data.codigo))
    return ["codigo", "Use o formato VS-XXXX-XXXX (ex.: VS-7K2M-9QXA)."];
  if (!data.produtoId) return ["produtoId", "Escolha o produto."];
  if (!data.lote) return ["lote", "Informe o lote."];
  if (!data.fabricadoEm)
    return ["fabricadoEm", "Informe a data de fabricação."];
  if (data.status === "opened" && !data.abertoEm)
    return ["abertoEm", "Informe quando o lacre foi aberto."];
  return null;
}

async function saveSeal() {
  const data = readSealForm();
  const problem = checkSeal(data);
  if (problem) {
    showFormError(sealForm, problem[1], problem[0]);
    return;
  }
  const editing = editingSeal;
  await submit(sealForm, async () => {
    const saved = editing
      ? await api.updateSeal(editing, data)
      : await api.createSeal(data);
    closeSealForm();
    toast(
      editing
        ? `Lacre ${saved.codigo} atualizado.`
        : `Lacre ${saved.codigo} cadastrado.`,
    );
    await load("lacres");
  });
}

async function deleteSeal(c) {
  const seal = state.lacres.items.find((s) => s.codigo === c);
  const ok = await confirmDelete(
    `Excluir o lacre ${c}?`,
    `${seal ? productName(seal.produtoId) + ". " : ""}O lacre sai do banco de dados e deixa de aparecer na verificação do site.`,
  );
  if (!ok) return;
  try {
    await api.deleteSeal(c);
    if (editingSeal === c) closeSealForm();
    toast(`Lacre ${c} excluído.`);
    await load("lacres");
  } catch (err) {
    toast(err.message, "error");
  }
}

// Clientes -------------------------------------------------------------------

function renderClientStats() {
  if (!ready("clientes")) {
    ["total", "week", "month", "last"].forEach((n) =>
      setStat(`clientes-${n}`, "–"),
    );
    return;
  }
  const items = state.clientes.items;
  const now = Date.now();
  const since = (days) =>
    items.filter((c) => {
      const d = parseLocal(c.criadoEm);
      return d && now - d.getTime() <= days * 86400000;
    }).length;
  const last = [...items].sort((a, b) => b.id - a.id)[0];
  setStat(
    "clientes-total",
    items.length,
    items.length ? "com nome e celular" : "",
  );
  setStat("clientes-week", since(7), "cadastros na última semana");
  setStat("clientes-month", since(30), "cadastros no último mês");
  setStat(
    "clientes-last",
    last ? last.nome : "–",
    last ? brDateTime(last.criadoEm) : "",
  );
}

function renderClients() {
  renderClientStats();
  const box = $("#clientList");
  const pending = listState("clientes", {
    noun: "os clientes",
    empty: {
      icon: "users",
      title: "Nenhum cliente cadastrado ainda",
      text: "Os pedidos confirmados na loja aparecem aqui. Você também pode cadastrar um cliente agora.",
      action: `<button class="btn btn-primary btn-sm" type="button" data-new-client>${icon("plus")}Novo cliente</button>`,
    },
  });
  if (pending) {
    box.innerHTML = pending;
    setSummary("clientes", "#clientSummary", 0, ["cliente", "clientes"]);
    return;
  }
  const search = $("#clientSearch").value.trim();
  const q = norm(search);
  const qDigits = q.replace(/\D/g, "");
  const items = [...state.clientes.items]
    .sort((a, b) => b.id - a.id)
    .filter(
      (c) =>
        !q ||
        norm(c.nome).includes(q) ||
        (qDigits && c.telefone.replace(/\D/g, "").includes(qDigits)),
    );
  setSummary("clientes", "#clientSummary", items.length, [
    "cliente",
    "clientes",
  ]);
  if (!items.length) {
    box.innerHTML = noMatch(`Nenhum cliente encontrado para “${esc(search)}”.`);
    return;
  }
  box.innerHTML = `<table class="${TABLE}"><thead class="${THEAD}"><tr>
      <th class="${TH}" scope="col">Cliente</th><th class="${TH}" scope="col">Celular</th>
      <th class="${TH}" scope="col">Cadastrado em</th><th class="${TH}" scope="col"><span class="sr-only">Ações</span></th>
    </tr></thead><tbody class="${TBODY}">${items
      .map((c) => {
        const name = esc(c.nome);
        const tone = AVATAR_TONES[c.id % AVATAR_TONES.length];
        return `<tr class="${TR}" data-row="${c.id}">
        <td class="${TD} ${WIDE} max-md:before:hidden" data-label="Cliente"><div class="flex min-w-0 items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-bold ${tone}" aria-hidden="true">${esc(initials(c.nome))}</span><div class="min-w-0"><b class="block font-semibold text-fg md:max-w-[340px] md:truncate">${name}</b><span class="block font-mono ${MUTED}">#${c.id}</span></div></div></td>
        <td class="${TD} ${NOWRAP}" data-label="Celular">${esc(formatPhone(c.telefone))}</td>
        <td class="${TD} ${NOWRAP}" data-label="Cadastrado em">${brDateTime(c.criadoEm)}</td>
        <td class="${TD} ${ACTIONS_TD}" data-label=""><div class="${ACTIONS}">
          <button class="${EDIT_BTN}" type="button" data-edit-client="${c.id}" aria-label="Editar cliente ${name}" title="Editar">${icon("edit")}</button>
          <button class="${DELETE_BTN}" type="button" data-delete-client="${c.id}" aria-label="Excluir cliente ${name}" title="Excluir">${icon("trash")}</button>
        </div></td></tr>`;
      })
      .join("")}</tbody></table>`;
}

const clientDialog = $("#clientDialog");
const clientForm = $("#clientForm");
let editingClient = null;

function openClientForm(client = null) {
  closeSealForm();
  editingClient = client ? client.id : null;
  clientForm.reset();
  clearFormError(clientForm);
  $("#clientFormTitle").textContent = client
    ? `Editar cliente #${client.id}`
    : "Novo cliente";
  clientForm.elements.nome.value = client ? client.nome : "";
  clientForm.elements.telefone.value = client ? client.telefone : "";
  if (!clientDialog.open) clientDialog.showModal();
  clientForm.elements.nome.focus();
}

function closeClientForm() {
  editingClient = null;
  clearFormError(clientForm);
  if (clientDialog.open) clientDialog.close();
}

async function saveClient() {
  const data = {
    nome: clientForm.elements.nome.value.trim(),
    telefone: clientForm.elements.telefone.value.trim(),
  };
  if (data.nome.length < 3) {
    showFormError(clientForm, "Informe o nome do cliente.", "nome");
    return;
  }
  if (data.telefone.replace(/\D/g, "").length < 10) {
    showFormError(clientForm, "Informe um celular com DDD.", "telefone");
    return;
  }
  const editing = editingClient;
  await submit(clientForm, async () => {
    const saved = editing
      ? await api.updateClient(editing, data)
      : await api.createClient(data);
    closeClientForm();
    toast(
      editing
        ? `Cliente #${saved.id} atualizado.`
        : `Cliente #${saved.id} cadastrado.`,
    );
    await load("clientes");
  });
}

async function deleteClient(id) {
  const c = state.clientes.items.find((x) => x.id === id);
  const ok = await confirmDelete(
    `Excluir o cliente #${id}?`,
    `${c ? c.nome + " sai" : "O cliente sai"} do banco de dados. Clientes com endereços ou pedidos não podem ser excluídos.`,
  );
  if (!ok) return;
  try {
    await api.deleteClient(id);
    if (editingClient === id) closeClientForm();
    toast(`Cliente #${id} excluído.`);
    await load("clientes");
  } catch (err) {
    toast(err.message, "error");
  }
}

// Avisos (somente leitura) ----------------------------------------------------

const REASONS = {
  nao_encontrado: ["Lacre não encontrado", NEUTRAL_PILL],
  violado: ["Lacre violado", BAD_PILL],
};
const REPORT_STATUS = {
  aberto: ["Aberto", WARN_PILL],
  em_analise: ["Em análise", INFO_PILL],
  resolvido: ["Resolvido", OK_PILL],
};

function renderReportStats() {
  const keys = ["total", "aberto", "em_analise", "resolvido"];
  if (!ready("avisos")) {
    keys.forEach((n) => setStat(`avisos-${n}`, "–"));
    return;
  }
  const items = state.avisos.items;
  const count = (status) => items.filter((a) => a.status === status).length;
  setStat(
    "avisos-total",
    items.length,
    items.length ? "enviados pelos clientes" : "nenhum aviso até agora",
  );
  setStat("avisos-aberto", count("aberto"), "aguardando a loja");
  setStat("avisos-em_analise", count("em_analise"), "sendo apurados");
  setStat("avisos-resolvido", count("resolvido"), "casos encerrados");
}

function renderReports() {
  renderReportStats();
  const box = $("#reportList");
  const pending = listState("avisos", {
    noun: "os avisos",
    empty: {
      icon: "check",
      tone: "bg-ok-fill/12 text-ok",
      title: "Nenhum aviso recebido",
      text: "Quando um cliente avisar a marca sobre um lacre violado ou não encontrado, o aviso aparece aqui.",
    },
  });
  if (pending) {
    box.innerHTML = pending;
    setSummary("avisos", "#reportSummary", 0, ["aviso", "avisos"]);
    return;
  }
  const items = state.avisos.items;
  setSummary("avisos", "#reportSummary", items.length, ["aviso", "avisos"]);
  const sealByCode = Object.fromEntries(
    state.lacres.items.map((s) => [s.codigo, s]),
  );
  box.innerHTML = `<table class="${TABLE}"><thead class="${THEAD}"><tr>
      <th class="${TH}" scope="col">Nº</th><th class="${TH}" scope="col">Lacre</th><th class="${TH}" scope="col">Motivo</th>
      <th class="${TH}" scope="col">Situação</th><th class="${TH}" scope="col">Recebido em</th>
    </tr></thead><tbody class="${TBODY}">${items
      .map((a) => {
        const reason = REASONS[a.motivo];
        const status = REPORT_STATUS[a.status];
        const seal = sealByCode[a.lacreCodigo];
        return `<tr class="${TR}">
        <td class="${TD}" data-label="Nº"><span class="font-mono font-semibold text-fg-2">#${a.id}</span></td>
        <td class="${TD} max-md:col-start-2 max-md:row-start-1" data-label="Lacre">${code(a.lacreCodigo)}<span class="block ${MUTED}">${seal ? esc(productName(seal.produtoId)) : "Não cadastrado"}</span></td>
        <td class="${TD}" data-label="Motivo">${reason ? pill(...reason) : esc(a.motivo)}</td>
        <td class="${TD}" data-label="Situação">${status ? pill(...status) : esc(a.status)}</td>
        <td class="${TD} ${NOWRAP} ${WIDE}" data-label="Recebido em">${brDateTime(a.criadoEm)}</td></tr>`;
      })
      .join("")}</tbody></table>`;
}

// Carregamento e conexão --------------------------------------------------------

const loaders = {
  lacres: () => api.listSeals(),
  clientes: () => api.listClients(),
  avisos: () => api.listReports(),
};
const renderers = {
  lacres: renderSeals,
  clientes: renderClients,
  avisos: renderReports,
};

async function load(key) {
  const s = state[key];
  try {
    s.items = (await loaders[key]()) || [];
    s.error = "";
    s.updatedAt = new Date();
  } catch (err) {
    s.error = err.message;
  }
  s.loading = false;
  $(`[data-count="${key}"]`).textContent = s.error ? "–" : s.items.length;
  renderers[key]();
  // os avisos mostram o produto de cada lacre: redesenha quando os lacres chegam
  if (key === "lacres" && ready("avisos")) renderReports();
  updateStatus();
}

async function loadAll() {
  const btn = $("#reloadAll");
  btn.disabled = true;
  btn.setAttribute("aria-busy", "true");
  Object.keys(state).forEach((key) => {
    state[key].loading = true;
    renderers[key]();
  });
  setStatus("loading", "Conectando ao banco de dados…");
  await Promise.all(Object.keys(state).map(load));
  btn.disabled = false;
  btn.removeAttribute("aria-busy");
}

function apiHost() {
  try {
    return new URL(apiUrl()).host;
  } catch {
    return "";
  }
}
function setStatus(kind, text) {
  const el = $("#apiStatus");
  el.dataset.state = kind;
  $("[data-status-text]", el).textContent = text;
}
function updateStatus() {
  const all = Object.values(state);
  if (all.some((s) => s.loading)) return;
  if (!apiUrl()) setStatus("error", "Endereço da API não configurado");
  else if (all.some((s) => s.error))
    setStatus("error", `Sem conexão com a API (${apiHost()})`);
  else setStatus("ok", `Banco de dados conectado · ${apiHost()}`);
}

// Formulários, confirmação e avisos na tela ------------------------------------

function clearFormError(form) {
  const box = $("[data-form-error]", form);
  box.hidden = true;
  box.textContent = "";
  $$("[aria-invalid]", form).forEach((el) =>
    el.removeAttribute("aria-invalid"),
  );
}
function showFormError(form, text, field) {
  clearFormError(form);
  const box = $("[data-form-error]", form);
  box.textContent = text;
  box.hidden = false;
  const input = field && form.elements[field];
  if (input) {
    input.setAttribute("aria-invalid", "true");
    input.focus();
  } else box.scrollIntoView({ block: "nearest" });
}
async function submit(form, work) {
  const btn = $('button[type="submit"]', form);
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Salvando…";
  form.setAttribute("aria-busy", "true");
  try {
    await work();
  } catch (err) {
    showFormError(form, err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = label;
    form.removeAttribute("aria-busy");
  }
}

function confirmDelete(title, text) {
  const dialog = $("#confirmDialog");
  $("#confirmTitle").textContent = title;
  $("#confirmText").textContent = text;
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) =>
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue === "confirm"),
      { once: true },
    ),
  );
}

let toastTimer = 0;
function toast(text, kind = "ok") {
  const el = $("#panelToast");
  el.hidden = true;
  el.innerHTML = `<span class="grid size-6 shrink-0 place-items-center rounded-full ${kind === "error" ? "bg-white/20" : "bg-ok-fill"}">${icon(kind === "error" ? "alert" : "check", "size-3.5")}</span><span>${esc(text)}</span>`;
  el.dataset.kind = kind;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => {
      el.hidden = true;
    },
    kind === "error" ? 7000 : 3800,
  );
}

// Abas -----------------------------------------------------------------------

const tabs = $$('[role="tab"]');
function selectTab(name, focus = false, remember = true) {
  tabs.forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
    $("#" + tab.getAttribute("aria-controls")).hidden = !on;
    if (on && focus) tab.focus();
  });
  document.title = `${TAB_NAMES[name]} · Painel da loja | VeriSeal Delivery`;
  if (remember) history.replaceState(null, "", "#" + name);
}

// Ligações -------------------------------------------------------------------

const productOptions = [...PRODUCTS]
  .sort((a, b) => productName(a.id).localeCompare(productName(b.id), "pt-BR"))
  .map((p) => new Option(productName(p.id), p.id));
sealForm.elements.produtoId.append(...productOptions);

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab.dataset.tab));
  tab.addEventListener("keydown", (e) => {
    const last = tabs.length - 1;
    const to = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i + last) % tabs.length,
      Home: 0,
      End: last,
    }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    selectTab(tabs[to].dataset.tab, true);
  });
});
const fromHash = location.hash.slice(1);
selectTab(state[fromHash] ? fromHash : "lacres", false, false);

$$("[data-seal-filter]").forEach((btn) =>
  btn.addEventListener("click", () => {
    sealFilter = btn.dataset.sealFilter;
    $$("[data-seal-filter]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === btn)),
    );
    renderSeals();
  }),
);

$("#reloadAll").addEventListener("click", loadAll);
$("#sealSearch").addEventListener("input", renderSeals);
$("#clientSearch").addEventListener("input", renderClients);
$("#newSeal").addEventListener("click", () => openSealForm());
$("#newClient").addEventListener("click", () => openClientForm());
$("#sealNewCode").addEventListener("click", () => {
  sealForm.elements.codigo.value = randomSealCode();
});
sealForm.elements.codigo.addEventListener("input", (e) => {
  e.target.value = formatSealCode(e.target.value);
});
sealForm.elements.status.addEventListener("change", syncOpenedField);
clientForm.elements.telefone.addEventListener("input", (e) => {
  e.target.value = formatPhone(e.target.value);
});
sealForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveSeal();
});
clientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveClient();
});
$$("[data-cancel], [data-dismiss]", sealForm).forEach((b) =>
  b.addEventListener("click", closeSealForm),
);
$$("[data-cancel], [data-dismiss]", clientForm).forEach((b) =>
  b.addEventListener("click", closeClientForm),
);
// Esc ou clique fora da janela também fecham sem salvar
// (o evento "close" chega depois: se a janela já foi reaberta, não mexe em nada)
sealDialog.addEventListener("close", () => {
  if (!sealDialog.open) editingSeal = null;
});
clientDialog.addEventListener("close", () => {
  if (!clientDialog.open) editingClient = null;
});
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  }),
);

$("main").addEventListener("click", (e) => {
  const t = e.target;
  let el;
  if ((el = t.closest("[data-retry]"))) loadAll();
  else if ((el = t.closest("[data-new-seal]"))) openSealForm();
  else if ((el = t.closest("[data-new-client]"))) openClientForm();
  else if ((el = t.closest("[data-edit-seal]")))
    openSealForm(
      state.lacres.items.find((s) => s.codigo === el.dataset.editSeal),
    );
  else if ((el = t.closest("[data-delete-seal]")))
    deleteSeal(el.dataset.deleteSeal);
  else if ((el = t.closest("[data-edit-client]")))
    openClientForm(
      state.clientes.items.find((c) => c.id === +el.dataset.editClient),
    );
  else if ((el = t.closest("[data-delete-client]")))
    deleteClient(+el.dataset.deleteClient);
});

loadAll();
