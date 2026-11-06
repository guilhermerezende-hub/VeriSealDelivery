const formPanels = [...document.querySelectorAll("[data-auth-form]")];
const modeButtons = document.querySelectorAll("[data-auth-mode]");
const title = document.querySelector("#authTitle");
const description = document.querySelector("#authDescription");
const eyebrow = document.querySelector("#authEyebrow");
const notice = document.querySelector("#authNotice");

const copy = {
  login: {
    eyebrow: "Sua conta",
    title: "Bem-vindo de volta",
    description: "Entre com seus dados para continuar.",
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

  if (restoreFocus) document.querySelector(content.focus)?.focus();
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
    button.setAttribute("aria-label", `${reveal ? "Ocultar" : "Mostrar"} senha`);
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
