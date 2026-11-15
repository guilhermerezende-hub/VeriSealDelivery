import { $, esc, hhmm, reduce, safe, icon, VR_IN, verifyScreen } from "./ui.js";
import { SITE_HOST } from "./config.js";
import { store } from "./storage.js";
import { api } from "./api.js";
import { SEAL_CODE_RE, formatSealCode, sealFromApi } from "./records.js";

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
  let ticket = 0;

  // O banco (pela API) é quem diz se o lacre existe. Cada consulta fica registrada
  // na tabela verificacoes. Se a API não responder, usa os lacres guardados no site.
  async function lookup(code, origin) {
    try {
      return sealFromApi(await api.checkSeal(code, origin));
    } catch (err) {
      if (err.status === 404 || err.status === 400) return null;
      const s = seals[code];
      if (!s) return null;
      s.checks =
        (Number.isSafeInteger(s.checks) && s.checks >= 0 ? s.checks : 0) + 1;
      persistSeal(code);
      return s;
    }
  }

  async function runVerify(code, origin = "codigo") {
    verifyError.hidden = true;
    verifyInput.classList.remove("invalid");
    const mine = ++ticket;
    verifyResult.setAttribute("aria-busy", "true");
    const seal = await lookup(code, origin);
    if (mine !== ticket) return;
    verifyResult.removeAttribute("aria-busy");
    showResult(code, seal);

    if (verifyResult.getBoundingClientRect().top > innerHeight - 120)
      verifyResult.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
  }

  const verifyPage = (content) =>
    `<div class="w-full"><div class="@container mx-auto w-full max-w-[380px] overflow-hidden rounded-[26px] bg-white pt-[14px] shadow-[0_30px_60px_-24px_rgba(0,0,0,.75)] ${VR_IN}"><div class="verify-bar">${icon("lock-filled")}<span>${esc(SITE_HOST)}</span></div><div class="verify-page mt-[3cqi] px-[6cqi] pb-[6cqi]"><img class="verify-logo" src="assets/brand/logo-light-bg.svg" alt="VeriSeal"><div class="is-on mt-[8.3cqi] [&_.verify-btn]:mt-[6cqi]">${content}</div></div></div></div>`;
  const report = (reason, code) => ({
    label: "Avisar a marca",
    attrs: `data-report="${reason}" data-code="${esc(code)}"`,
  });
  function showResult(code, s) {
    const p = s && byId[s.product];
    const codeRow = [s ? "Lacre" : "Código", esc(code), "font-mono"];
    if (!s || !p || s.status === "unknown") {
      verifyResult.dataset.state = "bad";
      verifyResult.innerHTML = verifyPage(
        verifyScreen({
          kind: "bad",
          title: "Lacre não encontrado",
          sub: "Confira o código impresso no lacre e tente de novo.",
          rows: [
            ["Código", esc(code), "font-mono"],
            ["Situação", "sem registro", "text-bad"],
          ],
          note: "Se o código estiver correto, não consuma a bebida e avise a marca.",
          btn: report("nao_encontrado", code),
        }),
      );
      return;
    }
    const opened = s.status === "opened";
    const product = {
      thumb: shot(p, { torn: opened }),
      name: esc(fullName(p)),
      detail: `${esc(p.volume)} · ${abv(p)} vol`,
    };
    if (opened) {
      verifyResult.dataset.state = "bad";
      verifyResult.innerHTML = verifyPage(
        verifyScreen({
          kind: "bad",
          title: "Lacre violado",
          sub: "Esta garrafa foi aberta depois do envio",
          product,
          rows: [
            codeRow,
            ["Lote", esc(s.lot)],
            ["1ª abertura", esc(s.openedAt)],
            ["Situação", "circuito rompido", "text-bad"],
          ],
          note: "Não aceite esta garrafa. Recuse a entrega e avise a marca.",
          btn: report("violado", code),
        }),
      );
      return;
    }
    const sent =
      s.sentAgo != null
        ? "hoje · " + hhmm(new Date(Date.now() - s.sentAgo * 60000))
        : s.sentAt || "antes do envio";
    verifyResult.dataset.state = "ok";
    verifyResult.innerHTML = verifyPage(
      verifyScreen({
        kind: "ok",
        title: "Lacre íntegro",
        sub: "Garrafa original · nunca aberta",
        product,
        rows: [
          codeRow,
          ["Lote", esc(s.lot)],
          ["Produção", esc(s.made)],
          ["Conferido no envio", esc(sent)],
          ["Verificações", s.checks],
        ],
        btn: { label: "Ver detalhes do produto", attrs: `data-open="${p.id}"` },
      }),
    );
  }
  function persistSeal(code) {
    const mine = store.get("demo:seals", {});
    if (mine[code]) {
      mine[code] = seals[code];
      store.set("demo:seals", mine);
    }
  }
  async function sendReport(btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    try {
      await api.reportSeal(btn.dataset.code, btn.dataset.report);
      btn.textContent = "Aviso enviado";
      toast("Aviso enviado à marca. Obrigado por avisar!");
    } catch (err) {
      btn.disabled = false;
      toast(
        err.status
          ? err.message
          : "Não foi possível enviar o aviso agora. Confira a conexão e tente de novo.",
      );
    }
  }
  function verifyCode(code) {
    code = formatSealCode(code);
    verifyInput.value = code;
    if (!SEAL_CODE_RE.test(code)) {
      verifyError.textContent =
        "Digite o código completo, no formato VS-XXXX-XXXX.";
      verifyError.hidden = false;
      verifyInput.classList.add("invalid");
      verifyInput.focus();
      return;
    }
    runVerify(code, "codigo");
  }
  safe("verify", () => {
    verifyInput.addEventListener("input", () => {
      verifyInput.value = formatSealCode(verifyInput.value);
      verifyInput.classList.remove("invalid");
      verifyError.hidden = true;
    });
    $("#verifyForm").addEventListener("submit", (e) => {
      e.preventDefault();
      verifyCode(verifyInput.value);
    });
    $("#nfcBtn").addEventListener("click", () => {
      const last = store.get("demo:lastSeal", null);
      const code = last && seals[last] ? last : "VS-7K2M-9QXA";
      verifyInput.value = code;
      runVerify(code, "nfc");
    });
    verifyResult.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-report]");
      if (btn) sendReport(btn);
    });
  });

  return { verifyCode };
}
