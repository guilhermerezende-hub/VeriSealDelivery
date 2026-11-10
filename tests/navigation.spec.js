import { test, expect } from "@playwright/test";

test("link de produto aguarda a confirmação de idade", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  await page.goto("/index.html?produto=tanqueray");
  await expect(page.locator("#ageGate")).toBeVisible();
  await expect(page.locator("#productSheet")).toBeHidden();
  await page.locator("#ageYes").click();
  await expect(page.locator("#ageGate")).toBeHidden();
  await expect(page.locator("#productSheet")).toBeVisible();
  await expect(page.locator("#productSheet")).toContainText("Tanqueray");
  await page.keyboard.press("Escape");
  await expect(page.locator("#productSheet")).toBeHidden();
  expect(errors).toEqual([]);
});

test("uma resposta antiga de CEP não sobrescreve o endereço mais recente", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("vsd:age", "true"));
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  let oldRequest;
  const oldArrived = new Promise((resolve) => {
    oldRequest = resolve;
  });
  await page.route("https://viacep.com.br/ws/01310930/json/", (route) => {
    oldRequest(route);
  });
  await page.route("https://viacep.com.br/ws/30140071/json/", (route) =>
    route.fulfill({
      json: { localidade: "Belo Horizonte", uf: "MG", bairro: "Novo endereço" },
    }),
  );
  await page.goto("/");
  await page.locator("#heroCep").fill("01310930");
  await page.locator("#heroCepForm button").click();
  const oldRoute = await oldArrived;
  await page.locator("#heroCep").fill("30140071");
  await page.locator("#heroCepForm button").click();
  await expect(page.locator("#locText")).toContainText("Novo endereço");
  const oldResponse = page.waitForResponse(
    "https://viacep.com.br/ws/01310930/json/",
  );
  await oldRoute.fulfill({
    json: { localidade: "São Paulo", uf: "SP", bairro: "Endereço antigo" },
  });
  await oldResponse;
  await expect(page.locator("#locText")).toContainText("Novo endereço");
  expect(errors).toEqual([]);
});
