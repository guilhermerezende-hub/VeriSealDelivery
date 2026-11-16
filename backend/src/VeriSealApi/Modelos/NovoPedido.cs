namespace VeriSealApi.Modelos;

// Corpo do POST /api/pedidos, enviado pelo checkout da loja.
// Os preços NÃO vêm daqui: a API busca cada preço na tabela produtos.
public class NovoPedido
{
    private const int MaximoDeUnidades = 12;

    public Cliente Cliente { get; set; } = new();
    public Endereco Endereco { get; set; } = new();
    public string Pagamento { get; set; } = "";
    public int Parcelas { get; set; } = 1;
    public decimal? TrocoPara { get; set; }
    public string? AgendadoPara { get; set; }
    public bool Presente { get; set; }
    public string? MensagemPresente { get; set; }
    public bool MaioridadeConfirmada { get; set; }
    public List<ItemDoPedido> Itens { get; set; } = [];

    public void Normalizar()
    {
        Cliente ??= new();
        Endereco ??= new();
        Itens ??= [];

        Cliente.Normalizar();
        Endereco.Normalizar();
        Pagamento = (Pagamento ?? "").Trim();
        AgendadoPara = string.IsNullOrWhiteSpace(AgendadoPara) ? null : AgendadoPara.Trim();
        MensagemPresente = Presente && !string.IsNullOrWhiteSpace(MensagemPresente) ? MensagemPresente.Trim() : null;

        // parcelas só no cartão; troco só no pagamento na entrega
        if (Pagamento != "card")
        {
            Parcelas = 1;
        }

        if (Pagamento != "cod")
        {
            TrocoPara = null;
        }

        // o mesmo produto repetido vira uma linha só (pedido_itens não aceita repetição)
        Itens = Itens
            .Where(item => item != null)
            .GroupBy(item => (item.ProdutoId ?? "").Trim())
            .Select(grupo => new ItemDoPedido { ProdutoId = grupo.Key, Quantidade = grupo.Sum(item => item.Quantidade) })
            .ToList();
    }

    public string? Validar()
    {
        var erro = Cliente.Validar() ?? Endereco.Validar();
        if (erro != null)
        {
            return erro;
        }

        if (Itens.Count == 0)
        {
            return "O pedido precisa ter pelo menos um produto.";
        }

        if (Itens.Any(item => item.ProdutoId == "" || item.Quantidade < 1 || item.Quantidade > MaximoDeUnidades))
        {
            return $"Cada produto do pedido pode ter de 1 a {MaximoDeUnidades} unidades.";
        }

        if (Pagamento != "pix" && Pagamento != "card" && Pagamento != "cod")
        {
            return "A forma de pagamento precisa ser \"pix\", \"card\" ou \"cod\".";
        }

        if (Parcelas < 1)
        {
            return "O número de parcelas precisa ser pelo menos 1.";
        }

        if (TrocoPara <= 0)
        {
            return "O valor do troco precisa ser maior que zero.";
        }

        if (AgendadoPara?.Length > 40)
        {
            return "O horário agendado pode ter no máximo 40 caracteres.";
        }

        if (MensagemPresente?.Length > 140)
        {
            return "A mensagem do presente pode ter no máximo 140 caracteres.";
        }

        if (!MaioridadeConfirmada)
        {
            return "Confirme que você tem 18 anos ou mais.";
        }

        return null;
    }
}
