import { test, expect } from "@playwright/test";

// API falsa em memória, com as mesmas regras e respostas da API em C#.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "content-type, authorization",
};
const TOKEN = "token-de-teste";
const ADMIN = { nome: "Administrador", email: "admin@veriseal.com.br" };
const seed = () => ({
  lacres: [
    {
      codigo: "VS-7K2M-9QXA",
      produtoId: "jack-7",
      pedidoId: null,
      lote: "L26-0914",
      fabricadoEm: "2026-09-14",
      status: "ok",
      enviadoEm: "2026-11-11T23:13:57",
      abertoEm: null,
      verificacoes: 2,
    },
    {
      codigo: "VS-3PWD-8FJT",
      produtoId: "tanqueray",
      pedidoId: null,
      lote: "L26-0822",
      fabricadoEm: "2026-08-22",
      status: "ok",
      enviadoEm: null,
      abertoEm: null,
      verificacoes: 0,
    },
  ],
  clientes: [
    {
      id: 1,
      usuarioId: null,
      nome: "Maria Souza Lima",
      telefone: "11977776666",
      criadoEm: "2026-11-12T16:03:26",
    },
  ],
  avisos: [
    {
      id: 1,
      lacreCodigo: "VS-9XRT-0NDW",
      motivo: "nao_encontrado",
      status: "aberto",
      criadoEm: "2026-11-13T10:00:00",
    },
  ],
  pedidos: [
    {
      id: 7,
      numero: "48213",
      status: "recebido",
      criadoEm: "2026-11-15T20:41:00",
      cliente: {
        id: 1,
        usuarioId: null,
        nome: "Maria Souza Lima",
        telefone: "11977776666",
        criadoEm: "2026-11-12T16:03:26",
      },
      endereco: {
        cep: "01310-100",
        rua: "Avenida Paulista",
        numero: "1000",
        complemento: "Apto 52",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
      },
      pagamento: "pix",
      parcelas: 1,
      trocoPara: null,
      agendadoPara: null,
      presente: true,
      mensagemPresente: "Feliz aniversário!",
      subtotal: 224.8,
      desconto: 11.24,
      frete: 0,
      total: 213.56,
      itens: [
        { produtoId: "jack-7", quantidade: 1, precoUnitario: 129.9 },
        { produtoId: "tanqueray", quantidade: 1, precoUnitario: 94.9 },
      ],
      lacres: [
        {
          codigo: "VS-AB12-CD34",
          produtoId: "jack-7",
          pedidoId: 7,
          lote: "L26-1115",
          fabricadoEm: "2026-10-01",
          status: "ok",
          enviadoEm: null,
          abertoEm: null,
          verificacoes: 0,
        },
        {
          codigo: "VS-EF56-GH78",
          produtoId: "tanqueray",
          pedidoId: 7,
          lote: "L26-1115",
          fabricadoEm: "2026-09-20",
          status: "ok",
          enviadoEm: null,
          abertoEm: null,
          verificacoes: 0,
        },
      ],
      historico: [{ status: "recebido", criadoEm: "2026-11-15T20:41:00" }],
    },
    {
      id: 6,
      numero: "30577",
      status: "entregue",
      criadoEm: "2026-11-14T19:02:00",
      cliente: {
        id: 1,
        usuarioId: null,
        nome: "Maria Souza Lima",
        telefone: "11977776666",
        criadoEm: "2026-11-12T16:03:26",
      },
      endereco: {
        cep: "01310-100",
        rua: "Avenida Paulista",
        numero: "1000",
        complemento: null,
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
      },
      pagamento: "card",
      parcelas: 2,
      trocoPara: null,
      agendadoPara: null,
      presente: false,
      mensagemPresente: null,
      subtotal: 37.9,
      desconto: 0,
      frete: 9.9,
      total: 47.8,
      itens: [{ produtoId: "smirnoff", quantidade: 1, precoUnitario: 37.9 }],
      lacres: [],
      historico: [
        { status: "recebido", criadoEm: "2026-11-14T19:02:00" },
        { status: "entregue", criadoEm: "2026-11-14T19:40:00" },
      ],
    },
  ],
});

