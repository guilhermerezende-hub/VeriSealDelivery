const formPanels = [...document.querySelectorAll("[data-auth-form]")];
const modeButtons = document.querySelectorAll("[data-auth-mode]");
const title = document.querySelector("#authTitle");
const description = document.querySelector("#authDescription");
const eyebrow = document.querySelector("#authEyebrow");
const notice = document.querySelector("#authNotice");
const visualPanel = document.querySelector(".login-visual");

if (
  visualPanel &&
  window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  ).matches
) {
  visualPanel.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    const bounds = visualPanel.getBoundingClientRect();
    visualPanel.style.setProperty(
      "--cursor-x",
      `${event.clientX - bounds.left}px`,
    );
    visualPanel.style.setProperty(
      "--cursor-y",
      `${event.clientY - bounds.top}px`,
    );
    visualPanel.classList.add("is-cursor-active");
  });

  visualPanel.addEventListener("pointerleave", () => {
    visualPanel.classList.remove("is-cursor-active");
  });
}

const courier =
  new URLSearchParams(location.search).get("perfil") === "entregador";

if (courier) {
  document.title = "Entrar | Entregadores VeriSeal Delivery";
  document.querySelector("#visualTitle").innerHTML =
    'Suas entregas<br class="max-sm:hidden" /> começam aqui.';
  document.querySelector("#visualText").textContent =
    "Acompanhe seu cadastro, seus horários e as entregas da sua região.";
  const backLink = document.querySelector("#backLink");
  backLink.href = "entregadores.html";
  backLink.querySelector("span").textContent = "Voltar à área de entregadores";
  document.querySelector("#registerPrompt").innerHTML =
    'Ainda não é entregador? <a class="font-bold text-accent hover:text-accent-hover" href="entregadores.html#cadastro">Quero me cadastrar</a>';
}

const copy = {
  login: {
    eyebrow: courier ? "Portal do entregador" : "Sua conta",
    title: "Bem-vindo de volta",
    description: courier
      ? "Entre para acompanhar seu cadastro e suas entregas."
      : "Entre com seus dados para continuar.",
    focus: "#loginEmail",
  },
  register: {
    eyebrow: "Novo por aqui?",
    title: "Crie sua conta",
    description: "Preencha seus dados para começar.",
    focus: "#registerName",
  },
  recover: {
    eyebrow: "Recuperação de acesso",
    title: "Esqueceu sua senha?",
    description: "Informe seu e-mail para continuar.",
    focus: "#recoverEmail",
  },
};

function showMode(mode, restoreFocus = true) {
  const content = copy[mode];
  if (!content) return;

  formPanels.forEach((form) => {
    const active = form.dataset.authForm === mode;
    form.classList.toggle("hidden", !active);
    form.setAttribute("aria-hidden", String(!active));
  });

  eyebrow.textContent = content.eyebrow;
  title.textContent = content.title;
  description.textContent = content.description;
  notice.hidden = true;

  if (restoreFocus) {
    [eyebrow, title, description].forEach((element) => {
      element.classList.remove("is-mode-entering");
    });

    requestAnimationFrame(() => {
      [eyebrow, title, description].forEach((element) => {
        element.classList.add("is-mode-entering");
      });
      document.querySelector(content.focus)?.focus();
    });
  }
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => showMode(button.dataset.authMode));
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;

    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Ocultar" : "Mostrar";
    button.setAttribute(
      "aria-label",
      `${reveal ? "Ocultar" : "Mostrar"} senha`,
    );
    button.setAttribute("aria-pressed", String(reveal));
  });
});

formPanels.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    notice.hidden = false;
  });
});

showMode("login", false);
