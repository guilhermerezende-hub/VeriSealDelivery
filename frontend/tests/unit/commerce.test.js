import test from "node:test";
import assert from "node:assert/strict";
import {
  bagSubtotal,
  inst,
  pix,
  restoreBag,
  shipping,
  totals,
} from "../../js/commerce.js";
import { createStore } from "../../js/storage.js";

test("frete usa o subtotal antes do Pix, inclusive no limite de R$ 199", () => {
  assert.equal(shipping(0), 0);
  assert.equal(shipping(198.99), 9.9);
  assert.equal(shipping(199), 0);
  assert.deepEqual(totals(199, "pix"), {
    sub: 199,
    disc: 9.95,
    ship: 0,
    total: 189.05,
  });
  assert.deepEqual(totals(198.99, "pix"), {
    sub: 198.99,
    disc: 9.95,
    ship: 9.9,
    total: 198.94,
  });
  assert.equal(totals(199, "card").total, 199);
  assert.equal(totals(199, "cod").total, 199);
});

test("totais em centavos evitam diferenças entre sacola e checkout", () => {
  const catalog = { a: { price: 0.1 }, b: { price: 0.2 } };
  assert.equal(
    bagSubtotal(
      new Map([
        ["a", 1],
        ["b", 1],
      ]),
      catalog,
    ),
    0.3,
  );
  assert.equal(pix(129.9), 123.4);
  assert.equal(totals(129.9, "pix").total, 133.3);
  assert.equal(pix(209.9), totals(209.9, "pix").total);
});

test("restauração ignora valores inválidos e limita quantidades antigas", () => {
  const catalog = { a: {}, b: {}, c: {}, d: {}, e: {} };
  assert.deepEqual(
    [
      ...restoreBag(
        { a: 100, b: "2", c: 1.5, d: -1, e: 2, unknown: 3 },
        catalog,
      ),
    ],
    [
      ["a", 12],
      ["e", 2],
    ],
  );
  for (const invalid of [null, 0, "corrompido", [], false])
    assert.equal(restoreBag(invalid, catalog).size, 0);
  assert.equal(restoreBag({ toString: 1 }, catalog).size, 0);
});

test("parcelamento respeita o mínimo e o máximo da demonstração", () => {
  assert.equal(inst(59.99), null);
  assert.deepEqual(inst(60), { n: 2, v: 30 });
  assert.deepEqual(inst(600), { n: 6, v: 100 });
});

test("armazenamento persiste dados e tolera JSON inválido ou bloqueio do navegador", () => {
  const values = new Map();
  const store = createStore(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }));
  store.set("bag", { a: 2 });
  assert.deepEqual(store.get("bag", {}), { a: 2 });
  values.set("vsd:bag", "{invalid");
  assert.deepEqual(store.get("bag", {}), {});
  const blocked = createStore(() => {
    throw new Error("Storage unavailable");
  });
  assert.equal(blocked.set("age", true), false);
  assert.equal(blocked.get("age", false), false);
});
