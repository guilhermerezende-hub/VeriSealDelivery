namespace VeriSealApi.Modelos;

// Pedido completo, do jeito que o painel mostra: cliente, endereço, itens,
// lacres de cada garrafa e o histórico de status.
public class Pedido
{
    // Situações possíveis (mesmo ENUM da tabela pedidos), na ordem da entrega.
    public static readonly string[] StatusValidos = ["recebido", "separando", "em_rota", "entregue", "cancelado"];

    public int Id { get; set; }
    public string Numero { get; set; } = "";
    public string Status { get; set; } = "recebido";
    public DateTime CriadoEm { get; set; }

    public Cliente Cliente { get; set; } = new();
    public Endereco Endereco { get; set; } = new();

    public string Pagamento { get; set; } = "";
    public int Parcelas { get; set; } = 1;
    public decimal? TrocoPara { get; set; }
    public string? AgendadoPara { get; set; }
    public bool Presente { get; set; }
    public string? MensagemPresente { get; set; }

    public decimal Subtotal { get; set; }
    public decimal Desconto { get; set; }
    public decimal Frete { get; set; }
    public decimal Total { get; set; }

    public List<ItemDoPedido> Itens { get; set; } = [];
    public List<Lacre> Lacres { get; set; } = [];
    public List<HistoricoDoPedido> Historico { get; set; } = [];
}

public class ItemDoPedido
{
    public string ProdutoId { get; set; } = "";
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}

public class HistoricoDoPedido
{
    public string Status { get; set; } = "";
    public DateTime CriadoEm { get; set; }
}

// Corpo do PUT /api/pedidos/{id}/status (painel).
public class MudancaDeStatus
{
    public string Status { get; set; } = "";

    public string? Validar()
    {
        if (!Pedido.StatusValidos.Contains(Status))
        {
            return "Status inválido. Use: recebido, separando, em_rota, entregue ou cancelado.";
        }

        return null;
    }
}