// Login guardado no navegador, como o admin.html deixa depois de entrar.
const signIn = (page) =>
  page.addInitScript(
    ([token, admin]) =>
      localStorage.setItem("vsd:admin", JSON.stringify({ token, ...admin })),
    [TOKEN, ADMIN],
  );

async function fakeApi(page, { sessionValid = true } = {}) {
  const db = seed();
  const calls = [];
  let nextId = 2;
  await page.route("http://localhost:5021/api/**", async (route) => {
    const req = route.request();
    const method = req.method();
    if (method === "OPTIONS")
      return route.fulfill({ status: 204, headers: CORS });
    const [, , resource, key, action] = new URL(req.url()).pathname.split("/");
    const body = req.postDataJSON();
    calls.push({
      call: `${method} /${resource}${key ? "/" + key : ""}${action ? "/" + action : ""}`,
      body,
      auth: req.headers().authorization,
    });
    const reply = (status, json) =>
      json === undefined
        ? route.fulfill({ status, headers: CORS })
        : route.fulfill({ status, headers: CORS, json });

    // Login: só esta rota funciona sem token
    if (resource === "admin" && key === "login") {
      if (body.email === ADMIN.email && body.senha === "VeriSeal@2026")
        return reply(200, { token: TOKEN, ...ADMIN });
      return reply(401, "E-mail ou senha incorretos.");
    }
    if (!sessionValid || req.headers().authorization !== `Bearer ${TOKEN}`)
      return reply(401, "Entre com a conta de administrador para continuar.");
    if (resource === "admin" && key === "eu") return reply(200, ADMIN);
    if (resource === "admin" && key === "sair") return reply(204);

    if (resource === "pedidos") {
      const i = db.pedidos.findIndex((p) => p.id === Number(key));
      if (!key) return reply(200, db.pedidos);
      if (i < 0) return reply(404, "Pedido não encontrado.");
      if (method === "PUT" && action === "status") {
        const p = db.pedidos[i];
        p.status = body.status;
        p.historico.push({
          status: body.status,
          criadoEm: "2026-11-15T21:00:00",
        });
        if (body.status === "em_rota")
          p.lacres.forEach((l) => (l.enviadoEm = "2026-11-15T21:00:00"));
        return reply(200, p);
      }
    }

    if (resource === "lacres") {
      const i = db.lacres.findIndex((s) => s.codigo === key);
      if (method === "GET") return reply(200, db.lacres);
      if (method === "POST") {
        if (db.lacres.some((s) => s.codigo === body.codigo))
          return reply(409, "Já existe um lacre com esse código.");
        const lacre = { ...body, verificacoes: 0 };
        db.lacres.unshift(lacre);
        return reply(201, lacre);
      }
      if (i < 0) return reply(404, "Lacre não encontrado.");
      if (method === "PUT") {
        db.lacres[i] = { ...db.lacres[i], ...body, codigo: key };
        return reply(200, db.lacres[i]);
      }
      if (method === "DELETE") {
        if (db.lacres[i].verificacoes > 0)
          return reply(
            409,
            "Esse lacre já tem verificações registradas e não pode ser excluído.",
          );
        db.lacres.splice(i, 1);
        return reply(204);
      }
    }
    if (resource === "clientes") {
      const i = db.clientes.findIndex((c) => c.id === Number(key));
      if (method === "GET") return reply(200, db.clientes);
      if (method === "POST") {
        const cliente = {
          id: nextId++,
          usuarioId: null,
          ...body,
          criadoEm: "2026-11-13T18:30:00",
        };
        db.clientes.push(cliente);
        return reply(201, cliente);
      }
      if (i < 0) return reply(404, "Cliente não encontrado.");
      if (method === "PUT") {
        db.clientes[i] = { ...db.clientes[i], ...body };
        return reply(200, db.clientes[i]);
      }
      if (method === "DELETE") {
        db.clientes.splice(i, 1);
        return reply(204);
      }
    }
    if (resource === "avisos") return reply(200, db.avisos);
    return reply(404, "Não encontrado.");
  });
  return { db, calls };
}

