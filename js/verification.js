import { $, clamp, esc, hhmm, reduce, safe, icon, VR_IN, medal } from "./ui.js";
import { SITE_HOST } from "./config.js";
import { store } from "./storage.js";

export function createVerification({
  seals,
  byId,
  shot,
  fullName,
  abv,
  toast,
}) {
  const verifyInput = $("#verifyInput"),
    verifyResult = $("#verifyResult"),
    verifyError = $("#verifyError");
  const CODE_RE = /^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  function fmtCode(v) {
    let s = String(v)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (!s) return "";
    if (s.startsWith("VS")) s = s.slice(2);
    s = s.slice(0, 8);
    return "VS-" + s.slice(0, 4) + (s.length > 4 ? "-" + s.slice(4) : "");
  }
  function runVerify(code) {
    verifyError.hidden = true;
    verifyInput.classList.remove("invalid");
    showResult(code);
    // no celular o resultado fica abaixo do formulário: rola até ele
    if (verifyResult.getBoundingClientRect().top > innerHeight - 120)
      verifyResult.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
  }
  const VR_HEAD = {
    ok: "text-[#8ef5b0]",
    warn: "text-[#ffd67a]",
    bad: "text-[#ffaaa3]",
  };
  const vrUrl = (code) =>
    `<p class="mx-auto mb-3.5 flex w-fit max-w-full items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 font-mono text-[12px] leading-[1.2] font-medium text-[#c3cbd9] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] ${VR_IN}">${icon("lock", "size-[13px] text-[#8ef5b0]")}<span>${esc(SITE_HOST)}/v/${esc(code.slice(3))}</span></p>`;
  const vrHead = (kind, title, sub) =>
    `<div class="flex flex-col items-center gap-3 pt-1.5 pb-0.5 text-center">${medal(kind, "now", "92px")}<div class="${VR_IN}" style="--d:.38s"><b class="block text-[clamp(28px,3vw,36px)] leading-none font-extrabold tracking-[-.03em] ${VR_HEAD[kind]}">${title}</b><span class="mt-1.5 block text-[14px] text-white/78">${sub}</span></div></div>`;
  // cls troca o tamanho/cor padrão do valor (text-[15px])
  const vrGrid = (cells, d) =>
    `<dl class="mt-4 grid grid-cols-2 gap-x-[18px] gap-y-3.5 rounded-2xl bg-white/5 px-4 py-3.5 max-sm:gap-x-3 max-sm:gap-y-2.5 ${VR_IN}" style="--d:${d}">${cells.map(([k, v, cls]) => `<div><dt class="text-[12px] text-[#94a0b8]">${k}</dt><dd class="mt-0.5 font-semibold ${cls || "text-[15px]"}">${v}</dd></div>`).join("")}</dl>`;
  const MONO = "font-mono text-[14px] tracking-[.02em]";
  const vrNote = (text, d) =>
    `<p class="mt-4 text-[14px] leading-normal text-[#c3cbd9] ${VR_IN}" style="--d:${d}">${text}</p>`;
  function showResult(code) {
    const s = seals[code];
    const p = s && byId[s.product];
    if (!s || !p || s.status === "unknown") {
      verifyResult.dataset.state = "bad";
      verifyResult.innerHTML = `<div class="w-full"><p class="mb-3 text-center text-[13px] text-white/78">Demonstração com dados fictícios · sem leitura NFC real</p>${vrUrl(code)}
          ${vrHead("bad", "Exemplo não encontrado", "Este código não está na base local de demonstração.")}
          ${vrGrid(
            [
              ["Código", esc(code), MONO],
              ["Situação", "sem registro", "text-[15px] text-[#ff8a80]"],
            ],
            ".5s",
          )}
          ${vrNote("Esta consulta usa dados fictícios e não determina a autenticidade de uma bebida real.", ".6s")}
          <button class="btn btn-light btn-sm mt-4 ${VR_IN}" style="--d:.7s" type="button" data-report>Simular aviso à marca</button>
        </div>`;
      return;
    }
    s.checks =
      (Number.isSafeInteger(s.checks) && s.checks >= 0 ? s.checks : 0) + 1;
    persistSeal(code);
    const opened = s.status === "opened";
    const product = `<div class="mt-4 flex items-center gap-4 rounded-2xl bg-white/7 px-4 py-3 ${VR_IN}" style="--d:.5s"><span class="flex h-[104px] w-[52px] shrink-0 items-end justify-center rounded-xl bg-[linear-gradient(#f4f8fd,#dfe7f2)] px-0.5 pt-1.5 pb-1 text-[13px] text-[#94a0b8]">${shot(p, { torn: opened })}</span><div><strong class="block text-[17px] tracking-[-.015em]">${esc(fullName(p))}</strong><span class="text-[13px] text-[#94a0b8]">${esc(p.volume)} · ${abv(p)} vol. · ${esc(p.origin)}</span></div></div>`;
    if (opened) {
      verifyResult.dataset.state = "warn";
      verifyResult.innerHTML = `<div class="w-full"><p class="mb-3 text-center text-[13px] text-white/78">Demonstração com dados fictícios · sem leitura NFC real</p>${vrUrl(code)}
          ${vrHead("warn", "Exemplo: lacre aberto", "Estado fictício; nenhum circuito físico foi consultado.")}
          ${product}
          ${vrGrid(
            [
              ["Lacre", esc(code), MONO],
              ["Lote", esc(s.lot)],
              ["1ª abertura", esc(s.openedAt), "text-[15px] text-[#ffd67a]"],
              ["Verificações", s.checks],
            ],
            ".6s",
          )}
          ${vrNote("Este resultado demonstra a aparência de um alerta. Não verifica a condição de uma garrafa real.", ".7s")}
        </div>`;
      return;
    }
    verifyResult.dataset.state = "ok";
    // cada etapa da jornada entra 0,1 s depois da anterior
    const STEP_IN = [
      "animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.1s)_both]",
      "animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.2s)_both]",
      "animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.3s)_both]",
      "animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.4s)_both]",
    ];
    const step = (k, title, sub, now) =>
      `<li class="relative ${STEP_IN[k]} pt-1 pb-2.5 [--rise:8px] before:absolute before:top-2 before:-left-6 before:size-2.5 before:rounded-full before:border-2 ${now ? "before:border-[#30d158] before:bg-[#30d158] before:shadow-[0_0_0_5px_rgba(48,209,88,.2)]" : "before:border-[#03adf9] before:bg-navy-ink"}"><b class="block text-[14px]">${title}</b><span class="block text-[12px] text-[#94a0b8]">${sub}</span></li>`;
    verifyResult.innerHTML = `<div class="w-full"><p class="mb-3 text-center text-[13px] text-white/78">Demonstração com dados fictícios · sem leitura NFC real</p>${vrUrl(code)}
        ${vrHead("ok", "Exemplo: lacre íntegro", "Demonstração; não comprova origem ou autenticidade.")}
        ${product}
        ${vrGrid(
          [
            ["Lacre", esc(code), MONO],
            ["Lote", esc(s.lot)],
            ["Produção", esc(s.made)],
            ["Verificações", s.checks],
          ],
          ".6s",
        )}
        <ol class="relative mt-[18px] pl-[26px] before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-[linear-gradient(#03adf9,#30d158)] ${VR_IN}" style="--d:.7s">
          ${step(0, "Produção", `${esc(s.made)} · linha de envase`)}
          ${step(1, "Distribuidor autorizado", "origem rastreada")}
          ${step(2, "VeriSeal Delivery", `lacre conferido no envio · ${esc(s.sentAgo != null ? "hoje · " + hhmm(new Date(Date.now() - s.sentAgo * 60000)) : s.sentAt || "antes do envio")}`)}
          ${step(3, "Você", "agora · lacre íntegro", true)}
        </ol>
      </div>`;
  }
  function persistSeal(code) {
    const mine = store.get("demo:seals", {});
    if (mine[code]) {
      mine[code] = seals[code];
      store.set("demo:seals", mine);
    }
  }
  function verifyCode(code) {
    code = fmtCode(code);
    verifyInput.value = code;
    if (!CODE_RE.test(code)) {
      verifyError.textContent =
        "Digite o código completo, no formato VS-XXXX-XXXX.";
      verifyError.hidden = false;
      verifyInput.classList.add("invalid");
      verifyInput.focus();
      return;
    }
    runVerify(code);
  }
  safe("verify", () => {
    verifyInput.addEventListener("input", () => {
      verifyInput.value = fmtCode(verifyInput.value);
      verifyInput.classList.remove("invalid");
      verifyError.hidden = true;
    });
    $("#verifyForm").addEventListener("submit", (e) => {
      e.preventDefault();
      verifyCode(verifyInput.value);
    });
    $("#sampleCodes").innerHTML = (window.VSD_SAMPLE_CODES || [])
      .map(
        (c) =>
          `<button class="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[13px] text-fg hover:border-fg-3" type="button" data-code="${c.code}">${c.code}<em class="ml-1.5 font-sans text-[12px] text-fg-2 not-italic">${esc(c.label)}</em></button>`,
      )
      .join("");
    $("#sampleCodes").addEventListener("click", (e) => {
      const b = e.target.closest("[data-code]");
      if (b) verifyCode(b.dataset.code);
    });
    $("#nfcBtn").addEventListener("click", () => {
      const last = store.get("demo:lastSeal", null);
      const code = last && seals[last] ? last : "VS-7K2M-9QXA";
      verifyInput.value = code;
      runVerify(code);
    });
    verifyResult.addEventListener("click", (e) => {
      if (e.target.closest("[data-report]"))
        toast("Aviso simulado. Nenhuma mensagem foi enviada à marca.");
    });
  });

  return { verifyCode };
}
