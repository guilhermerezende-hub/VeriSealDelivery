# Alterações do front-end — 05/11/2026

## Organização e manutenção

- `js/app.js`: passou a coordenar módulos separados para endereço, catálogo, checkout, demonstrações e verificação; corrigiu o frete no detalhe do produto; passou a carregar produtos por URL.
- `js/address.js`: concentra a interface de consulta de endereço e ignora respostas antigas quando o usuário altera o CEP.
- `js/catalog.js`: concentra filtros, marcas, busca e ordenação.
- `js/checkout.js`: concentra as três etapas, revisão, confirmação ilustrativa e códigos fictícios; protege o preenchimento assíncrono de campos removidos.
- `js/verification.js`: concentra códigos de exemplo e resultados de lacres; não apresenta resultados locais como autenticação real.
- `js/showcase.js`: concentra carrossel e demonstrações animadas.
- `js/ui.js`: concentra utilitários, classes reutilizadas e medalhas visuais.
- `js/config.js`: centraliza frete, desconto Pix, quantidades, parcelamento e informações institucionais.
- `js/commerce.js`: calcula valores em centavos, usa o mesmo critério de frete e valida quantidades restauradas.
- `js/storage.js`: preserva a sacola já existente e trata armazenamento indisponível ou JSON corrompido.
- `js/delivery.js`: consulta somente endereço; remove o prazo inventado pelo CEP, trata falhas e descarta estimativas salvas por versões anteriores.
- `js/products.js`: identifica melhor os códigos de exemplo e recebe formatação legível.
- `js/seal.js`: recebe formatação legível, preservando a construção visual dos lacres.

## Interface e clareza

- `index.html`: mantém a identidade visual e estrutura responsiva, carrega módulos ES e CSS compilado; inclui aviso de demonstração, informações coerentes de frete, links institucionais e metadados.
- Checkout e rastreamento: deixam explícito que a conclusão não gera compra, cobrança ou entrega real.
- Pix: a confirmação passa a indicar desconto e pagamento simulados.
- Verificação: estados íntegro, aberto e desconhecido passam a ser exemplos locais, sem comprovação de autenticidade.
- Aviso à marca: informa que nenhuma mensagem foi enviada.
- Frete: gratuito a partir de R$ 199 em produtos, antes do Pix, inclusive no detalhe de produtos e kits.
- `sobre.html` e `js/institutional.js`: adicionam informações sobre o projeto, contato pendente, privacidade, termos da demonstração e limpeza dos dados locais. Dados da empresa não foram inventados.

## CSS, páginas de produtos e ferramentas

- `styles/main.css`, `theme.css`, `base.css`, `components.css`, `animations.css`: separam responsabilidades dos estilos antes embutidos no HTML.
- `assets/css/site.css`: saída compilada; substitui a compilação Tailwind no navegador.
- `scripts/build-products.js`: gera 21 páginas em `produtos/<id>/index.html`, incluindo kits, com descrição, imagem, metadados e retorno ao detalhe na loja. URLs absolutas e imagens sociais dependem de `SITE_URL` configurada.
- `scripts/serve.js`: servidor HTTP local para o desenvolvimento com módulos ES.
- `package.json`, `package-lock.json`: comandos reproduzíveis de build, execução, formatação e testes; ferramentas somente de desenvolvimento.
- `.prettierignore`, `.gitignore`: evitam formatar saídas geradas e versionar dependências ou resultados temporários.
- `tests/commerce.test.js`, `tests/delivery.test.js`, `tests/flows.spec.js`, `tests/navigation.spec.js`, `playwright.config.js`: testes das regras e fluxos nos dois tamanhos de tela.
- `README.md`, `docs/TESTES.md`, `docs/ALTERACOES.md`: instruções de execução, arquitetura, regras, testes, pendências de integração e relatório de mudanças.

## Escopo preservado

O catálogo continua estático e o front-end continua em JavaScript puro. O SQL não foi alterado nem executado. Não foram implementados pedidos, pagamentos, autenticação de lacres ou logística reais. Essas funções exigem serviços próprios; as mensagens do protótipo agora deixam isso explícito.

## Validação executada

- `npm run check`: build concluído, 10 testes unitários e 16 testes de navegador aprovados.
- Navegador: Microsoft Edge, com janelas de desktop (1440 × 1000) e celular (390 × 844).
- Foram verificados também o link de produto antes da confirmação de idade e respostas de CEP fora de ordem.
- Capturas de tela da página e do checkout foram inspecionadas visualmente.
- `git diff --check`: sem erros de espaços ou conflitos.
- ViaCEP e fontes foram controlados nos testes de navegador; disponibilidade real dos serviços não foi validada.
