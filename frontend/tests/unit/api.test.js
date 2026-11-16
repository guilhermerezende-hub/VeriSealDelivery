import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, OFFLINE_MESSAGE, api, request } from "../../js/api.js";

const BASE = "http://api.teste/api";

function fakeFetch(t, handler) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({
      url,
      method: init.method,
      body: init.body ? JSON.parse(init.body) : undefined,
    });
    if (init.headers?.Authorization)
      calls.at(-1).authorization = init.headers.Authorization;
    return handler(url, init);
  };
  t.after(() => {
    globalThis.fetch = original;
  });
  return calls;
}
const json = (status, data) =>
  new Response(data === undefined ? null : JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("envia e recebe JSON e devolve null no 204", async (t) => {
  const calls = fakeFetch(t, (url, init) =>
    init.method === "DELETE"
      ? new Response(null, { status: 204 })
      : json(201, { id: 7 }),
  );
  assert.deepEqual(
    await request("/clientes", {
      method: "POST",
      body: { nome: "Ana", telefone: "11987654321" },
      baseUrl: BASE,
    }),
    { id: 7 },
  );
  assert.equal(
    await request("/clientes/7", { method: "DELETE", baseUrl: BASE }),
    null,
  );
  assert.deepEqual(calls[0], {
    url: `${BASE}/clientes`,
    method: "POST",
    body: { nome: "Ana", telefone: "11987654321" },
  });
});

test("mensagens de erro da API em C# chegam à tela", async (t) => {
  fakeFetch(t, (url) =>
    url.endsWith("/409")
      ? json(409, "Já existe um lacre com esse código.")
      : url.endsWith("/400")
        ? json(400, {
            title: "One or more validation errors occurred.",
            errors: { nome: ["Nome inválido."] },
          })
        : json(500, {
            title: "An error occurred while processing your request.",
          }),
  );
  await assert.rejects(request("/409", { baseUrl: BASE }), {
    name: "ApiError",
    status: 409,
    message: "Já existe um lacre com esse código.",
  });
  await assert.rejects(request("/400", { baseUrl: BASE }), {
    status: 400,
    message: "Nome inválido.",
  });
  await assert.rejects(request("/500", { baseUrl: BASE }), (err) => {
    assert.equal(err.status, 500);
    assert.match(err.message, /servidor/);
    return true;
  });
});

test("sem resposta da API o erro tem status 0", async (t) => {
  fakeFetch(t, () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(request("/lacres", { baseUrl: BASE }), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 0);
    assert.equal(err.message, OFFLINE_MESSAGE);
    return true;
  });
  await assert.rejects(request("/lacres", { baseUrl: "" }), { status: 0 });
});

test("rotas do CRUD e da verificação", async (t) => {
  const calls = fakeFetch(t, () => json(200, {}));
  const opts = { baseUrl: BASE };
  await api.listSeals(opts);
  await api.updateSeal("VS-7K2M-9QXA", { lote: "L1" }, opts);
  await api.checkSeal("VS-7K2M-9QXA", "nfc", opts);
  await api.reportSeal("VS-9XRT-0NDW", "nao_encontrado", opts);
  await api.updateClient(3, { nome: "Ana" }, opts);
  assert.deepEqual(
    calls.map((c) => `${c.method} ${c.url.replace(BASE, "")}`),
    [
      "GET /lacres",
      "PUT /lacres/VS-7K2M-9QXA",
      "POST /lacres/VS-7K2M-9QXA/verificacoes",
      "POST /avisos",
      "PUT /clientes/3",
    ],
  );
  assert.deepEqual(calls[2].body, { origem: "nfc" });
  assert.deepEqual(calls[3].body, {
    lacreCodigo: "VS-9XRT-0NDW",
    motivo: "nao_encontrado",
  });
});

test("rotas do painel levam o token do administrador", async (t) => {
  const calls = fakeFetch(t, () => json(200, {}));
  const opts = { baseUrl: BASE, token: "abc123" };
  await api.adminLogin("admin@veriseal.com.br", "segredo", { baseUrl: BASE });
  await api.listOrders(opts);
  await api.updateOrderStatus(7, "em_rota", opts);
  await api.adminLogout(opts);
  await api.createOrder({ itens: [] }, { baseUrl: BASE });
  assert.deepEqual(
    calls.map(
      (c) => `${c.method} ${c.url.replace(BASE, "")} ${c.authorization || "-"}`,
    ),
    [
      "POST /admin/login -",
      "GET /pedidos Bearer abc123",
      "PUT /pedidos/7/status Bearer abc123",
      "POST /admin/sair Bearer abc123",
      "POST /pedidos -",
    ],
  );
  assert.deepEqual(calls[0].body, {
    email: "admin@veriseal.com.br",
    senha: "segredo",
  });
  assert.deepEqual(calls[2].body, { status: "em_rota" });
});
