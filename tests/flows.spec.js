import { test, expect } from "@playwright/test";

const address = {
  logradouro: "Avenida de Teste",
  bairro: "Centro",
  localidade: "São Paulo",
  uf: "SP",
};
const errors = new WeakMap();

test.beforeEach(async ({ page }) => {
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
  await expect(page.locator("body")).toContainText(
    "compras, pagamentos e lacres são simulados",
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
  await expect(page.locator("#bagDrawer")).toContainText("Simular checkout");
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

test("checkout calcula frete antes do Pix e termina como simulação", async ({
  page,
}, testInfo) => {
  await openShop(page);
  await page.locator('[data-add="kit-whisky-classicos"]').first().click();
  await page.locator("#bagBtn").click();
  await expect(page.locator("#bagDrawer")).toContainText("Grátis");
  await page.locator("#goCheckout").click();
  await expect(page.locator("#checkoutContent")).toContainText(
    "Use dados fictícios",
  );
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
    "Simulação concluída!",
  );
  await expect(page.locator("#checkoutContent")).toContainText("Pix simulado");
  await expect(page.locator("#checkoutContent")).toContainText(
    "sem rastreamento real",
  );
  await expect(page.locator("#checkoutContent [data-verify-code]")).toHaveCount(
    2,
  );
  await page.screenshot({ path: testInfo.outputPath("checkout.png") });
  await page.locator("#checkoutContent [data-verify-code]").first().click();
  await expect(page.locator("#verifyResult")).toContainText(
    "Exemplo: lacre íntegro",
  );
  await expect(page.locator("#bagCount")).toHaveText("0");
});

test("CEP consultado não promete cobertura e falhas ficam explícitas", async ({
  page,
}) => {
  await openShop(page);
  await page.locator("#heroCep").fill("01310930");
  await page.locator("#heroCepForm button").click();
  await expect(page.locator("#heroCepInfo")).toContainText(
    "Cobertura e prazo não confirmados",
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

test("lacres e aviso à marca são explicitamente fictícios", async ({
  page,
}) => {
  await openShop(page);
  await page.locator('#sampleCodes [data-code="VS-7K2M-9QXA"]').click();
  await expect(page.locator("#verifyResult")).toContainText(
    "não comprova origem ou autenticidade",
  );
  await page.locator('#sampleCodes [data-code="VS-4HZP-1LCE"]').click();
  await expect(page.locator("#verifyResult")).toContainText(
    "Exemplo: lacre aberto",
  );
  await page.locator('#sampleCodes [data-code="VS-9XRT-0NDW"]').click();
  await expect(page.locator("#verifyResult")).toContainText(
    "Exemplo não encontrado",
  );
  await page.locator("[data-report]").click();
  await expect(page.locator("#toast")).toContainText(
    "Nenhuma mensagem foi enviada",
  );
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
  await page.getByRole("link", { name: "Ver na demonstração" }).click();
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
  await page.locator("#clearDemoData").click();
  await expect(page.locator("#clearDataStatus")).toContainText("apagados");
  expect(await page.evaluate(() => localStorage.getItem("vsd:bag"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("outro-app"))).toBe(
    "preservar",
  );
});
