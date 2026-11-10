# Verificação do front-end

## Automatizada

1. `npm ci`
2. `npm run build`
3. `npm test`
4. `npm run test:e2e`

Os testes unitários cobrem o limite do frete antes do Pix, precisão monetária, parcelas, restauração da sacola, armazenamento bloqueado, formato de CEP, endereço encontrado, CEP inexistente, falha HTTP/rede, cancelamento por tempo limite e descarte de prazos antigos.

Os testes de navegador cobrem busca, filtros, persistência da sacola, checkout com confirmação de idade, frete/Pix, geração de lacres fictícios, consulta de CEP, resultados de lacres, aviso simulado, página individual de produto e remoção dos dados locais. Os mesmos fluxos são executados em desktop e celular. Erros JavaScript, inclusive os capturados pelo helper `safe`, fazem os testes falharem.

## Revisão manual

- Abra uma sessão limpa: a confirmação de idade deve aparecer. A opção de menor de idade deve bloquear a entrada.
- Teste o carrossel por setas e arraste; alterne entre os exemplos de lacre íntegro e violado. Confira a preferência de movimento reduzido.
- Use teclado em busca, sacola e detalhe. Tab deve permanecer na camada aberta; Escape deve fechar a camada e devolver o foco.
- Abra a sacola, altere quantidades, remova e desfaça. Recarregue e confirme a persistência.
- Confira um subtotal abaixo de R$ 199 e outro no limite. O Pix não deve fazer o frete grátis desaparecer.
- Consulte um CEP existente e um inexistente. Desligue a rede: uma falha não deve mostrar entrega confirmada.
- Digite dois CEPs rapidamente. Uma resposta antiga não deve sobrescrever o CEP mais recente.
- Feche o checkout enquanto uma consulta de CEP está em andamento. A resposta não deve preencher campos de outra tela.
- Simule Pix, cartão e pagamento na entrega. Nenhuma opção deve solicitar dados de cartão, cobrar ou confirmar pagamento real.
- Abra um link de produto em outra aba e volte ao detalhe na loja. Teste também com a confirmação de idade ainda pendente.
- Revise a página institucional e a limpeza de dados. Dados fora do prefixo `vsd:` devem permanecer.
- Inspecione em 390 px e 1440 px: sem rolagem horizontal da página, textos legíveis e botões alcançáveis.

Os mocks de rede dos testes não validam disponibilidade real do ViaCEP. Este projeto não contém integrações de pagamento, logística ou NFC para testar em produção.
