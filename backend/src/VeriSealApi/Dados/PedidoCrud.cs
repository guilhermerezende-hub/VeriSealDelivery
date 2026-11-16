using System.Globalization;
using MySqlConnector;
using VeriSealApi.Modelos;

namespace VeriSealApi.Dados;

public class PedidoCrud
{
    // Mesmas letras dos lacres feitos no site (js/records.js): sem I, O, 0 e 1, que se confundem.
    private const string LetrasDoLacre = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private const string SelecionarPedidos =
        "SELECT p.id, p.numero, p.status, p.criado_em, p.pagamento, p.parcelas, p.troco_para, p.agendado_para, " +
        "p.presente, p.mensagem_presente, p.subtotal, p.desconto, p.frete, p.total, " +
        "c.id AS cliente_id, c.usuario_id, c.nome AS cliente_nome, c.telefone AS cliente_telefone, c.criado_em AS cliente_criado_em, " +
        "e.cep, e.rua, e.numero AS endereco_numero, e.complemento, e.bairro, e.cidade, e.uf " +
        "FROM pedidos p " +
        "JOIN clientes c ON c.id = p.cliente_id " +
        "JOIN enderecos e ON e.id = p.endereco_id";

    private readonly BancoDeDados banco;

    public PedidoCrud(BancoDeDados banco)
    {
        this.banco = banco;
    }

    public List<Pedido> Listar()
    {
        return Carregar(null);
    }

    public Pedido? BuscarPorId(int id)
    {
        return Carregar(id).FirstOrDefault();
    }

    // Pedido feito na loja. Tudo entra numa transação só: cliente, endereço, pedido,
    // itens, histórico e um lacre por garrafa. Se qualquer parte falhar, nada fica gravado.
    // Produto inexistente ou parcelas demais viram ArgumentException (o Program.cs devolve 400).
    public Pedido Criar(NovoPedido novoPedido)
    {
        int pedidoId;

        using (var conexao = banco.AbrirConexao())
        using (var transacao = conexao.BeginTransaction())
        {
            var regras = LerRegrasDaLoja(conexao, transacao);
            var precos = LerPrecos(conexao, transacao);
            var garrafasDosKits = LerKits(conexao, transacao);

            foreach (var item in novoPedido.Itens)
            {
                if (!precos.TryGetValue(item.ProdutoId, out var preco))
                {
                    throw new ArgumentException($"Produto não encontrado: {item.ProdutoId}.");
                }

                item.PrecoUnitario = preco;
            }

            if (novoPedido.Parcelas > regras.MaximoDeParcelas)
            {
                throw new ArgumentException($"O cartão aceita no máximo {regras.MaximoDeParcelas} parcelas.");
            }

            // Mesmas contas do site (js/commerce.js), com os valores da tabela configuracoes.
            var subtotal = novoPedido.Itens.Sum(item => item.PrecoUnitario * item.Quantidade);
            var desconto = novoPedido.Pagamento == "pix"
                ? Math.Round(subtotal * regras.DescontoPix, 2, MidpointRounding.AwayFromZero)
                : 0m;
            var frete = subtotal >= regras.FreteGratisAPartirDe ? 0m : regras.Frete;
            var total = subtotal - desconto + frete;

            var clienteId = SalvarCliente(conexao, transacao, novoPedido.Cliente);
            var enderecoId = InserirEndereco(conexao, transacao, clienteId, novoPedido.Endereco);
            pedidoId = InserirPedido(conexao, transacao, novoPedido, clienteId, enderecoId, subtotal, desconto, frete, total);

            foreach (var item in novoPedido.Itens)
            {
                using var comando = NovoComando(conexao, transacao,
                    "INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (@pedido_id, @produto_id, @quantidade, @preco_unitario)");
                comando.Parameters.AddWithValue("@pedido_id", pedidoId);
                comando.Parameters.AddWithValue("@produto_id", item.ProdutoId);
                comando.Parameters.AddWithValue("@quantidade", item.Quantidade);
                comando.Parameters.AddWithValue("@preco_unitario", item.PrecoUnitario);
                comando.ExecuteNonQuery();
            }

            InserirHistorico(conexao, transacao, pedidoId, "recebido");

            // Um lacre por garrafa: o kit gera um lacre para cada garrafa que vem dentro dele.
            var hoje = HorarioDeBrasilia();
            var lote = $"L{hoje:yy}-{hoje:MMdd}";
            foreach (var item in novoPedido.Itens)
            {
                var garrafas = garrafasDosKits.TryGetValue(item.ProdutoId, out var doKit)
                    ? doKit
                    : [(item.ProdutoId, 1)];

                for (var unidade = 0; unidade < item.Quantidade; unidade++)
                {
                    foreach (var (produtoId, quantidade) in garrafas)
                    {
                        for (var garrafa = 0; garrafa < quantidade; garrafa++)
                        {
                            var fabricadoEm = DateOnly.FromDateTime(hoje.AddDays(-Random.Shared.Next(20, 81)));
                            InserirLacre(conexao, transacao, pedidoId, produtoId, lote, fabricadoEm);
                        }
                    }
                }
            }

            transacao.Commit();
        }

        return BuscarPorId(pedidoId)!;
    }

