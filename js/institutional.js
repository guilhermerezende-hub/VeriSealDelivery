import { COMPANY } from "./config.js";

const info = document.querySelector("#companyInfo");
if (COMPANY.legalName) {
  info.textContent =
    COMPANY.legalName + (COMPANY.cnpj ? ` · CNPJ: ${COMPANY.cnpj}` : "");
  info.hidden = false;
}
const contacts = [];
if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(COMPANY.email))
  contacts.push(["E-mail: " + COMPANY.email, "mailto:" + COMPANY.email]);
if (/^\d{10,15}$/.test(COMPANY.whatsapp))
  contacts.push([
    "WhatsApp: +" + COMPANY.whatsapp,
    "https://wa.me/" + COMPANY.whatsapp,
  ]);
if (contacts.length) {
  const contact = document.querySelector("#companyContact");
  contact.replaceChildren();
  contacts.forEach(([label, href]) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    contact.append(link, document.createElement("br"));
  });
}

document.querySelector("#clearLocalData").addEventListener("click", () => {
  const status = document.querySelector("#clearDataStatus");
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("vsd:"))
      .forEach((key) => localStorage.removeItem(key));
    status.textContent =
      "Seus dados foram apagados deste navegador. Atualize outras abas abertas da loja.";
  } catch {
    status.textContent =
      "O navegador bloqueou o acesso ao armazenamento. Limpe os dados do site nas configurações do navegador.";
  }
});
