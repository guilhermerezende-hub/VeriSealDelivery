# VeriSeal Delivery

Protótipo de delivery de bebidas com lacres inteligentes. O front-end usa JavaScript puro e módulos ES, sem framework de interface. A API em C# (ASP.NET Core, em `backend/`) liga o site ao banco MySQL (em `database/`) trocando JSON:

- **CRUD de lacres e de clientes** na página `painel.html`;
- **pedidos** gravam o cliente e um lacre por garrafa;
- a **verificação de lacres** consulta o banco e registra cada leitura;
- o botão **"Avisar a marca"** grava o aviso.

Pagamentos, rastreamento e leitura NFC física continuam simulados.

## Estrutura do repositório

```text
VeriSealDelivery/
├── frontend/                  # Site estático (HTML + JS puro + Tailwind)
│   ├── assets/                # Arquivos públicos: CSS gerado, ícones, logos, fotos
│   ├── js/                    # Módulos ES da aplicação
│   ├── styles/                # Fonte do CSS (entrada: main.css)
│   ├── produtos/              # Páginas de produto geradas pelo build
│   ├── scripts/               # Build das páginas e servidor de desenvolvimento
│   ├── tests/
│   │   ├── unit/              # Testes unitários (node --test)
│   │   └── e2e/               # Testes de navegador (Playwright)
│   ├── index.html, login.html, sobre.html, entregadores.html
│   ├── painel.html            # Painel da loja: CRUD de lacres e clientes
│   └── package.json
├── backend/                   # API REST em C# / .NET 10
│   ├── VeriSealDelivery.slnx  # Solução
│   ├── deploy/                # Modelo do appsettings de produção (sem senha)
│   └── src/
│       └── VeriSealApi/
│           ├── Dados/         # Conexão com o banco e classes CRUD
│           ├── Modelos/       # Classes que representam as tabelas (com validação)
│           ├── Properties/
│           ├── Program.cs     # Configuração (CORS) e rotas da API
│           └── appsettings.json
├── database/
│   ├── schema.sql             # Estrutura do banco (rodar primeiro)
│   ├── dados.sql              # Carga inicial — local, fora do Git
│   └── gerar-sql-hospedagem.mjs  # Gera o .sql para importar na hospedagem
├── docs/
│   ├── hospedagem.md          # Como publicar (HostGator + MonsterASP via FileZilla)
│   └── brand/                 # Kit original da marca (PNG, SVG, ícones)
└── README.md
```

## Executar localmente

### Front-end

Use Node.js 22 ou superior e npm, dentro de `frontend/`:

```sh
cd frontend
npm ci
npm run build
npm run dev
```

Abra `http://127.0.0.1:4173`. Os módulos precisam de um servidor HTTP; abrir o HTML por `file://` não é suportado. O CSS compilado e as páginas dos produtos ficam versionados, permitindo hospedagem estática sem Node no servidor de produção. Execute novamente o build depois de editar classes CSS, estilos, catálogo ou regras de preço.

### Banco de dados

No MySQL (ex.: DBeaver em `localhost:3306`), rode `database/schema.sql` (tabelas) e depois `database/dados.sql` (fotos, catálogo, banners, configurações e lacres).

### Back-end

Use o .NET SDK 10. A senha do banco não fica no `appsettings.json`: ela é lida da chave `SenhaBanco` dos *user secrets*.

```sh
cd backend/src/VeriSealApi
dotnet user-secrets set "SenhaBanco" "<sua senha>"
dotnet run
```

A API sobe em `http://localhost:5021` (ex.: `GET /api/teste-banco`, `GET /api/clientes`). Para compilar a solução inteira: `dotnet build backend/VeriSealDelivery.slnx`.

### Site e API juntos

Use dois terminais: um com a API (`backend/src/VeriSealApi` → `dotnet run`) e outro com o site (`frontend` → `npm run dev`). Depois abra:

- `http://127.0.0.1:4173`: a loja. A verificação e os pedidos usam o banco.
- `http://127.0.0.1:4173/painel.html`: o painel. O selo no topo mostra se o banco está conectado.

