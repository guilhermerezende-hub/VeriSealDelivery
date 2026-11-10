// Página de entregadores: cadastro em três etapas. Demonstração: os dados são
// conferidos no navegador e descartados; somente o CEP é consultado no ViaCEP.
import { $, $$, esc, icon, reduce, safe } from "./ui.js";
import { fmtCep, lookupCep, validCep } from "./delivery.js";
import {
  DEMO_CPFS,
  SHIFTS,
  STEP_FIELDS,
  VEHICLES,
  digits,
  firstName,
  fmtCpf,
  fmtDate,
  fmtPhone,
  fmtPlate,
  needsLicense,
  validateStep,
} from "./courier-rules.js";

const form = $("#courierForm");
const steps = $$("fieldset[data-step]", form);
const stepItems = $$("[data-step-item]");
const back = $("#courierBack");
const next = $("#courierNext");
const progress = $("#courierProgress");
const review = $("#courierReview");
const done = $("#courierDone");
const cepInput = $("#cCep");
const cepInfo = $("#cCep-info");
const license = $("#licenseFields");

let step = 0;
// última consulta de CEP: evita repetir a busca e descarta respostas antigas
let cep = { digits: "", city: "", uf: "", bairro: "", notFound: false };
let cepRequest = 0;

const inputsOf = (field) => $$(`[name="${field}"]`, form);
const errorOf = (field) =>
  $(`#c${field[0].toUpperCase()}${field.slice(1)}-err`);

function readData() {
  const value = (field) => form.elements.namedItem(field).value.trim();
  return {
    name: value("name"),
    cpf: value("cpf"),
    birth: value("birth"),
    phone: value("phone"),
    email: value("email"),
    vehicle: $('[name="vehicle"]:checked', form)?.value || "",
    cep: value("cep"),
    cepNotFound: cep.notFound && cep.digits === digits(cepInput.value),
    cnh: value("cnh"),
    plate: value("plate"),
    shifts: $$('[name="shifts"]:checked', form).map((input) => input.value),
    terms: $("#cTerms").checked,
  };
}

function setError(field, message) {
  const box = errorOf(field);
  box.textContent = message;
  box.hidden = !message;
  inputsOf(field).forEach((input) =>
    message
      ? input.setAttribute("aria-invalid", "true")
      : input.removeAttribute("aria-invalid"),
  );
}

const hasError = (field) => !errorOf(field).hidden;

function checkField(field) {
  setError(field, validateStep(step, readData())[field] || "");
}

// CPFs fictícios da demonstração: o botão preenche só o CPF; a data é digitada
$("#cpfSamples").innerHTML = Object.entries(DEMO_CPFS)
  .map(
    ([cpf, { birth, label }]) =>
      `<button class="rounded-full border border-line bg-white px-3 py-1.5 text-left font-mono text-[13px] text-fg transition-colors duration-200 hover:border-fg-3" type="button" data-cpf="${cpf}">${fmtCpf(cpf)}<em class="ml-1.5 font-sans text-[12px] text-fg-2 not-italic">nasc. ${birth} · ${esc(label)}</em></button>`,
  )
  .join("");
$("#cpfSamples").addEventListener("click", (event) => {
  const sample = event.target.closest("[data-cpf]");
  if (!sample) return;
  $("#cCpf").value = fmtCpf(sample.dataset.cpf);
  checkField("cpf");
  if ($("#cBirth").value.trim()) checkField("birth");
  $("#cBirth").focus();
});