const errors = new WeakMap();
test.beforeEach(async ({ page }) => {
  errors.set(page, []);
  page.on("pageerror", (error) => errors.get(page).push(error.message));
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page), "Não deve haver erros de execução").toEqual([]);
});

test("painel lista, cadastra, edita e exclui lacres no banco", async ({
  page,
}, testInfo) => {
  await signIn(page);
  const { db, calls } = await fakeApi(page);
  await page.goto("/painel.html#lacres");
  await expect(page.locator("#apiStatus")).toContainText(
    "Banco de dados conectado",
  );
  await expect(page.locator('[data-count="lacres"]')).toHaveText("2");
  expect(calls.every((c) => c.auth === `Bearer ${TOKEN}`)).toBe(true);
  await expect(page.locator("#sealList")).toContainText("VS-7K2M-9QXA");
  await expect(page.locator("#sealList")).toContainText("Jack Daniel's");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("painel-lacres.png") });

  // Cadastrar
  await page.locator("#newSeal").click();
  await expect(page.locator("#sealCode")).toHaveValue(
    /^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
  );
  await page.locator("#sealCode").fill("vs-novo-0001");
  await expect(page.locator("#sealCode")).toHaveValue("VS-NOVO-0001");
  await page.locator('#sealForm button[type="submit"]').click();
  await expect(page.locator("#sealForm [data-form-error]")).toHaveText(
    "Escolha o produto.",
  );
  await page.locator("#sealProduct").selectOption("jw-black");
  await page.locator('#sealForm button[type="submit"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Lacre VS-NOVO-0001 cadastrado",
  );
  await expect(page.locator("#sealForm")).toBeHidden();
  await expect(page.locator('[data-count="lacres"]')).toHaveText("3");
  const created = calls.find((c) => c.call === "POST /lacres").body;
  expect(created).toMatchObject({
    codigo: "VS-NOVO-0001",
    produtoId: "jw-black",
    status: "ok",
    abertoEm: null,
  });
  expect(created.lote).toMatch(/^L\d{2}-\d{4}$/);

  // Código repetido: a mensagem da API aparece no formulário
  await page.locator("#newSeal").click();
  await page.locator("#sealCode").fill("VS-NOVO-0001");
  await page.locator("#sealProduct").selectOption("jw-black");
  await page.locator('#sealForm button[type="submit"]').click();
  await expect(page.locator("#sealForm [data-form-error]")).toHaveText(
    "Já existe um lacre com esse código.",
  );
  await page.locator("#sealForm [data-cancel]").click();

  // Editar: lacre violado precisa da data de abertura
  await page.locator('[data-edit-seal="VS-3PWD-8FJT"]').click();
  await expect(page.locator("#sealCode")).toHaveAttribute("readonly", "");
  await expect(page.locator("#sealProduct")).toHaveValue("tanqueray");
  await page.locator("#sealStatus").selectOption("opened");
  await expect(page.locator("#sealOpened")).toBeVisible();
  await expect(page.locator("#sealOpened")).not.toHaveValue("");
  await page.locator('#sealForm button[type="submit"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Lacre VS-3PWD-8FJT atualizado",
  );
  const edited = calls.find((c) => c.call === "PUT /lacres/VS-3PWD-8FJT").body;
  expect(edited.status).toBe("opened");
  expect(edited.abertoEm).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/);
  await expect(page.locator('[data-row="VS-3PWD-8FJT"]')).toContainText(
    "Violado",
  );

  // Excluir com verificações: o banco não deixa
  await page.locator('[data-delete-seal="VS-7K2M-9QXA"]').click();
  await page.locator('#confirmDialog button[value="confirm"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "já tem verificações registradas",
  );
  // Cancelar a confirmação não apaga nada
  await page.locator('[data-delete-seal="VS-NOVO-0001"]').click();
  await page.locator('#confirmDialog button[value="cancel"]').click();
  expect(calls.some((c) => c.call === "DELETE /lacres/VS-NOVO-0001")).toBe(
    false,
  );
  // Excluir de verdade
  await page.locator('[data-delete-seal="VS-NOVO-0001"]').click();
  await page.locator('#confirmDialog button[value="confirm"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Lacre VS-NOVO-0001 excluído",
  );
  await expect(page.locator('[data-row="VS-NOVO-0001"]')).toHaveCount(0);
  expect(db.lacres.map((s) => s.codigo)).toEqual([
    "VS-7K2M-9QXA",
    "VS-3PWD-8FJT",
  ]);

  // Busca
  await page.locator("#sealSearch").fill("tanqueray");
  await expect(page.locator("#sealList tbody tr")).toHaveCount(1);
  await page.locator("#sealSearch").fill("nada parecido");
  await expect(page.locator("#sealList")).toContainText(
    "Nenhum lacre encontrado",
  );
});

