import {
  FREE_SHIP,
  SHIP_FEE,
  PIX_OFF,
  MAX_QTY,
  MAX_INST,
  MIN_INST,
} from "./config.js";

export const cents = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100);
export const roundMoney = (value) => cents(value) / 100;

// O frete considera o subtotal dos produtos ANTES do desconto da forma de pagamento.
export function shipping(subtotal) {
  const amount = cents(subtotal);
  return amount <= 0 || amount >= cents(FREE_SHIP) ? 0 : SHIP_FEE;
}

export function totals(subtotal, payment = "card") {
  const sub = cents(subtotal);
  const disc = payment === "pix" ? Math.round(sub * PIX_OFF) : 0;
  const ship = cents(shipping(subtotal));
  return {
    sub: sub / 100,
    disc: disc / 100,
    ship: ship / 100,
    total: (sub - disc + ship) / 100,
  };
}

export const pix = (value) =>
  (cents(value) - Math.round(cents(value) * PIX_OFF)) / 100;

export function inst(value) {
  const n = Math.min(MAX_INST, Math.floor(cents(value) / cents(MIN_INST)));
  return n >= 2 ? { n, v: roundMoney(value / n) } : null;
}

export function restoreBag(saved, products) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved))
    return new Map();
  return new Map(
    Object.entries(saved)
      .filter(
        ([id, quantity]) =>
          Object.hasOwn(products, id) &&
          Number.isInteger(quantity) &&
          quantity > 0,
      )
      .map(([id, quantity]) => [id, Math.min(quantity, MAX_QTY)]),
  );
}

export function bagSubtotal(bag, products) {
  return (
    [...bag].reduce(
      (sum, [id, quantity]) => sum + cents(products[id].price) * quantity,
      0,
    ) / 100
  );
}
