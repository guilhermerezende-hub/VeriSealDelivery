// Regras da demonstração. A operação real depende de integrações de servidor.
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
export const SITE_HOST = "demo.veriseal.example";
export const DEMO_NOTICE =
  "Demonstração: nenhum pedido, pagamento ou envio real é realizado.";

// Preencher somente com informações confirmadas pelo responsável pelo projeto.
export const COMPANY = Object.freeze({
  legalName: "",
  cnpj: "",
  email: "",
  whatsapp: "",
});

export function storeOpen(date = new Date()) {
  return date.getHours() >= OPEN_H || date.getHours() < CLOSE_H;
}