test("painel cadastra, edita e exclui clientes e mostra os avisos", async ({
  page,
}) => {
  await signIn(page);
  const { db, calls } = await fakeApi(page);
  await page.goto("/painel.html#clientes");
  await expect(page.locator("#painel-clientes")).toBeVisible();
  await expect(page.locator("#clientList")).toContainText("Maria Souza Lima");

  await page.locator("#newClient").click();
  await page.locator("#clientName").fill("Ana Teste");
  await page.locator("#clientPhone").fill("21998765432");
  await expect(page.locator("#clientPhone")).toHaveValue("(21) 99876-5432");
  await page.locator('#clientForm button[type="submit"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Cliente #2 cadastrado",
  );
  expect(calls.find((c) => c.call === "POST /clientes").body).toEqual({
    nome: "Ana Teste",
    telefone: "(21) 99876-5432",
  });

  await page.locator('[data-edit-client="2"]').click();
  await expect(page.locator("#clientName")).toHaveValue("Ana Teste");
  await page.locator("#clientPhone").fill("219");
  await page.locator('#clientForm button[type="submit"]').click();
  await expect(page.locator("#clientForm [data-form-error]")).toHaveText(
    "Informe um celular com DDD.",
  );
  await page.locator("#clientName").fill("Ana Teste Lima");
  await page.locator("#clientPhone").fill("21998765432");
  await page.locator('#clientForm button[type="submit"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Cliente #2 atualizado",
  );
  await expect(page.locator("#clientList")).toContainText("Ana Teste Lima");

  await page.locator('[data-delete-client="2"]').click();
  await expect(page.locator("#confirmDialog")).toContainText("Ana Teste Lima");
  await page.locator('#confirmDialog button[value="confirm"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Cliente #2 excluído",
  );
  expect(db.clientes.map((c) => c.id)).toEqual([1]);

  await page.locator("#tab-avisos").click();
  await expect(page.locator("#painel-avisos")).toBeVisible();
  await expect(page.locator("#reportList")).toContainText("VS-9XRT-0NDW");
  await expect(page.locator("#reportList")).toContainText(
    "Lacre não encontrado",
  );
});

test("painel avisa quando a API está fora do ar", async ({ page }) => {
  await signIn(page);
  await page.route("http://localhost:5021/api/**", (route) =>
    route.abort("connectionrefused"),
  );
  await page.goto("/painel.html#lacres");
  await expect(page.locator("#apiStatus")).toContainText(
    "Sem conexão com a API",
  );
  await expect(page.locator("#sealList")).toContainText(
    "Não foi possível conectar ao servidor",
  );
  await expect(page.locator("#sealList [data-retry]")).toBeVisible();
});

