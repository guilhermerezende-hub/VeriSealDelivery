import {
  $,
  clamp,
  esc,
  hhmm,
  reduce,
  safe,
  icon,
  VR_IN,
  verifyScreen,
} from "./ui.js";
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

    if (verifyResult.getBoundingClientRect().top > innerHeight - 120)
      verifyResult.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
  }

  const verifyPage = (content) =>
    `<div class="w-full"><div class="@container mx-auto w-full max-w-[380px] overflow-hidden rounded-[26px] bg-white pt-[14px] shadow-[0_30px_60px_-24px_rgba(0,0,0,.75)] ${VR_IN}"><div class="verify-bar">${icon("lock-filled")}<span>${esc(SITE_HOST)}</span></div><div class="verify-page mt-[3cqi] px-[6cqi] pb-[6cqi]"><img class="verify-logo" src="assets/brand/logo-light-bg.svg" alt="VeriSeal"><div class="is-on mt-[8.3cqi] [&_.verify-btn]:mt-[6cqi]">${content}</div></div></div></div>`;
  const REPORT = { label: "Avisar a marca", attrs: "data-report" };
  function showResult(code) {
    const s = seals[code];
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
          btn: REPORT,
        }),
      );
      return;
    }
    s.checks =
      (Number.isSafeInteger(s.checks) && s.checks >= 0 ? s.checks : 0) + 1;
    persistSeal(code);
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
          btn: REPORT,
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
    $("#nfcBtn").addEventListener("click", () => {
      const last = store.get("demo:lastSeal", null);
      const code = last && seals[last] ? last : "VS-7K2M-9QXA";
      verifyInput.value = code;
      runVerify(code);
    });
    verifyResult.addEventListener("click", (e) => {
      if (e.target.closest("[data-report]"))
        toast("Aviso enviado à marca. Obrigado por avisar!");
    });
  });

  return { verifyCode };
}