function go(to, focus = true) {
  step = to;
  steps.forEach((fieldset) => {
    fieldset.hidden = Number(fieldset.dataset.step) !== step;
  });
  stepItems.forEach((item) => {
    const index = Number(item.dataset.stepItem);
    item.toggleAttribute("data-done", index < step);
    if (index === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  const last = step === steps.length - 1;
  back.hidden = step === 0;
  progress.textContent = `Etapa ${step + 1} de ${steps.length}`;
  next.innerHTML = last ? "Enviar cadastro" : `Continuar ${icon("arrow-r")}`;
  if (last) renderReview();
  if (focus) {
    $("[data-step-title]", steps[step]).focus({ preventScroll: true });
    showCard();
  }
}

// ao trocar de etapa no celular, o topo do cartão pode ter ficado acima da tela
function showCard() {
  const card = $("#cadastro");
  if (card.getBoundingClientRect().top < 0)
    card.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}

function focusField(field) {
  const [input] = inputsOf(field);
  input?.focus();
}

function renderReview() {
  const data = readData();
  const place = cep.city ? `${cep.city}/${cep.uf}` : "";
  const block = (title, to, rows) => `
    <section class="rounded-2xl bg-surface px-[18px] py-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <h4 class="text-[14px] font-bold text-navy">${title}</h4>
        <button class="rounded-md text-[13px] font-semibold text-accent hover:underline" type="button" data-edit="${to}" aria-label="Editar ${title.toLowerCase()}">Editar</button>
      </div>
      <dl class="grid gap-1.5 text-[14px]">
        ${rows
          .filter(([, value]) => value)
          .map(
            ([label, value]) =>
              `<div class="flex justify-between gap-4"><dt class="shrink-0 text-fg-2">${label}</dt><dd class="min-w-0 text-right font-semibold [overflow-wrap:anywhere]">${esc(value)}</dd></div>`,
          )
          .join("")}
      </dl>
    </section>`;
  const licensed = needsLicense(data.vehicle);
  review.innerHTML =
    block("Seus dados", 0, [
      ["Nome", data.name],
      ["CPF", fmtCpf(data.cpf)],
      ["Nascimento", data.birth],
      ["Celular", fmtPhone(data.phone)],
      ["E-mail", data.email],
    ]) +
    block("Veículo e região", 1, [
      ["Veículo", VEHICLES[data.vehicle]?.label],
      ["CNH", licensed ? data.cnh : ""],
      ["Placa", licensed ? fmtPlate(data.plate) : ""],
      [
        "Região",
        [place, "CEP " + fmtCep(data.cep)].filter(Boolean).join(" · "),
      ],
      ["Períodos", data.shifts.map((shift) => SHIFTS[shift]).join(", ")],
    ]);
}

function setCepInfo(text, state = "") {
  cepInfo.innerHTML = text
    ? (state === "ok" ? icon("pin", "size-4") : "") + esc(text)
    : "";
  if (state) cepInfo.dataset.state = state;
  else delete cepInfo.dataset.state;
}

async function checkCep() {
  const value = cepInput.value;
  const typed = digits(value);
  if (typed === cep.digits) return;
  cep = { digits: typed, city: "", uf: "", bairro: "", notFound: false };
  const request = ++cepRequest;
  setCepInfo("");
  if (!validCep(value)) return;
  setCepInfo("Consultando o CEP…");
  const result = await lookupCep(value);
  if (request !== cepRequest) return;
  if (result.notFound) {
    cep.notFound = true;
    setCepInfo("");
    setError("cep", result.error);
  } else if (result.error) {
    setCepInfo("Não foi possível mostrar a cidade agora. Você pode continuar.");
  } else {
    Object.assign(cep, {
      city: result.city,
      uf: result.uf,
      bairro: result.bairro,
    });
    setCepInfo(
      [result.bairro, `${result.city}/${result.uf}`].filter(Boolean).join(", "),
      "ok",
    );
    setError("cep", "");
  }
}

// máscaras: mantêm o cursor depois do mesmo número de dígitos
const MASKS = {
  cpf: fmtCpf,
  date: fmtDate,
  phone: fmtPhone,
  cep: fmtCep,
  digits: (value) => digits(value).slice(0, 11),
};

form.addEventListener("input", (event) => {
  const input = event.target;
  const mask = input.dataset.mask;
  if (mask === "plate") {
    input.value = fmtPlate(input.value);
  } else if (MASKS[mask]) {
    const caret = input.selectionStart ?? input.value.length;
    const before = digits(input.value.slice(0, caret)).length;
    const formatted = MASKS[mask](input.value);
    if (formatted !== input.value) {
      input.value = formatted;
      let position = 0;
      for (
        let seen = 0;
        position < formatted.length && seen < before;
        position++
      )
        if (/\d/.test(formatted[position])) seen++;
      input.setSelectionRange(position, position);
    }
  }
  if (input === cepInput) {
    if (hasError("cep")) setError("cep", "");
    if (digits(input.value).length === 8) safe("cep", checkCep);
    else if (digits(input.value) !== cep.digits) setCepInfo("");
  } else if (input.name && hasError(input.name)) {
    checkField(input.name);
  }
  // a data é conferida com o CPF: trocar o CPF reavalia a data já marcada
  if (input.name === "cpf" && hasError("birth")) checkField("birth");
});

form.addEventListener("change", (event) => {
  const { name } = event.target;
  if (name === "vehicle") {
    const show = needsLicense(event.target.value);
    license.hidden = !show;
    if (!show) ["cnh", "plate"].forEach((field) => setError(field, ""));
  }
  if (["vehicle", "shifts", "terms"].includes(name) && hasError(name))
    checkField(name);
});

// confere o campo ao sair dele, quando já foi preenchido
form.addEventListener("focusout", (event) => {
  const input = event.target;
  if (!STEP_FIELDS[step].includes(input.name)) return;
  if (["radio", "checkbox"].includes(input.type) || !input.value.trim()) return;
  if (input === cepInput) {
    safe("cep", checkCep);
    if (!validCep(input.value)) checkField("cep");
    return;
  }
  checkField(input.name);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = readData();
  // a etapa atual e as anteriores precisam estar válidas antes de avançar
  for (let index = 0; index <= step; index++) {
    const errors = validateStep(index, data);
    const fields = STEP_FIELDS[index];
    const first = fields.find((field) => errors[field]);
    if (!first) continue;
    if (index !== step) go(index);
    fields.forEach((field) => setError(field, errors[field] || ""));
    focusField(first);
    return;
  }
  if (step < steps.length - 1) go(step + 1);
  else finish(data);
});

back.addEventListener("click", () => go(step - 1));

review.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit]");
  if (edit) go(Number(edit.dataset.edit));
});

function resetForm() {
  form.reset();
  STEP_FIELDS.flat().forEach((field) => setError(field, ""));
  license.hidden = true;
  cep = { digits: "", city: "", uf: "", bairro: "", notFound: false };
  cepRequest++;
  setCepInfo("");
  review.replaceChildren();
}

// nada é enviado: os dados são descartados assim que a confirmação aparece
function finish(data) {
  $("[data-done-name]", done).textContent = firstName(data.name);
  resetForm();
  form.hidden = true;
  done.hidden = false;
  stepItems.forEach((item) => {
    item.setAttribute("data-done", "");
    item.removeAttribute("aria-current");
  });
  done.focus({ preventScroll: true });
  showCard();
}

$("#courierRestart").addEventListener("click", () => {
  done.hidden = true;
  form.hidden = false;
  go(0);
});

go(0, false);

safe("reveal", () => {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }),
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );
  $$(".reveal").forEach((element) => {
    const siblings = [...element.parentElement.children].filter((sibling) =>
      sibling.classList.contains("reveal"),
    );
    element.style.setProperty(
      "--rd",
      (Math.min(siblings.indexOf(element), 6) * 0.06).toFixed(2) + "s",
    );
    io.observe(element);
  });
});