test("painel sem login abre a tela do administrador e entra com a senha certa", async ({
  page,
}, testInfo) => {
  const { calls } = await fakeApi(page);
  await page.goto("/painel.html");
  await expect(page).toHaveURL(/admin\.html$/);
  await expect(page.locator("h1")).toHaveText("Painel da loja");
  await expect(page.locator("body")).not.toContainText(
    /demonstra|simulad|fictíci/i,
  );
  await page.screenshot({ path: testInfo.outputPath("admin-login.png") });

  await page.locator('#adminLogin button[type="submit"]').click();
  await expect(page.locator("#adminError")).toHaveText(
    "Informe o e-mail e a senha.",
  );
  await page.locator("#adminEmail").fill("admin@veriseal.com.br");
  await page.locator("#adminPassword").fill("senha-errada");
  await page.locator('#adminLogin button[type="submit"]').click();
  await expect(page.locator("#adminError")).toHaveText(
    "E-mail ou senha incorretos.",
  );
  await page.locator('[data-password-toggle="adminPassword"]').click();
  await expect(page.locator("#adminPassword")).toHaveAttribute("type", "text");
  await page.locator("#adminPassword").fill("VeriSeal@2026");
  await page.locator('#adminLogin button[type="submit"]').click();

  await expect(page).toHaveURL(/painel\.html/);
  await expect(page.locator("#painel-pedidos")).toBeVisible();
  await expect(page.locator('[data-count="pedidos"]')).toHaveText("2");
  expect(calls[0]).toMatchObject({
    call: "POST /admin/login",
    body: { email: "admin@veriseal.com.br", senha: "senha-errada" },
  });

  // Sair apaga o login deste navegador
  await page.locator("#logout").click();
  await expect(page).toHaveURL(/admin\.html\?saiu=1$/);
  await expect(page.locator("#adminNotice")).toContainText("Você saiu");
  expect(calls.some((c) => c.call === "POST /admin/sair")).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("vsd:admin"))).toBe(
    "null",
  );
});

test("painel mostra os pedidos e muda a situação da entrega", async ({
  page,
}, testInfo) => {
  await signIn(page);
  const { db, calls } = await fakeApi(page);
  await page.goto("/painel.html");
  await expect(page.locator("#painel-pedidos")).toBeVisible();
  await expect(page.locator("#orderList")).toContainText("#48213");
  await expect(page.locator("#orderList")).toContainText("Maria Souza Lima");
  await expect(page.locator('[data-stat="pedidos-andamento"]')).toHaveText("1");
  await expect(page.locator('[data-stat="pedidos-entregues"]')).toHaveText("1");
  await expect(page.locator('[data-stat="pedidos-faturamento"]')).toContainText(
    "261,36",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("painel-pedidos.png") });

  // Filtro e busca
  await page.locator('[data-order-filter="entregue"]').click();
  await expect(page.locator("#orderList tbody tr")).toHaveCount(1);
  await expect(page.locator("#orderList")).toContainText("#30577");
  await page.locator('[data-order-filter="all"]').click();
  await page.locator("#orderSearch").fill("48213");
  await expect(page.locator("#orderList tbody tr")).toHaveCount(1);
  await page.locator("#orderSearch").fill("");

  // Detalhes do pedido
  await page.locator('[data-open-order="7"]').click();
  const dialog = page.locator("#orderDialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("#orderTitle")).toHaveText("Pedido #48213");
  await expect(dialog).toContainText("Avenida Paulista, 1000 — Apto 52");
  await expect(dialog).toContainText("Feliz aniversário!");
  await expect(dialog).toContainText("VS-AB12-CD34");
  await expect(dialog).toContainText("Desconto Pix");
  await expect(page.locator("#orderStatus")).toHaveValue("recebido");
  await page.screenshot({ path: testInfo.outputPath("painel-pedido.png") });

  // Saiu para entrega
  await page.locator("#orderStatus").selectOption("em_rota");
  await page.locator('#orderForm button[type="submit"]').click();
  await expect(page.locator("#panelToast")).toContainText(
    "Pedido #48213 atualizado: Saiu para entrega",
  );
  await expect(dialog).toBeHidden();
  expect(calls.find((c) => c.call === "PUT /pedidos/7/status").body).toEqual({
    status: "em_rota",
  });
  await expect(page.locator('[data-row="7"]')).toContainText(
    "Saiu para entrega",
  );
  expect(db.pedidos[0].historico.map((h) => h.status)).toEqual([
    "recebido",
    "em_rota",
  ]);
});

test("login vencido volta para a tela do administrador", async ({ page }) => {
  await signIn(page);
  await fakeApi(page, { sessionValid: false });
  await page.goto("/painel.html");
  await expect(page).toHaveURL(/admin\.html\?expirou=1$/);
  await expect(page.locator("#adminError")).toContainText(
    "Sua sessão terminou",
  );
});