    // Painel: muda a situação do pedido e registra a mudança no histórico.
    // "em_rota" (saiu para entrega) também marca a hora do envio em cada lacre do pedido.
    public bool AtualizarStatus(int id, string status)
    {
        using var conexao = banco.AbrirConexao();
        using var transacao = conexao.BeginTransaction();

        string? statusAtual;
        using (var comando = NovoComando(conexao, transacao, "SELECT status FROM pedidos WHERE id = @id FOR UPDATE"))
        {
            comando.Parameters.AddWithValue("@id", id);
            statusAtual = comando.ExecuteScalar() as string;
        }

        if (statusAtual == null)
        {
            return false;
        }

        if (statusAtual != status)
        {
            using (var comando = NovoComando(conexao, transacao, "UPDATE pedidos SET status = @status WHERE id = @id"))
            {
                comando.Parameters.AddWithValue("@status", status);
                comando.Parameters.AddWithValue("@id", id);
                comando.ExecuteNonQuery();
            }

            InserirHistorico(conexao, transacao, id, status);

            if (status == "em_rota")
            {
                using var comando = NovoComando(conexao, transacao,
                    "UPDATE lacres SET enviado_em = NOW() WHERE pedido_id = @id AND enviado_em IS NULL");
                comando.Parameters.AddWithValue("@id", id);
                comando.ExecuteNonQuery();
            }
        }

        transacao.Commit();
        return true;
    }

    // Leitura ---------------------------------------------------------------------

    private List<Pedido> Carregar(int? id)
    {
        var pedidos = new List<Pedido>();
        var pedidosPorId = new Dictionary<int, Pedido>();

        using var conexao = banco.AbrirConexao();

        using (var comando = conexao.CreateCommand())
        {
            comando.CommandText = SelecionarPedidos + (id == null ? "" : " WHERE p.id = @id") + " ORDER BY p.criado_em DESC, p.id DESC";
            comando.Parameters.AddWithValue("@id", id);

            using var leitor = comando.ExecuteReader();
            while (leitor.Read())
            {
                var pedido = LerPedido(leitor);
                pedidos.Add(pedido);
                pedidosPorId[pedido.Id] = pedido;
            }
        }

        if (pedidos.Count == 0)
        {
            return pedidos;
        }

        var filtro = id == null ? "" : " WHERE pedido_id = @id";

        using (var comando = conexao.CreateCommand())
        {
            comando.CommandText = "SELECT pedido_id, produto_id, quantidade, preco_unitario FROM pedido_itens" + filtro + " ORDER BY pedido_id, produto_id";
            comando.Parameters.AddWithValue("@id", id);

            using var leitor = comando.ExecuteReader();
            while (leitor.Read())
            {
                if (pedidosPorId.TryGetValue(leitor.GetInt32("pedido_id"), out var pedido))
                {
                    pedido.Itens.Add(new ItemDoPedido
                    {
                        ProdutoId = leitor.GetString("produto_id"),
                        Quantidade = leitor.GetInt32("quantidade"),
                        PrecoUnitario = leitor.GetDecimal("preco_unitario")
                    });
                }
            }
        }

        using (var comando = conexao.CreateCommand())
        {
            comando.CommandText = LacreCrud.SelecionarLacres + (id == null ? " WHERE pedido_id IS NOT NULL" : filtro) + " ORDER BY codigo";
            comando.Parameters.AddWithValue("@id", id);

            using var leitor = comando.ExecuteReader();
            while (leitor.Read())
            {
                var lacre = LacreCrud.LerLacre(leitor);
                if (lacre.PedidoId != null && pedidosPorId.TryGetValue(lacre.PedidoId.Value, out var pedido))
                {
                    pedido.Lacres.Add(lacre);
                }
            }
        }

        using (var comando = conexao.CreateCommand())
        {
            comando.CommandText = "SELECT pedido_id, status, criado_em FROM pedido_historico" + filtro + " ORDER BY id";
            comando.Parameters.AddWithValue("@id", id);

            using var leitor = comando.ExecuteReader();
            while (leitor.Read())
            {
                if (pedidosPorId.TryGetValue(leitor.GetInt32("pedido_id"), out var pedido))
                {
                    pedido.Historico.Add(new HistoricoDoPedido
                    {
                        Status = leitor.GetString("status"),
                        CriadoEm = leitor.GetDateTime("criado_em")
                    });
                }
            }
        }

        return pedidos;
    }

