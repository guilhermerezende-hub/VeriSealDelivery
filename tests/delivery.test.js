import test from "node:test";
import assert from "node:assert/strict";
import {
  deliveryMsg,
  fmtCep,
  lookupCep,
  restoreAddress,
  validCep,
} from "../js/delivery.js";

test("CEP aceita somente formatos válidos e não consulta entradas incompletas", async () => {
  assert.equal(fmtCep("01310930"), "01310-930");
  for (const value of [
    "00000000",
    "11111-111",
    "123",
    "013109300",
    "abc01310930",
  ]) {
    assert.equal(validCep(value), false);
    assert.ok(
      (
        await lookupCep(value, () => {
          throw new Error("Não deveria consultar");
        })
      ).error,
    );
  }
});

test("endereço encontrado não se transforma em promessa de cobertura ou prazo", async () => {
  const address = await lookupCep("01310-930", async (url) => {
    assert.equal(url, "https://viacep.com.br/ws/01310930/json/");
    return {
      ok: true,
      json: async () => ({
        localidade: "São Paulo",
        uf: "SP",
        bairro: "Bela Vista",
        logradouro: "Avenida Paulista",
      }),
    };
  });
  assert.equal(address.city, "São Paulo");
  assert.equal(address.coverage, "unconfirmed");
  assert.equal(address.eta, undefined);
  assert.match(deliveryMsg(address), /Cobertura e prazo não confirmados/);
});

test("CEP inexistente, falha de rede, HTTP e resposta malformada não geram endereço fictício", async () => {
  const responses = [
    async () => ({ ok: true, json: async () => ({ erro: true }) }),
    async () => {
      throw new Error("Offline");
    },
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => ({}) }),
  ];
  for (const fetcher of responses) {
    const result = await lookupCep("01310-930", fetcher);
    assert.ok(result.error);
    assert.equal(result.cep, undefined);
    assert.equal(result.eta, undefined);
  }
});

test("consulta lenta é cancelada", async () => {
  const result = await lookupCep(
    "01310-930",
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Aborted")), {
          once: true,
        });
      }),
    5,
  );
  assert.match(result.error, /Não foi possível consultar/);
});

test("endereços antigos perdem o prazo inventado ao serem restaurados", () => {
  const restored = restoreAddress({
    cep: "01310-930",
    city: "São Paulo",
    eta: [25, 40],
    offline: true,
  });
  assert.equal(restored.eta, undefined);
  assert.equal(restored.offline, undefined);
  assert.equal(restoreAddress({ cep: "00000-000" }), null);
});
