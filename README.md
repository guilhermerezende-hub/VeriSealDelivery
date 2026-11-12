# VeriSeal Delivery

Protótipo de delivery de bebidas com uma demonstração de lacres inteligentes. O front-end usa JavaScript puro e módulos ES, sem framework de interface. Compras, pagamentos, rastreamento, avisos à marca e leitura NFC são simulados. O banco MySQL fica em `database/`: rode `schema.sql` (tabelas) e depois `dados.sql` (fotos, catálogo, banners, configurações e lacres). Ele ainda não está conectado à página.

## Executar localmente

Use Node.js 22 ou superior e npm:

```sh
npm ci
npm run build
npm run dev
```

Abra `http://127.0.0.1:4173`. Os módulos precisam de um servidor HTTP; abrir o HTML por `file://` não é suportado. O CSS compilado e as páginas dos produtos ficam versionados, permitindo hospedagem estática sem Node no servidor de produção. Execute novamente o build depois de editar classes CSS, estilos, catálogo ou regras de preço.

## Organização

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
| `js/checkout.js` | Formulários e geração de pedidos e lacres fictícios |
| `js/verification.js` | Consulta aos códigos locais de demonstração |
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
- Lacres novos usam o namespace `vsd:demo:seals`; não são registros de autenticidade. O botão NFC apenas seleciona um exemplo.

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

```sh
npm test
npm run test:e2e
npm run format
npm run check
```

Os testes unitários usam o runner nativo do Node. Os testes de navegador usam Playwright em desktop (1440 px) e celular (390 px), com ViaCEP e Google Fonts controlados para tornar os resultados repetíveis. O navegador padrão é o Edge já instalado. Para outro ambiente, instale o Chromium com `npx playwright install chromium` e defina `PLAYWRIGHT_CHANNEL=chromium`; também é possível usar `chrome` se ele estiver instalado.

No Windows, é possível iniciar `npm run dev` em um terminal separado antes de `npm run test:e2e`; a configuração reutiliza esse servidor. Capturas e rastros de falhas ficam em `test-results/`, ignorados pelo Git.

O roteiro adicional de revisão está em `docs/TESTES.md`, e o relatório das alterações em `docs/ALTERACOES.md`.

## Integrações ainda necessárias

Para operar comercialmente, será necessário implementar e validar no servidor: pedidos e estoque, provedor de pagamentos com confirmação verificável, cobertura e cálculo logístico, rastreamento, autenticação de lacres físicos, canais de atendimento e políticas comerciais com dados da empresa. O front-end atual não implementa essas integrações e informa essa limitação ao usuário.