    private static Pedido LerPedido(MySqlDataReader leitor)
    {
        string? TextoOuNulo(string coluna) => leitor.IsDBNull(leitor.GetOrdinal(coluna)) ? null : leitor.GetString(coluna);

        return new Pedido
        {
            Id = leitor.GetInt32("id"),
            Numero = leitor.GetString("numero"),
            Status = leitor.GetString("status"),
            CriadoEm = leitor.GetDateTime("criado_em"),
            Pagamento = leitor.GetString("pagamento"),
            Parcelas = leitor.GetInt32("parcelas"),
            TrocoPara = leitor.IsDBNull(leitor.GetOrdinal("troco_para")) ? null : leitor.GetDecimal("troco_para"),
            AgendadoPara = TextoOuNulo("agendado_para"),
            Presente = leitor.GetBoolean("presente"),
            MensagemPresente = TextoOuNulo("mensagem_presente"),
            Subtotal = leitor.GetDecimal("subtotal"),
            Desconto = leitor.GetDecimal("desconto"),
            Frete = leitor.GetDecimal("frete"),
            Total = leitor.GetDecimal("total"),
            Cliente = new Cliente
            {
                Id = leitor.GetInt32("cliente_id"),
                UsuarioId = leitor.IsDBNull(leitor.GetOrdinal("usuario_id")) ? null : leitor.GetInt32("usuario_id"),
                Nome = leitor.GetString("cliente_nome"),
                Telefone = leitor.GetString("cliente_telefone"),
                CriadoEm = leitor.GetDateTime("cliente_criado_em")
            },
            Endereco = new Endereco
            {
                Cep = leitor.GetString("cep"),
                Rua = leitor.GetString("rua"),
                Numero = leitor.GetString("endereco_numero"),
                Complemento = TextoOuNulo("complemento"),
                Bairro = TextoOuNulo("bairro"),
                Cidade = TextoOuNulo("cidade"),
                Uf = TextoOuNulo("uf")
            }
        };
    }

    // Gravação (sempre dentro da transação do pedido) -----------------------------

    private record RegrasDaLoja(decimal DescontoPix, decimal Frete, decimal FreteGratisAPartirDe, int MaximoDeParcelas);

    private static RegrasDaLoja LerRegrasDaLoja(MySqlConnection conexao, MySqlTransaction transacao)
    {
        var valores = new Dictionary<string, string>();
        using var comando = NovoComando(conexao, transacao, "SELECT chave, valor FROM configuracoes WHERE valor IS NOT NULL");
        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            valores[leitor.GetString("chave")] = leitor.GetString("valor");
        }

        // Se a configuração não existir no banco, valem os mesmos números do js/config.js.
        decimal Numero(string chave, decimal padrao) =>
            valores.TryGetValue(chave, out var texto) && decimal.TryParse(texto, NumberStyles.Number, CultureInfo.InvariantCulture, out var valor)
                ? valor
                : padrao;

