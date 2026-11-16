export const PIX_OFF = 0.05;
export const PIX_LABEL = new Intl.NumberFormat("pt-BR", {
  style: "percent",
}).format(PIX_OFF);
export const FREE_SHIP = 199;
export const SHIP_FEE = 9.9;
export const MAX_QTY = 12;
export const MAX_INST = 6;
export const MIN_INST = 30;
export const OPEN_H = 8;
export const CLOSE_H = 3;
export const SITE_HOST = "veriseal.example";
export const ETA = "30–50 min";

// API em C# que conversa com o banco MySQL. No computador ela roda em localhost:5021;
// na hospedagem, "npm run dist -- --api <endereço>" grava o endereço público abaixo
// na cópia que vai para o servidor (pasta dist/).
export const API_PUBLIC_URL = "";
export const API_LOCAL_URL = "http://localhost:5021/api";

export function apiUrl(hostname = globalThis.location?.hostname ?? "") {
  const local =
    !hostname || hostname === "localhost" || hostname === "127.0.0.1";
  return local ? API_LOCAL_URL : API_PUBLIC_URL;
}

export const COMPANY = Object.freeze({
  legalName: "",
  cnpj: "",
  email: "",
  whatsapp: "",
});

export function storeOpen(date = new Date()) {
  return date.getHours() >= OPEN_H || date.getHours() < CLOSE_H;
}
