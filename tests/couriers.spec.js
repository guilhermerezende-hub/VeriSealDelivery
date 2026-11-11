import { test, expect } from "@playwright/test";

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
  await page.route("https://viacep.com.br/ws/12345678/json/", (route) =>
    route.fulfill({ json: { erro: true } }),
  );
  await page.route("https://viacep.com.br/ws/30140071/json/", (route) =>
    route.fulfill({
      json: { localidade: "Belo Horizonte", uf: "MG", bairro: "Funcionários" },
    }),
  );
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page), "Não deve haver erros de execução").toEqual([]);
});

test("cadastro de entregador valida cada etapa e descarta os dados no fim", async ({
  page,
}) => {
  await page.goto("/entregadores.html");
  await expect(page.locator("h1")).toHaveText(
    "Entregue com a VeriSeal Delivery",
  );
  await expect(page.locator("body")).toContainText(
    "o cadastro de entregadores é simulado",
  );
  const next = page.locator("#courierNext");

  await next.click();
  await expect(page.locator("#cName-err")).toBeVisible();
  await expect(page.locator("#cName")).toBeFocused();
  await expect(page.locator("#cName")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#cName").fill("Maria Souza");
  await page.locator("#cCpf").pressSequentially("52998224725");
  await expect(page.locator("#cCpf")).toHaveValue("529.982.247-25");
  await page.locator("#cBirth").pressSequentially("15042012");
  await page.locator("#cPhone").pressSequentially("31998765432");
  await expect(page.locator("#cPhone")).toHaveValue("(31) 99876-5432");
  await page.locator("#cEmail").fill("maria@exemplo.com");
  await next.click();
  await expect(page.locator("#cBirth-err")).toContainText("18 anos");
  await page.locator("#cBirth").fill("15/04/1995");
  await expect(page.locator("#cBirth-err")).toBeHidden();
  await next.click();

  await expect(page.locator('[data-step="1"]')).toBeVisible();
  await expect(page.locator('[data-step-item="1"]')).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.locator("#licenseFields")).toBeHidden();
  await page.locator('label:has(input[value="moto"])').click();
  await expect(page.locator("#licenseFields")).toBeVisible();
  await page.locator("#cCep").fill("12345678");
  await expect(page.locator("#cCep-err")).toContainText("Não encontramos");
  await page.locator("#cCep").fill("30140071");
  await expect(page.locator("#cCep")).toHaveValue("30140-071");
  await expect(page.locator("#cCep-info")).toHaveText(
    "Funcionários, Belo Horizonte/MG",
  );
  await page.locator('label:has(input[value="noite"])').click();
  await next.click();
  await expect(page.locator("#cCnh-err")).toBeVisible();
  await expect(page.locator("#cPlate-err")).toBeVisible();
  await page.locator("#cCnh").fill("12345678901");
  await page.locator("#cPlate").fill("abc-1d23");
  await expect(page.locator("#cPlate")).toHaveValue("ABC1D23");
  await next.click();

  const review = page.locator("#courierReview");
  for (const text of ["Maria Souza", "Moto", "ABC1D23", "Belo Horizonte/MG"])
    await expect(review).toContainText(text);
  await expect(next).toHaveText("Enviar cadastro");
  await next.click();
  await expect(page.locator("#cTerms-err")).toBeVisible();
  await page.locator("#cTerms").check();
  await next.click();

  await expect(page.locator("#courierDone")).toBeVisible();
  await expect(page.locator("#doneTitle")).toHaveText("Tudo certo, Maria!");
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toMatch(/Maria|52998224725|529\.982/);
  await page.locator("#courierRestart").click();
  await expect(page.locator('[data-step="0"]')).toBeVisible();
  await expect(page.locator("#cName")).toHaveValue("");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("a loja e o login levam à área de entregadores", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("vsd:age", "true"));
  await page.goto("/");
  await expect(
    page.locator('#catnav a[href="entregadores.html"]'),
  ).toBeAttached();
  await page
    .locator("#entregadores")
    .getByRole("link", { name: "Quero ser entregador" })
    .click();
  await expect(page).toHaveURL(/entregadores\.html#cadastro$/);

  await page
    .locator("main")
    .getByRole("link", { name: "Já sou entregador" })
    .click();
  await expect(page).toHaveURL(/login\.html\?perfil=entregador$/);
  await expect(page.locator("#authEyebrow")).toHaveText("Portal do entregador");
  await page.getByRole("link", { name: "Quero me cadastrar" }).click();
  await expect(page).toHaveURL(/entregadores\.html#cadastro$/);
});