        return new RegrasDaLoja(
            DescontoPix: Numero("desconto_pix", 0.05m),
            Frete: Numero("frete", 9.90m),
            FreteGratisAPartirDe: Numero("frete_gratis_a_partir_de", 199m),
            MaximoDeParcelas: (int)Numero("max_parcelas", 6));
    }

    private static Dictionary<string, decimal> LerPrecos(MySqlConnection conexao, MySqlTransaction transacao)
    {
        var precos = new Dictionary<string, decimal>();
        using var comando = NovoComando(conexao, transacao, "SELECT id, preco FROM produtos WHERE ativo = TRUE");
        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            precos[leitor.GetString("id")] = leitor.GetDecimal("preco");
        }

        return precos;
    }

    // kit -> garrafas que vêm dentro dele (tabela kit_itens)
    private static Dictionary<string, List<(string ProdutoId, int Quantidade)>> LerKits(MySqlConnection conexao, MySqlTransaction transacao)
    {
        var kits = new Dictionary<string, List<(string, int)>>();
        using var comando = NovoComando(conexao, transacao, "SELECT kit_id, produto_id, quantidade FROM kit_itens ORDER BY kit_id, ordem");
        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            var kitId = leitor.GetString("kit_id");
            if (!kits.TryGetValue(kitId, out var garrafas))
            {
                garrafas = [];
                kits[kitId] = garrafas;
            }

            garrafas.Add((leitor.GetString("produto_id"), leitor.GetInt32("quantidade")));
        }

        return kits;
    }

    // Quem compra de novo com o mesmo celular continua sendo o mesmo cliente.
    private static int SalvarCliente(MySqlConnection conexao, MySqlTransaction transacao, Cliente cliente)
    {
        var numerosDoTelefone = new string(cliente.Telefone.Where(char.IsDigit).ToArray());

        int? clienteId;
        using (var comando = NovoComando(conexao, transacao,
            "SELECT id FROM clientes WHERE REGEXP_REPLACE(telefone, '[^0-9]', '') = @numeros ORDER BY id DESC LIMIT 1"))
        {
            comando.Parameters.AddWithValue("@numeros", numerosDoTelefone);
            clienteId = comando.ExecuteScalar() is int id ? id : null;
        }

        if (clienteId != null)
        {
            using var atualizar = NovoComando(conexao, transacao, "UPDATE clientes SET nome = @nome, telefone = @telefone WHERE id = @id");
            atualizar.Parameters.AddWithValue("@nome", cliente.Nome);
            atualizar.Parameters.AddWithValue("@telefone", cliente.Telefone);
            atualizar.Parameters.AddWithValue("@id", clienteId);
            atualizar.ExecuteNonQuery();
            return clienteId.Value;
        }

        using var inserir = NovoComando(conexao, transacao, "INSERT INTO clientes (nome, telefone) VALUES (@nome, @telefone)");
        inserir.Parameters.AddWithValue("@nome", cliente.Nome);
        inserir.Parameters.AddWithValue("@telefone", cliente.Telefone);
        inserir.ExecuteNonQuery();
        return (int)inserir.LastInsertedId;
    }

    private static int InserirEndereco(MySqlConnection conexao, MySqlTransaction transacao, int clienteId, Endereco endereco)
    {
        using var comando = NovoComando(conexao, transacao,
            "INSERT INTO enderecos (cliente_id, cep, rua, numero, complemento, bairro, cidade, uf) " +
            "VALUES (@cliente_id, @cep, @rua, @numero, @complemento, @bairro, @cidade, @uf)");
        comando.Parameters.AddWithValue("@cliente_id", clienteId);
        comando.Parameters.AddWithValue("@cep", endereco.Cep);
        comando.Parameters.AddWithValue("@rua", endereco.Rua);
        comando.Parameters.AddWithValue("@numero", endereco.Numero);
        comando.Parameters.AddWithValue("@complemento", endereco.Complemento);
        comando.Parameters.AddWithValue("@bairro", endereco.Bairro);
        comando.Parameters.AddWithValue("@cidade", endereco.Cidade);
        comando.Parameters.AddWithValue("@uf", endereco.Uf);
        comando.ExecuteNonQuery();
        return (int)comando.LastInsertedId;
    }

    private static int InserirPedido(MySqlConnection conexao, MySqlTransaction transacao, NovoPedido novoPedido,
        int clienteId, int enderecoId, decimal subtotal, decimal desconto, decimal frete, decimal total)
    {
        // O número do pedido (5 dígitos, como no site) é sorteado; se já existir, sorteia outro.
        for (var tentativa = 1; ; tentativa++)
        {
            using var comando = NovoComando(conexao, transacao,
                "INSERT INTO pedidos (numero, cliente_id, endereco_id, pagamento, parcelas, troco_para, agendado_para, presente, " +
                "mensagem_presente, maioridade_confirmada, subtotal, desconto, frete, total) " +
                "VALUES (@numero, @cliente_id, @endereco_id, @pagamento, @parcelas, @troco_para, @agendado_para, @presente, " +
                "@mensagem_presente, @maioridade_confirmada, @subtotal, @desconto, @frete, @total)");
            comando.Parameters.AddWithValue("@numero", Random.Shared.Next(10000, 100000).ToString());
            comando.Parameters.AddWithValue("@cliente_id", clienteId);
            comando.Parameters.AddWithValue("@endereco_id", enderecoId);
            comando.Parameters.AddWithValue("@pagamento", novoPedido.Pagamento);
            comando.Parameters.AddWithValue("@parcelas", novoPedido.Parcelas);
            comando.Parameters.AddWithValue("@troco_para", novoPedido.TrocoPara);
            comando.Parameters.AddWithValue("@agendado_para", novoPedido.AgendadoPara);
            comando.Parameters.AddWithValue("@presente", novoPedido.Presente);
            comando.Parameters.AddWithValue("@mensagem_presente", novoPedido.MensagemPresente);
            comando.Parameters.AddWithValue("@maioridade_confirmada", novoPedido.MaioridadeConfirmada);
            comando.Parameters.AddWithValue("@subtotal", subtotal);
            comando.Parameters.AddWithValue("@desconto", desconto);
            comando.Parameters.AddWithValue("@frete", frete);
            comando.Parameters.AddWithValue("@total", total);

            try
            {
                comando.ExecuteNonQuery();
                return (int)comando.LastInsertedId;
            }
            catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.DuplicateKeyEntry && tentativa < 10)
            {
                // número repetido: tenta outro
            }
        }
    }

    private static void InserirLacre(MySqlConnection conexao, MySqlTransaction transacao, int pedidoId, string produtoId, string lote, DateOnly fabricadoEm)
    {
        for (var tentativa = 1; ; tentativa++)
        {
            using var comando = NovoComando(conexao, transacao,
                "INSERT INTO lacres (codigo, produto_id, pedido_id, lote, fabricado_em, status) " +
                "VALUES (@codigo, @produto_id, @pedido_id, @lote, @fabricado_em, 'ok')");
            comando.Parameters.AddWithValue("@codigo", NovoCodigoDeLacre());
            comando.Parameters.AddWithValue("@produto_id", produtoId);
            comando.Parameters.AddWithValue("@pedido_id", pedidoId);
            comando.Parameters.AddWithValue("@lote", lote);
            comando.Parameters.AddWithValue("@fabricado_em", fabricadoEm);

            try
            {
                comando.ExecuteNonQuery();
                return;
            }
            catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.DuplicateKeyEntry && tentativa < 10)
            {
                // código repetido: sorteia outro
            }
        }
    }

    private static void InserirHistorico(MySqlConnection conexao, MySqlTransaction transacao, int pedidoId, string status)
    {
        using var comando = NovoComando(conexao, transacao, "INSERT INTO pedido_historico (pedido_id, status) VALUES (@pedido_id, @status)");
        comando.Parameters.AddWithValue("@pedido_id", pedidoId);
        comando.Parameters.AddWithValue("@status", status);
        comando.ExecuteNonQuery();
    }

    // Ajudantes -------------------------------------------------------------------

    private static MySqlCommand NovoComando(MySqlConnection conexao, MySqlTransaction transacao, string sql)
    {
        var comando = conexao.CreateCommand();
        comando.Transaction = transacao;
        comando.CommandText = sql;
        return comando;
    }

    private static string NovoCodigoDeLacre()
    {
        string Parte() => new string(Enumerable.Range(0, 4)
            .Select(_ => LetrasDoLacre[Random.Shared.Next(LetrasDoLacre.Length)])
            .ToArray());

        return $"VS-{Parte()}-{Parte()}";
    }

    // O banco trabalha no horário de Brasília (BancoDeDados.AbrirConexao); o lote usa o mesmo dia.
    private static DateTime HorarioDeBrasilia()
    {
        return DateTime.UtcNow.AddHours(-3);
    }
}
