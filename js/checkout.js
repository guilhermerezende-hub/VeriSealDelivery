import {
  $,
  $$,
  esc,
  money,
  hhmm,
  reduce,
  safe,
  icon,
  vsMark,
  LINK_BTN,
  ROW,
  GRAND,
  FREE,
  FIELD,
  LABEL,
  INPUT,
  OPTIONAL,
  PAY_OPT,
  PAY_RADIO,
  PAY_IC,
  PAY_EXTRA,
  REVIEW,
  REVIEW_H,
  ACTIONS,
  ACTION_MAIN,
} from "./ui.js";
import {
  PIX_OFF,
  PIX_LABEL,
  OPEN_H,
  DEMO_NOTICE,
  storeOpen,
} from "./config.js";
import { store } from "./storage.js";
import { fmtCep, validCep, etaText, cityUf, lookupCep } from "./delivery.js";
import { totals, inst } from "./commerce.js";

export function createCheckout({
  bag,
  byId,
  PRODUCTS,
  seals,
  fullName,
  isKit,
  subtotal,
  stack,
  getAddr,
  setAddr,
  closeLayer,
  openLayer,
  openBag,
  saveBag,
  refreshCTAs,
  updateBagUI,
}) {
  let co = null,
    coTimers = [];
  const coCleanup = () => {
    coTimers.forEach(clearTimeout);
    coTimers = [];
  };
  const fmtPhone = (v) => {
    const d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  function slots() {
    const out = [],
      d = new Date(Date.now() + 90 * 60000);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    if (!storeOpen(d)) {
      d.setHours(OPEN_H, 0, 0, 0);
      if (d < new Date()) d.setDate(d.getDate() + 1);
    }
    for (let k = 0; k < 8; k++) {
      if (!storeOpen(d)) break;
      const dayTxt = d.getDate() === new Date().getDate() ? "Hoje" : "Amanhã";
      out.push(
        `${dayTxt}, ${hhmm(d)}–${hhmm(new Date(d.getTime() + 30 * 60000))}`,
      );
      d.setMinutes(d.getMinutes() + 30);
    }
    return out;
  }
  function coTotals() {
    return totals(subtotal(), co?.d.pay);
  }
  const stepsBar = (
    n,
  ) => `<div class="mt-4 mb-1.5 flex gap-1.5" aria-hidden="true">${[0, 1, 2].map((i) => `<span class="h-1 flex-1 rounded-[2px] transition-[background] duration-300 ${i <= n ? "bg-accent" : "bg-surface-2"}"></span>`).join("")}</div>
    <p class="mb-[22px] text-[12px] text-fg-2">Etapa ${n + 1} de 3</p>`;
  const coTitle = (t) =>
    `<p class="demo-notice">${DEMO_NOTICE} Use dados fictícios.</p><h2 class="pr-10 text-[28px] font-extrabold tracking-[-.03em] outline-none">${t}</h2>`;

  function openCheckout() {
    const addr = getAddr();
    if (!bag.size) return;
    const prof = store.get("profile", {});
    co = {
      step: 0,
      d: {
        name: prof.name || "",
        phone: prof.phone || "",
        cep: addr ? addr.cep : "",
        street: addr ? addr.street : "",
        number: prof.number || "",
        comp: prof.comp || "",
        bairro: addr ? addr.bairro : "",
        city: addr ? cityUf(addr) : "",
        when: storeOpen() ? "now" : "later",
        slot: "",
        gift: false,
        giftMsg: "",
        pay: "pix",
        inst: 1,
        change: "",
      },
    };
    const fromBag = stack.find((s) => s.el.id === "bagDrawer");
    if (fromBag) closeLayer(fromBag.el, { restoreFocus: false });
    renderCheckout();
    openLayer($("#checkoutSheet"));
  }

  function field(
    id,
    label,
    value,
    attrs = "",
    opt = false,
    cls = "flex-[1_1_180px]",
  ) {
    return `<div class="${FIELD} ${cls}"><label class="${LABEL}" for="${id}">${label}${opt ? OPTIONAL : ""}</label>
      <input class="${INPUT}" id="${id}" name="${id.replace("co", "").toLowerCase()}" value="${esc(value)}" ${attrs}><span class="text-[12px] text-bad" data-msg hidden></span></div>`;
  }
  function renderCheckout() {
    const addr = getAddr();
    const el = $("#checkoutContent");
    const d = co.d;
    const t = coTotals();
    if (co.step === 0) {
      const sl = slots();
      el.innerHTML = `${coTitle("Entrega")}${stepsBar(0)}
        <form class="flex flex-col gap-3.5" id="coForm" novalidate>
          <div class="flex flex-wrap gap-3">${field("coName", "Nome completo", d.name, 'autocomplete="name" required')}${field("coPhone", "Celular (WhatsApp)", d.phone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 98765-4321" required')}</div>
          <div class="flex flex-wrap gap-3"><div class="min-w-0 flex-[0_1_150px]">${field("coCep", "CEP", d.cep, 'inputmode="numeric" maxlength="9" autocomplete="postal-code" required', false, "h-full flex-1")}</div><div class="min-w-0 flex-[1_1_220px]">${field("coStreet", "Rua", d.street, 'autocomplete="address-line1" required', false, "h-full flex-1")}</div></div>
          <div class="flex flex-wrap gap-3"><div class="min-w-0 flex-[0_1_120px]">${field("coNumber", "Número", d.number, 'inputmode="numeric" required', false, "h-full flex-1")}</div><div class="min-w-0 flex-[1_1_220px]">${field("coComp", "Complemento", d.comp, 'autocomplete="address-line2"', true, "h-full flex-1")}</div></div>
          <div class="flex flex-wrap gap-3">${field("coBairro", "Bairro", d.bairro, "required")}${field("coCity", "Cidade/UF", d.city, "required")}</div>
          <fieldset class="grid min-w-0 gap-2.5">
            <legend class="mb-2 px-0.5 text-[13px] font-semibold text-fg-2">Entrega simulada</legend>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="when" value="now"${d.when === "now" ? " checked" : ""}${storeOpen() ? "" : " disabled"}>
              <span class="${PAY_IC}">${icon("moto", "size-5")}</span><span><strong class="block text-[16px]">Agora</strong><small class="text-[13px] text-fg-2">${storeOpen() ? `${addr ? etaText(addr) : "prazo não disponível"}` : `Horário ilustrativo: a partir das ${OPEN_H}h`}</small></span></label>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="when" value="later"${d.when === "later" ? " checked" : ""}>
              <span class="${PAY_IC}">${icon("clock", "size-5")}</span><span><strong class="block text-[16px]">Agendar</strong><small class="text-[13px] text-fg-2">Janela ilustrativa; nenhum agendamento é realizado</small></span></label>
            <div class="${PAY_EXTRA}" data-for="later"${d.when === "later" ? "" : " hidden"}><div class="${FIELD} flex-1"><label class="${LABEL}" for="coSlot">Horário</label>
              <select class="${INPUT}" id="coSlot" name="slot">${sl.map((s) => `<option${s === d.slot ? " selected" : ""}>${s}</option>`).join("")}</select></div></div>
          </fieldset>
          <label class="flex cursor-pointer items-start gap-2.5 text-[15px]"><input class="mt-0.5 size-[18px] shrink-0 accent-accent" type="checkbox" name="gift"${d.gift ? " checked" : ""}><span class="inline-flex items-center gap-2">${icon("gift", "size-[18px] text-accent")}É presente? Incluir cartão com mensagem</span></label>
          <div class="${FIELD} flex-1" data-gift${d.gift ? "" : " hidden"}><label class="${LABEL}" for="coGiftMsg">Mensagem do cartão</label>
            <textarea class="${INPUT}" id="coGiftMsg" name="giftmsg" maxlength="140" rows="2" placeholder="Ex.: Feliz aniversário! Saúde!">${esc(d.giftMsg)}</textarea>
            <span class="text-[12px] text-fg-2">Até 140 caracteres. O cartão não mostra preços.</span></div>
          <div class="${ACTIONS}"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="${ACTION_MAIN}">Continuar para pagamento</button></div>
        </form>`;
      const f = $("#coForm");
      const phone = $("#coPhone"),
        cep = $("#coCep");
      phone.addEventListener("input", () => {
        phone.value = fmtPhone(phone.value);
      });
      cep.addEventListener("input", async () => {
        cep.value = fmtCep(cep.value);
        if (cep.value.length !== 9) return;
        const requestedCep = cep.value;
        const r = await lookupCep(requestedCep);
        if (!cep.isConnected || cep.value !== requestedCep) return;
        if (r.error) {
          setErr(cep, r.error);
          return;
        }
        setErr(cep, "");
        setAddr(r);
        if (r.street) $("#coStreet").value = r.street;
        if (r.bairro) $("#coBairro").value = r.bairro;
        if (r.city) $("#coCity").value = cityUf(r);
      });
      f.addEventListener("change", (e) => {
        if (e.target.name === "when")
          $('[data-for="later"]', f).hidden = e.target.value !== "later";
        if (e.target.name === "gift")
          $("[data-gift]", f).hidden = !e.target.checked;
      });
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = (id) => $("#" + id).value.trim();
        Object.assign(d, {
          name: v("coName"),
          phone: v("coPhone"),
          cep: v("coCep"),
          street: v("coStreet"),
          number: v("coNumber"),
          comp: v("coComp"),
          bairro: v("coBairro"),
          city: v("coCity"),
          when: (f.querySelector("[name=when]:checked") || {}).value || "later",
          slot: $("#coSlot") ? $("#coSlot").value : "",
          gift: f.gift.checked,
          giftMsg: $("#coGiftMsg").value.trim(),
        });
        const errs = [
          [!d.name || d.name.length < 3, "coName", "Informe seu nome."],
          [
            d.phone.replace(/\D/g, "").length < 10,
            "coPhone",
            "Informe um celular com DDD.",
          ],
          [!validCep(d.cep), "coCep", "Informe um CEP válido."],
          [!d.street, "coStreet", "Informe a rua."],
          [!d.number, "coNumber", "Informe o número."],
          [!d.bairro, "coBairro", "Informe o bairro."],
          [!d.city, "coCity", "Informe a cidade."],
        ];
        let first = null;
        errs.forEach(([bad, id, msg]) => {
          setErr($("#" + id), bad ? msg : "");
          if (bad && !first) first = $("#" + id);
        });
        if (first) {
          first.focus();
          return;
        }
        store.set("profile", {
          name: d.name,
          phone: d.phone,
          number: d.number,
          comp: d.comp,
        });
        if (!addr || addr.cep !== fmtCep(d.cep))
          setAddr({
            cep: fmtCep(d.cep),
            street: d.street,
            bairro: d.bairro,
            city: d.city,
            uf: "",
            coverage: "unconfirmed",
          });
        co.step = 1;
        renderCheckout();
        focusTitle();
      });
      return;
    }

    if (co.step === 1) {
      const i = inst(t.sub + t.ship);
      el.innerHTML = `${coTitle("Pagamento")}${stepsBar(1)}
        <form class="flex flex-col gap-3.5" id="coForm" novalidate>
          <fieldset class="grid min-w-0 gap-2.5"><legend class="sr-only">Forma de pagamento</legend>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="pay" value="pix"${d.pay === "pix" ? " checked" : ""}>
              <span class="${PAY_IC}">${icon("pix", "size-5")}</span><span><strong class="block text-[16px]">Pix · ${PIX_LABEL} off</strong><small class="text-[13px] text-fg-2">Você economiza ${money(t.sub * PIX_OFF)} · desconto simulado</small></span></label>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="pay" value="card"${d.pay === "card" ? " checked" : ""}>
              <span class="${PAY_IC}">${icon("card", "size-5")}</span><span><strong class="block text-[16px]">Cartão de crédito</strong><small class="text-[13px] text-fg-2">${i ? `Em até ${i.n}x de ${money(i.v)} sem juros` : "À vista"}</small></span></label>
            <div class="${PAY_EXTRA}" data-for="card"${d.pay === "card" ? "" : " hidden"}><div class="${FIELD} flex-1"><label class="${LABEL}" for="coInst">Parcelas</label>
              <select class="${INPUT}" id="coInst" name="inst">${Array.from(
                { length: i ? i.n : 1 },
                (_, k) => k + 1,
              )
                .map(
                  (k) =>
                    `<option value="${k}"${+d.inst === k ? " selected" : ""}>${k}x de ${money((t.sub + t.ship) / k)} sem juros</option>`,
                )
                .join("")}</select></div></div>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="pay" value="cod"${d.pay === "cod" ? " checked" : ""}>
              <span class="${PAY_IC}">${icon("cash", "size-5")}</span><span><strong class="block text-[16px]">Pagar na entrega</strong><small class="text-[13px] text-fg-2">Opção ilustrativa; não há cobrança</small></span></label>
            <div class="${PAY_EXTRA}" data-for="cod"${d.pay === "cod" ? "" : " hidden"}><div class="${FIELD} flex-1"><label class="${LABEL}" for="coChange">Troco para${OPTIONAL}</label>
              <input class="${INPUT}" id="coChange" name="change" inputmode="decimal" placeholder="Ex.: 300" value="${esc(d.change)}"></div></div>
          </fieldset>
          <p class="text-center text-[12px] text-fg-3">Ambiente de demonstração: nenhum pagamento é processado.</p>
          <div class="${ACTIONS}"><button type="button" class="btn btn-ghost" data-back>Voltar</button><button type="submit" class="${ACTION_MAIN}">Revisar pedido</button></div>
        </form>`;
      const f = $("#coForm");
      f.addEventListener("change", (e) => {
        if (e.target.name !== "pay") return;
        $$("[data-for]", f).forEach((x) => {
          x.hidden = x.dataset.for !== e.target.value;
        });
      });
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        d.pay = f.querySelector("[name=pay]:checked").value;
        d.inst = $("#coInst") ? +$("#coInst").value : 1;
        d.change = $("#coChange") ? $("#coChange").value.trim() : "";
        co.step = 2;
        renderCheckout();
        focusTitle();
      });
      return;
    }

    if (co.step === 2) {
      const payTxt =
        d.pay === "pix"
          ? `Pix · ${PIX_LABEL} de desconto`
          : d.pay === "card"
            ? `Cartão de crédito · ${d.inst}x de ${money(t.total / d.inst)}`
            : `Na entrega${d.change ? ` · troco para R$ ${esc(d.change)}` : ""}`;
      const whenTxt =
        d.when === "now"
          ? `Agora · ${addr ? etaText(addr) : "prazo não disponível"}`
          : `Agendado · ${esc(d.slot)}`;
      const edit = `text-[13px] ${LINK_BTN}`;
      el.innerHTML = `${coTitle("Revisão")}${stepsBar(2)}
        <div class="${REVIEW}"><h4 class="${REVIEW_H}">Itens <button class="${edit}" type="button" data-edit-bag>Editar</button></h4>
          <ul>${[...bag].map(([id, q]) => `<li class="flex justify-between gap-2.5 py-[3px] text-[15px]"><span>${q}× ${esc(fullName(byId[id]))}</span><span>${money(byId[id].price * q)}</span></li>`).join("")}</ul></div>
        <div class="${REVIEW} mt-2.5"><h4 class="${REVIEW_H}">Entrega <button class="${edit}" type="button" data-goto="0">Alterar</button></h4>
          <p class="text-[15px]">${esc(d.street)}, ${esc(d.number)}${d.comp ? " — " + esc(d.comp) : ""}<br>${esc(d.bairro)} · ${esc(d.city)} · ${esc(d.cep)}</p><p class="mt-1 text-[14px] text-fg-2">${whenTxt}</p></div>
        <div class="${REVIEW} mt-2.5"><h4 class="${REVIEW_H}">Pagamento <button class="${edit}" type="button" data-goto="1">Alterar</button></h4><p class="text-[15px]">${payTxt}</p></div>
        ${d.gift && d.giftMsg ? `<div class="${REVIEW} mt-2.5"><h4 class="${REVIEW_H}">Cartão de presente</h4><p class="text-[15px] italic">“${esc(d.giftMsg)}”</p></div>` : ""}
        <div class="mt-4 mb-3.5">
          <div class="${ROW}"><span>Subtotal</span><span>${money(t.sub)}</span></div>
          ${t.disc ? `<div class="${ROW}"><span>Desconto Pix (${PIX_LABEL})</span><span class="${FREE}">− ${money(t.disc)}</span></div>` : ""}
          <div class="${ROW}"><span>Entrega</span><span class="${t.ship ? "" : FREE}">${t.ship ? money(t.ship) : "Grátis"}</span></div>
          <div class="${GRAND}"><span>Total</span><span>${money(t.total)}</span></div>
        </div>
        <label class="mt-1.5 flex cursor-pointer items-start gap-2.5 text-[14px]"><input class="mt-0.5 size-[18px] shrink-0 accent-accent" type="checkbox" id="coAge"><span class="inline-flex items-center gap-2">Tenho 18 anos ou mais e vou apresentar documento com foto, se solicitado na entrega.</span></label>
        <p class="mt-2 text-[14px] text-bad" id="coAgeErr" role="alert" hidden>Confirme que você tem 18 anos ou mais para concluir.</p>
        <p class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-[#eef7fd] px-3.5 py-3 text-[13px] text-fg-2">${vsMark("w-7 shrink-0")}<span>Ao concluir, você cria somente um exemplo local. Não há compra, pagamento, entrega ou garantia de autenticidade.</span></p>
        <div class="${ACTIONS}"><button type="button" class="btn btn-ghost" data-back>Voltar</button><button type="button" class="${ACTION_MAIN}" id="coConfirm">Concluir simulação · ${money(t.total)}</button></div>`;
      $("#coConfirm").addEventListener("click", () => {
        if (!$("#coAge").checked) {
          $("#coAgeErr").hidden = false;
          $("#coAge").focus();
          return;
        }
        placeOrder();
      });
      $("#coAge").addEventListener("change", () => {
        $("#coAgeErr").hidden = true;
      });
      return;
    }

    const o = co.order;
    const tl = (state, title, sub) =>
      `<li class="${state} relative flex gap-3.5 pb-[18px] before:absolute before:top-[26px] before:bottom-0.5 before:left-[11px] before:w-0.5 before:bg-surface-2 last:pb-0 last:before:hidden [&.done]:before:bg-accent"><span class="relative z-[1] grid size-6 shrink-0 place-items-center rounded-full border-2 border-line bg-white transition-all duration-[400ms] [.current_&]:border-accent [.current_&]:shadow-[0_0_0_5px_rgb(0_106_168/.1)] [.done_&]:border-accent [.done_&]:bg-accent">${icon("check", "size-[13px] text-white opacity-0 [.done_&]:opacity-100")}</span><div><strong class="block text-[15px] tracking-[-.01em] [li:not(.done):not(.current)_&]:text-fg-3">${title}</strong><small class="text-[13px] text-fg-2">${sub}</small></div></li>`;
    el.innerHTML = `<div class="text-center">
        <div class="mx-auto mt-1 mb-[18px] grid size-16 place-items-center rounded-full bg-ok-fill text-white">${icon("check", "size-[34px] animate-[drawIn_.6s_var(--ease-smooth)_.2s_both]")}</div>
        <h2 class="text-[30px] font-extrabold tracking-[-.03em] outline-none">Simulação concluída!</h2>
        <p class="mt-1.5 text-fg-2">Pedido <span class="font-mono font-semibold text-fg">#${o.num}</span> · ${o.when}</p>
        ${o.pay === "pix" ? `<p class="mt-3 inline-flex items-center gap-2 rounded-full bg-ok-fill/10 px-3.5 py-1.5 text-[14px] font-semibold text-ok">${icon("pix", "size-4")}Pix simulado · desconto ilustrativo de ${money(o.disc)}</p>` : ""}
        <p class="demo-notice">${DEMO_NOTICE} A sequência abaixo é uma animação, sem rastreamento real.</p><ol class="mt-[26px] mb-2 text-left" id="coTimeline">
          ${tl("done", "Pedido recebido", o.time)}
          ${
            o.scheduled
              ? tl(
                  "current",
                  "Entrega agendada",
                  `${esc(o.slot)} · os lacres são conferidos antes de sair`,
                )
              : tl(
                  "current",
                  "Separando e conferindo os lacres",
                  "Cada garrafa é escaneada antes de sair",
                )
          }
          ${tl("", "Saiu para entrega", "Etapa ilustrativa; nenhum aviso é enviado")}
          ${tl("", "Entregue", "Aproxime o celular do lacre e confira")}
        </ol>
        <div class="mt-[22px] mb-5 rounded-2xl bg-[#eef7fd] p-4 text-left">
          <h4 class="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-navy">${vsMark("w-6")}Lacres fictícios desta simulação</h4>
          <ul>${o.seals.map((s) => `<li class="mb-1.5 flex items-center justify-between gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-[14px]"><span class="flex min-w-0 flex-col"><b class="truncate text-[13px] font-semibold">${esc(s.name)}</b><code class="font-mono text-[13px] font-semibold text-navy">${s.code}</code></span><button class="text-[13px] whitespace-nowrap ${LINK_BTN}" type="button" data-verify-code="${s.code}">Verificar ›</button></li>`).join("")}</ul>
          <p class="mt-2 text-[12px] text-fg-2">Códigos fictícios, salvos apenas neste navegador. Não correspondem a garrafas reais.</p>
        </div>
        <button class="btn btn-primary w-full" type="button" data-close>Continuar comprando</button>
      </div>`;
    const items = $$("#coTimeline > li");
    const advance = (k) => {
      items.forEach((li, j) => {
        li.classList.toggle("done", j < k);
        li.classList.toggle("current", j === k);
      });
    };
    if (!o.scheduled)
      coTimers.push(setTimeout(() => advance(2), reduce ? 0 : 4200));
  }
  function setErr(input, msg) {
    input.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    const m = input.parentElement.querySelector("[data-msg]");
    if (m) {
      m.textContent = msg;
      m.hidden = !msg;
    }
  }
  const focusTitle = () =>
    requestAnimationFrame(() => {
      const h = $("#checkoutContent h2");
      if (h) {
        h.tabIndex = -1;
        h.focus({ preventScroll: true });
      }
      $("#checkoutPanel").scrollTop = 0;
    });

  const SEAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand4 = () =>
    Array.from(
      { length: 4 },
      () => SEAL_CHARS[(Math.random() * SEAL_CHARS.length) | 0],
    ).join("");
  function newSealCode() {
    let c;
    do {
      c = `VS-${rand4()}-${rand4()}`;
    } while (seals[c]);
    return c;
  }
  function placeOrder() {
    const addr = getAddr();
    const d = co.d,
      t = coTotals(),
      now = new Date();
    const num = "DEMO-" + String(Math.floor(10000 + Math.random() * 89999));
    const lot = `L${String(now.getFullYear()).slice(2)}-${String(now.getMonth() + 1).padStart(2, "0")}${String(10 + ((Math.random() * 18) | 0))}`;
    const made = new Date(
      now.getTime() - (20 + Math.random() * 60) * 86400000,
    ).toLocaleDateString("pt-BR");
    const out = [];
    const mine = store.get("demo:seals", {});
    [...bag].forEach(([id, q]) => {
      const p = byId[id];
      const units = isKit(p) ? p.bottles : [p];
      for (let k = 0; k < q; k++)
        units.forEach((b) => {
          const code = newSealCode();
          const rec = {
            product: b.id,
            status: "ok",
            lot,
            made,
            checks: 0,
            sentAt: "hoje · " + hhmm(new Date(now.getTime() + 6 * 60000)),
            order: num,
          };
          seals[code] = rec;
          mine[code] = rec;
          out.push({ code, name: fullName(b) });
        });
    });
    store.set("demo:seals", mine);
    store.set("demo:lastSeal", out[0] && out[0].code);
    co.order = {
      num,
      pay: d.pay,
      disc: t.disc,
      time: "hoje · " + hhmm(now),
      seals: out,
      scheduled: d.when !== "now",
      slot: d.slot,
      when:
        d.when === "now"
          ? `${addr ? etaText(addr) : "prazo não disponível"}`
          : `agendado: ${esc(d.slot)}`,
    };
    bag.clear();
    saveBag();
    PRODUCTS.forEach((p) => refreshCTAs(p.id));
    updateBagUI();
    co.step = 3;
    renderCheckout();
    focusTitle();
    const h = $("#checkoutContent h2");
    if (h) {
      h.tabIndex = -1;
      h.focus();
    }
  }
  safe("checkout", () => {
    $("#checkoutContent").addEventListener("click", (e) => {
      if (e.target.closest("[data-back]")) {
        co.step = Math.max(0, co.step - 1);
        renderCheckout();
        focusTitle();
      }
      const g = e.target.closest("[data-goto]");
      if (g) {
        co.step = +g.dataset.goto;
        renderCheckout();
        focusTitle();
      }
      if (e.target.closest("[data-edit-bag]")) {
        closeLayer($("#checkoutSheet"), { restoreFocus: false });
        openBag();
      }
    });
  });

  return { open: openCheckout, cleanup: coCleanup };
}