A API só aceita chamadas dos endereços listados em `OrigensDoSite` (CORS). No computador eles ficam em `appsettings.Development.json`; na hospedagem, em `appsettings.Production.json`. Se a API estiver desligada, a loja continua funcionando com os lacres guardados no próprio site. O painel avisa que está sem conexão.

### Rotas da API

| Método e rota | O que faz |
| --- | --- |
| `GET /api/clientes` · `GET /api/clientes/{id}` | Lista os clientes · busca um |
| `POST /api/clientes` · `PUT /api/clientes/{id}` · `DELETE /api/clientes/{id}` | Cria · atualiza nome e telefone · exclui (409 se houver endereço ou pedido) |
| `GET /api/lacres` · `GET /api/lacres/{codigo}` | Lista os lacres, com o total de verificações · busca um |
| `POST /api/lacres` · `PUT /api/lacres/{codigo}` · `DELETE /api/lacres/{codigo}` | Cria (409 se o código existir) · atualiza · exclui (409 se já foi verificado) |
| `POST /api/lacres/{codigo}/verificacoes` | Registra uma verificação (`{"origem":"codigo"}` ou `"nfc"`) e devolve o lacre |
| `GET /api/avisos` · `POST /api/avisos` | Lista · grava um aviso à marca (`nao_encontrado` ou `violado`) |
| `GET /api/teste-banco` | Confere a conexão com o MySQL |

As regras de cada tabela ficam nos modelos (`Cliente.Validar()`, `Lacre.Validar()`): o código no formato `VS-XXXX-XXXX`, o lote com até 12 caracteres e o telefone com DDD. Os erros do MySQL viram respostas claras: 1062 → 409, 1452 → 400, 1451 → 409.

## Hospedagem

O passo a passo completo está em [docs/hospedagem.md](docs/hospedagem.md). O site estático vai para a HostGator e a API com o banco vai para o MonsterASP.NET, os dois pelo FileZilla. Os pacotes saem destes comandos:

```powershell
node database/gerar-sql-hospedagem.mjs                                  # banco para importar
dotnet publish backend/src/VeriSealApi -c Release -o backend/publish    # API
cd frontend; npm run dist -- --api https://SEU-APP.runasp.net/api      # site (pasta dist)
```

## Organização do front-end

Caminhos relativos a `frontend/`.

| Arquivo | Responsabilidade |
| --- | --- |
| `js/app.js` | Integração da interface, navegação, sacola e detalhe dos produtos |
| `login.html`, `js/login.js`, `styles/login.css` | Tela demonstrativa de entrada, cadastro e recuperação de senha |
| `js/config.js` | Frete, desconto, limites, horários ilustrativos e dados institucionais |
| `js/commerce.js` | Totais em centavos, frete, Pix, parcelas e restauração da sacola |
| `js/storage.js` | Persistência local com tratamento de indisponibilidade e JSON inválido |
| `js/delivery.js` | Validação de formato, consulta ViaCEP e ausência de cobertura confirmada |
| `js/address.js` | Formulários de CEP e apresentação do endereço |
| `js/catalog.js` | Busca, categorias, marcas e ordenação |
| `js/checkout.js` | Formulários do pedido; grava o cliente e os lacres das garrafas pela API |
| `js/verification.js` | Verificação de lacres pela API (com os lacres do site como reserva) e aviso à marca |
| `js/api.js` | Chamadas à API em C# (JSON, mensagens de erro, tempo limite) |
| `js/records.js` | Conversões entre a API e a tela: datas, código do lacre, telefone |
| `painel.html`, `js/panel.js` | Painel da loja: CRUD de lacres e clientes e lista de avisos |
| `scripts/dist.js` | Monta `dist/` para a hospedagem com o endereço público da API |
| `js/showcase.js` | Carrossel e animações demonstrativas |
| `js/ui.js` | Utilitários de interface, classes compartilhadas e medalhas |
| `js/products.js`, `js/seal.js` | Catálogo estático e desenho/animação dos lacres |
| `styles/` | Tema, base, componentes e animações; entrada em `main.css` |
| `assets/css/site.css` | CSS gerado pelo Tailwind CLI; não editar manualmente |
| `sobre.html`, `js/institutional.js` | Informações institucionais, políticas e remoção dos dados locais |
| `scripts/build-products.js`, `produtos/` | Geração e saída das 21 páginas individuais de produtos |

