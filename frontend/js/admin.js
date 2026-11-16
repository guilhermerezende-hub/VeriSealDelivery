// Login do administrador (admin.html). A API confere e-mail e senha no banco
// (tabela administradores) e devolve um token, guardado neste navegador.
// Com ele o painel (painel.html) consegue ler e mudar pedidos, lacres e clientes.
import { api, adminSession } from "./api.js";

const form = document.querySelector("#adminLogin");
const errorBox = document.querySelector("#adminError");
const notice = document.querySelector("#adminNotice");
const submitBtn = form.querySelector('button[type="submit"]');
const params = new URLSearchParams(location.search);

function showError(text) {
  errorBox.textContent = text;
  errorBox.hidden = !text;
}

// Já entrou antes neste navegador? Confere se o login ainda vale e segue para o painel.
const saved = adminSession.get();
if (saved)
  api.adminMe({ token: saved.token }).then(
    () => location.replace("painel.html"),
    (err) => {
      if (err.status === 401) adminSession.clear();
    },
  );

if (params.has("saiu")) {
  notice.textContent = "Você saiu do painel. Até a próxima!";
  notice.hidden = false;
} else if (params.has("expirou"))
  showError("Sua sessão terminou. Entre de novo para continuar.");

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = form.elements.email.value.trim();
  const senha = form.elements.senha.value;
  if (!email || !senha) {
    showError("Informe o e-mail e a senha.");
    (email ? form.elements.senha : form.elements.email).focus();
    return;
  }

  showError("");
  notice.hidden = true;
  const label = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando…";
  try {
    adminSession.set(await api.adminLogin(email, senha));
    location.replace("painel.html");
  } catch (err) {
    showError(err.message);
    form.elements.senha.select();
    submitBtn.disabled = false;
    submitBtn.innerHTML = label;
  }
});

form.elements.email.focus();
