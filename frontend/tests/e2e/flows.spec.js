import { test, expect } from "@playwright/test";

const address = {
  logradouro: "Avenida de Teste",
  bairro: "Centro",
  localidade: "São Paulo",
  uf: "SP",
};
const errors = new WeakMap();
const API = "http://localhost:5021/api/**";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "content-type",
};

test.beforeEach(async ({ page }) => {
  // Sem a API no ar (padrão dos testes), o site usa os lacres guardados nele mesmo.
  await page.route(API, (route) => route.abort("connectionrefused"));
  errors.set(page, []);
  page.on("pageerror", (error) => errors.get(page).push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("[VeriSeal"))
      errors.get(page).push(message.text());
  });
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  await page.route("https://viacep.com.br/**", (route) =>
    route.fulfill({ json: address }),
  );
  await page.addInitScript(() => localStorage.setItem("vsd:age", "true"));
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page), "Não deve haver erros de execução").toEqual([]);
});

async function openShop(page) {
  await page.goto("/");
  await expect(page.locator("#productGrid [data-card]").first()).toBeVisible();
}

test("busca, categorias e sacola persistem sem alterar o layout responsivo", async ({
  page,
}, testInfo) => {
  await openShop(page);
  await expect(page.locator("body")).not.toContainText(
    /demonstra|simulad|fictíci/i,
  );
  await page.locator("#catalogSearch").fill("tanqueray");
  await expect(page.locator("#productGrid [data-card]")).toHaveCount(3);
  await page.locator("#catalogSearch").fill("produto inexistente");
  await expect(page.locator("#emptyState")).toBeVisible();
  await page.locator("#clearFilters").click();
  await page.locator('#catFilter [data-chip="gin"]').click();
  await expect(page.locator("#resultCount")).toContainText("em Gin");
  await page.locator('#productGrid [data-add="tanqueray"]').click();
  await expect(page.locator("#bagCount")).toHaveText("1");
  await page.reload();
  await expect(page.locator("#bagCount")).toHaveText("1");
  await page.locator("#bagBtn").click();
  await expect(page.locator("#bagDrawer")).toContainText("Finalizar pedido");
  await page.keyboard.press("Escape");
  await expect(page.locator("#bagDrawer")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("catalogo.png"),
    fullPage: false,
  });
});

test("checkout calcula frete antes do Pix e confirma o pedido", async ({
  page,
}, testInfo) => {
  await openShop(page);
  await page.locator('[data-add="kit-whisky-classicos"]').first().click();
  await page.locator("#bagBtn").click();
  await expect(page.locator("#bagDrawer")).toContainText("Grátis");
  await page.locator("#goCheckout").click();
  await expect(page.locator("#checkoutContent h2")).toHaveText("Entrega");
  await page.locator("#coName").fill("Pessoa de Teste");
  await page.locator("#coPhone").fill("11999999999");
  await page.locator("#coCep").fill("01310930");
  await expect(page.locator("#coStreet")).toHaveValue("Avenida de Teste");
  await page.locator("#coNumber").fill("123");
  await page.locator('#coForm button[type="submit"]').click();
  await expect(page.locator("#checkoutContent h2")).toHaveText("Pagamento");
  await page.locator('#coForm button[type="submit"]').click();
  await expect(page.locator("#checkoutContent")).toContainText("199,40");
  await expect(page.locator("#checkoutContent")).toContainText("Grátis");
  await page.locator("#coConfirm").click();
  await expect(page.locator("#coAgeErr")).toBeVisible();
  await page.locator("#coAge").check();
  await page.locator("#coConfirm").click();
  await expect(page.locator("#checkoutContent h2")).toHaveText(
    "Pedido confirmado!",
  );
  await expect(page.locator("#checkoutContent")).toContainText(
    "Pix · você economizou",
  );
  await expect(page.locator("#checkoutContent [data-verify-code]")).toHaveCount(
    2,
  );
  await page.screenshot({ path: testInfo.outputPath("checkout.png") });
  await page.locator("#checkoutContent [data-verify-code]").first().click();
  await expect(page.locator("#verifyResult")).toContainText("Lacre íntegro");
  await expect(page.locator("#bagCount")).toHaveText("0");
});