O Tailwind e as ferramentas de teste são dependências de desenvolvimento. A página não baixa um compilador CSS via CDN. As imagens WebP, a identidade visual e a experiência responsiva foram mantidas.

## Regras da demonstração

- Frete ilustrativo: R$ 9,90; grátis quando o subtotal dos produtos é **maior ou igual a R$ 199,00, antes do desconto Pix**. Sacola vazia tem frete zero.
- Pix: 5% sobre os produtos, arredondado em centavos; o frete não recebe desconto. Exemplo: R$ 199,00 em produtos gera R$ 189,05 no Pix e frete zero.
- Máximo de 12 unidades por item. Valores inválidos no armazenamento são ignorados, e quantidades antigas acima do limite são reduzidas.
- ViaCEP consulta somente o endereço. Uma resposta positiva não confirma área de entrega nem prazo. Falhas não criam um endereço ou tempo de entrega fictício.
- Etapas e horários do checkout são ilustrativos. Nenhuma cobrança, mensagem de WhatsApp ou entrega acontece.
- Os lacres dos pedidos são gravados no banco pela API. Uma cópia também fica no navegador (`vsd:demo:seals`), que é usada se a API estiver fora do ar. O botão NFC consulta o último lacre do pedido.

As regras numéricas ficam em `js/config.js`. Alterações nelas precisam de novo build para atualizar as páginas estáticas. Os textos explicativos de campanha e políticas devem acompanhar eventuais mudanças de desconto ou parcelamento.

## Dados institucionais e publicação

Preencha `COMPANY` em `js/config.js` com informações confirmadas. O WhatsApp deve conter apenas dígitos, incluindo o código do país. Enquanto esses dados estiverem vazios, a página informa que razão social/CNPJ e contato comercial ainda não foram divulgados.

As páginas dos produtos têm título, descrição, Open Graph e Twitter Cards próprios. Para gerar URL canônica e imagens com endereço absoluto, defina `SITE_URL` com a URL real da hospedagem, incluindo eventual subpasta, antes do build. Exemplo em PowerShell:

```powershell
$env:SITE_URL = 'https://seu-dominio.example/loja/'
npm run build
```

Sem `SITE_URL`, nenhum domínio de produção é inventado. Não há marcação de ofertas disponíveis para compra, pois o catálogo é ilustrativo. O domínio `.example` usado nas animações é fictício.

## Testes e formatação

Comandos rodados dentro de `frontend/`:

```sh
npm test
npm run test:e2e
npm run format
npm run check
```

Os testes unitários (`tests/unit/`) usam o runner nativo do Node. Os testes de navegador (`tests/e2e/`) usam Playwright em desktop (1440 px) e celular (390 px), com ViaCEP e Google Fonts controlados para tornar os resultados repetíveis. A API também é controlada: por padrão fica "fora do ar", e nos testes do painel, da verificação e do pedido uma API falsa em memória responde como a de verdade. Os testes nunca gravam no seu banco. O navegador padrão é o Edge já instalado. Para outro ambiente, instale o Chromium com `npx playwright install chromium` e defina `PLAYWRIGHT_CHANNEL=chromium`; também é possível usar `chrome` se ele estiver instalado.

No Windows, é possível iniciar `npm run dev` em um terminal separado antes de `npm run test:e2e`; a configuração reutiliza esse servidor. Capturas e rastros de falhas ficam em `frontend/test-results/`, ignorados pelo Git.

## Integrações ainda necessárias

Já ligados ao banco: clientes, lacres, verificações e avisos à marca. Para operar comercialmente, ainda é preciso:

- login para o painel e para as rotas de gravação da API;
- pedidos e estoque no banco;
- provedor de pagamentos com confirmação verificável;
- cobertura e cálculo logístico, e rastreamento;
- leitura dos chips NFC físicos;
- canais de atendimento e políticas comerciais com os dados da empresa.
