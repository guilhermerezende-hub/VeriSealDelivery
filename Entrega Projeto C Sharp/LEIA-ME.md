# VeriSeal Delivery: entrega de Lógica de Programação

A VeriSeal Delivery é uma loja de bebidas em que cada garrafa sai com um lacre inteligente. Quem recebe confere o código do lacre e descobre se a garrafa é original e se foi aberta.

Esta entrega tem três partes:

| Arquivo ou pasta | O que é |
| --- | --- |
| `banco-de-dados.sql` | Script completo do banco MySQL: cria o banco `veriseal_delivery`, as 20 tabelas, os dados da loja e 5 pedidos realizados |
| `pedidos-json/` | Os 5 pedidos realizados em JSON, um arquivo por pedido, mais `todos-os-pedidos.json` com todos juntos |
| `projeto-csharp/` | API em C# (.NET 10) com o CRUD das tabelas `clientes` e `lacres`, trocando dados em JSON |

## 1. Criar o banco de dados

Use o MySQL 8, num servidor que ainda não tenha o banco `veriseal_delivery`.

- **DBeaver:** conecte no MySQL, abra `banco-de-dados.sql` e use **Executar script** (Alt+X).
- **MySQL Workbench:** *File → Open SQL Script*, depois o botão de raio (*Execute*).

O script tem três partes:

1. **Estrutura:** banco e tabelas, com chaves estrangeiras e regras `CHECK`. Exemplo: o pedido só existe com `maioridade_confirmada = TRUE`.
2. **Dados da loja:** fotos, categorias, 21 produtos, kits, banners, configurações (frete, desconto do Pix, parcelas) e lacres.
3. **Pedidos realizados:** os mesmos 5 pedidos dos arquivos JSON, nas tabelas `clientes`, `enderecos`, `pedidos`, `pedido_itens`, `pedido_historico`, `pagamentos`, `lacres` e `verificacoes`.

Para conferir depois de rodar:

```sql
USE veriseal_delivery;

SELECT p.numero, p.status, c.nome, p.total
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
ORDER BY p.id;
```

## 2. Rodar a API em C#

Você precisa do .NET SDK 10 e do banco já criado. A conexão está em `appsettings.json` (servidor `localhost`, porta 3306, usuário `root`). A senha não fica no código: ela vai nos *user-secrets*.

```sh
cd projeto-csharp/src/VeriSealApi
dotnet user-secrets set "SenhaBanco" "<senha do MySQL>"
dotnet run
```

A API sobe em `http://localhost:5021`. Teste em `http://localhost:5021/api/teste-banco`. Para abrir no Visual Studio, use `projeto-csharp/VeriSealDelivery.slnx`.

## 3. O CRUD

Todas as rotas recebem e devolvem JSON.

| Operação | Clientes | Lacres |
| --- | --- | --- |
| **Create** (criar) | `POST /api/clientes` | `POST /api/lacres` |
| **Read** (listar) | `GET /api/clientes` | `GET /api/lacres` |
| **Read** (buscar um) | `GET /api/clientes/{id}` | `GET /api/lacres/{codigo}` |
| **Update** (atualizar) | `PUT /api/clientes/{id}` | `PUT /api/lacres/{codigo}` |
| **Delete** (excluir) | `DELETE /api/clientes/{id}` | `DELETE /api/lacres/{codigo}` |

Outras rotas: `POST /api/lacres/{codigo}/verificacoes` registra uma conferência do lacre, e `GET`/`POST /api/avisos` lista ou grava um aviso de lacre violado.

Exemplos de corpo em JSON:

```json
{ "nome": "Ana Paula Ribeiro", "telefone": "(11) 98765-4321" }
```

```json
{
  "codigo": "VS-7K2M-9QXA",
  "produtoId": "jack-7",
  "lote": "L26-0914",
  "fabricadoEm": "2026-09-14",
  "status": "ok"
}
```

### Como o código está organizado

- **`Program.cs`**: configuração da API e as rotas.
- **`Modelos/`**: uma classe por tabela (`Cliente`, `Lacre`, `AvisoMarca`, `Verificacao`). Cada uma tem:
  - `Normalizar()`, que limpa os dados;
  - `Validar()`, que confere as regras. Exemplos: o código do lacre no formato `VS-XXXX-XXXX`, o telefone com DDD, o lacre violado com data de abertura.
- **`Dados/`**:
  - `BancoDeDados` abre a conexão;
  - `ClienteCrud`, `LacreCrud` e `AvisoCrud` têm `Listar`, `BuscarPorId`/`BuscarPorCodigo`, `Criar`, `Atualizar` e `Deletar`. Todo SQL usa parâmetros (`@nome`, `@codigo`…), nunca texto colado.
- **Erros do MySQL** viram respostas claras:
  - código repetido (1062) → 409;
  - produto que não existe (1452) → 400;
  - cliente com pedido não pode ser excluído (1451) → 409.

## 4. Os pedidos em JSON

Cada arquivo de `pedidos-json/` traz um pedido completo:

- cliente e endereço;
- itens com o preço de cada um;
- valores: subtotal, desconto, frete e total;
- pagamento;
- entrega;
- lacres de cada garrafa;
- histórico de situações.

| Pedido | Cliente | Situação | Pagamento | Total | Lacres |
| --- | --- | --- | --- | --- | --- |
| #10231 | Ana Paula Ribeiro | entregue | Pix | R$ 194,96 | 2 |
| #10387 | Bruno Carvalho Santos | entregue | cartão 3x | R$ 379,90 | 3 |
| #10452 | Camila Ferreira Lopes | saiu para entrega | na entrega (troco para R$ 100) | R$ 85,70 | 2 |
| #10519 | Diego Martins Oliveira | separando | Pix | R$ 299,15 | 3 |
| #10544 | Ana Paula Ribeiro | recebido | cartão à vista | R$ 187,70 | 2 |

Regras usadas nos valores, as mesmas da loja:

- **Pix:** 5% de desconto sobre os produtos.
- **Frete:** R$ 9,90, grátis a partir de R$ 199,00 em produtos.
- **Lacres:** um por garrafa. O kit tem um lacre para cada garrafa que vem nele.