test("CEP consultado mostra o prazo e falhas ficam explícitas", async ({
  page,
}) => {
  await openShop(page);
  await page.locator("#heroCep").fill("01310930");
  await page.locator("#heroCepForm button").click();
  await expect(page.locator("#heroCepInfo")).toContainText(
    "Entregamos em Centro, São Paulo/SP",
  );
  await page.route("https://viacep.com.br/**", (route) =>
    route.fulfill({ json: { erro: true } }),
  );
  await page.locator("#heroCep").fill("99999888");
  await page.locator("#heroCepForm button").click();
  await expect(page.locator("#heroCepInfo")).toContainText(
    "Não encontramos esse CEP",
  );
});

test("verificação mostra lacre íntegro, violado e não encontrado", async ({
  page,
}) => {
  await openShop(page);
  const verify = async (code) => {
    await page.locator("#verifyInput").fill(code);
    await page.locator('#verifyForm button[type="submit"]').click();
  };
  await verify("VS-7K2M-9QXA");
  await expect(page.locator("#verifyResult")).toContainText("Lacre íntegro");
  await verify("VS-4HZP-1LCE");
  await expect(page.locator("#verifyResult")).toContainText("Lacre violado");
  await verify("VS-9XRT-0NDW");
  await expect(page.locator("#verifyResult")).toContainText(
    "Lacre não encontrado",
  );
  await page.locator("[data-report]").click();
  await expect(page.locator("#toast")).toContainText(
    "Não foi possível enviar o aviso",
  );
});

test("verificação consulta o banco pela API e grava o aviso à marca", async ({
  page,
}) => {
  const calls = [];
  await page.route(API, async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;
    calls.push({ call: `${req.method()} ${path}`, body: req.postDataJSON() });
    if (path === "/api/lacres/VS-NOVO-2026/verificacoes")
      return route.fulfill({
        headers: CORS,
        json: {
          codigo: "VS-NOVO-2026",
          produtoId: "tanqueray",
          pedidoId: null,
          lote: "L26-1113",
          fabricadoEm: "2026-11-01",
          status: "ok",
          enviadoEm: null,
          abertoEm: null,
          verificacoes: 3,
        },
      });
    if (path === "/api/avisos")
      return route.fulfill({ status: 201, headers: CORS, json: { id: 1 } });
    return route.fulfill({
      status: 404,
      headers: CORS,
      json: "Lacre não encontrado.",
    });
  });
  await openShop(page);
  const verify = async (code) => {
    await page.locator("#verifyInput").fill(code);
    await page.locator('#verifyForm button[type="submit"]').click();
  };
  await verify("VS-NOVO-2026");
  await expect(page.locator("#verifyResult")).toContainText("Lacre íntegro");
  await expect(page.locator("#verifyResult")).toContainText("Tanqueray");
  await expect(page.locator("#verifyResult")).toContainText("L26-1113");
  await expect(page.locator("#verifyResult")).toContainText("01/11/2026");
  // Lacre que saiu do banco: o banco decide, mesmo que o site tenha um registro antigo.
  await verify("VS-7K2M-9QXA");
  await expect(page.locator("#verifyResult")).toContainText(
    "Lacre não encontrado",
  );
  await page.locator("[data-report]").click();
  await expect(page.locator("#toast")).toContainText("Aviso enviado");
  await expect(page.locator("[data-report]")).toHaveText("Aviso enviado");
  expect(calls.map((c) => c.call)).toEqual([
    "POST /api/lacres/VS-NOVO-2026/verificacoes",
    "POST /api/lacres/VS-7K2M-9QXA/verificacoes",
    "POST /api/avisos",
  ]);
  expect(calls[0].body).toEqual({ origem: "codigo" });
  expect(calls[2].body).toEqual({
    lacreCodigo: "VS-7K2M-9QXA",
    motivo: "nao_encontrado",
  });
});

test("pedido confirmado vai inteiro para o banco e usa os lacres gerados pela API", async ({
  page,
}) => {
  const calls = [];
  // lacres que a API em C# cria para o kit (uma garrafa de cada)
  const lacres = [
    { codigo: "VS-KT11-AA22", produtoId: "jw-black" },
    { codigo: "VS-KT33-BB44", produtoId: "jack-7" },
  ].map((l) => ({
    ...l,
    pedidoId: 9,
    lote: "L26-1115",
    fabricadoEm: "2026-10-02",
    status: "ok",
    enviadoEm: null,
    abertoEm: null,
    verificacoes: 0,
  }));
  await page.route(API, async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;
    const body = req.postDataJSON();
    calls.push({ call: `${req.method()} ${path}`, body });
    if (path === "/api/pedidos")
      return route.fulfill({
        status: 201,
        headers: CORS,
        json: { id: 9, numero: "52741", status: "recebido", lacres },
      });
    return route.fulfill({ status: 404, headers: CORS, json: "" });
  });
  await openShop(page);
  await page.locator('[data-add="kit-whisky-classicos"]').first().click();
  await page.locator("#bagBtn").click();
  await page.locator("#goCheckout").click();
  await page.locator("#coName").fill("Pessoa de Teste");
  await page.locator("#coPhone").fill("11999999999");
  await page.locator("#coCep").fill("01310930");
  await expect(page.locator("#coStreet")).toHaveValue("Avenida de Teste");
  await page.locator("#coNumber").fill("123");
  await page.locator('#coForm button[type="submit"]').click();
  await page.locator('#coForm button[type="submit"]').click();
  await page.locator("#coAge").check();
  await page.locator("#coConfirm").click();
  await expect(page.locator("#checkoutContent h2")).toHaveText(
    "Pedido confirmado!",
  );
  await expect(page.locator("#checkoutContent")).toContainText("#52741");
  const shown = await page
    .locator("#checkoutContent [data-verify-code]")
    .evaluateAll((els) => els.map((el) => el.dataset.verifyCode));
  expect(shown).toEqual(["VS-KT11-AA22", "VS-KT33-BB44"]);
  expect(calls.map((c) => c.call)).toEqual(["POST /api/pedidos"]);
  expect(calls[0].body).toEqual({
    cliente: { nome: "Pessoa de Teste", telefone: "(11) 99999-9999" },
    endereco: {
      cep: "01310-930",
      rua: "Avenida de Teste",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      cidade: "São Paulo",
      uf: "SP",
    },
    pagamento: "pix",
    parcelas: 1,
    trocoPara: null,
    agendadoPara: calls[0].body.agendadoPara,
    presente: false,
    mensagemPresente: null,
    maioridadeConfirmada: true,
    itens: [{ produtoId: "kit-whisky-classicos", quantidade: 1 }],
  });
  // o lacre recém-criado já aparece na verificação, ainda "antes do envio"
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("vsd:demo:seals")),
  );
  expect(saved["VS-KT11-AA22"]).toMatchObject({
    product: "jw-black",
    lot: "L26-1115",
    order: "52741",
  });
});

test("página de produto abre direto e retorna ao detalhe na loja", async ({
  page,
}) => {
  await page.goto("/produtos/tanqueray/");
  await expect(page.locator("h1")).toContainText("Tanqueray");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Tanqueray/,
  );
  await page.getByRole("link", { name: "Comprar agora" }).click();
  await expect(page.locator("#productSheet")).toBeVisible();
  await expect(page.locator("#productSheet")).toContainText("Tanqueray");
});

test("políticas permitem apagar só os dados locais do projeto", async ({
  page,
}) => {
  await page.goto("/sobre.html");
  await page.evaluate(() => {
    localStorage.setItem("vsd:bag", "{}");
    localStorage.setItem("outro-app", "preservar");
  });
  await page.locator("#clearLocalData").click();
  await expect(page.locator("#clearDataStatus")).toContainText("apagados");
  expect(await page.evaluate(() => localStorage.getItem("vsd:bag"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("outro-app"))).toBe(
    "preservar",
  );
});
