using System.Text.RegularExpressions;

namespace VeriSealApi.Modelos;

public class Lacre
{
    public string Codigo { get; set; } = "";
    public string ProdutoId { get; set; } = "";
    public int? PedidoId { get; set; }
    public string Lote { get; set; } = "";
    public DateOnly FabricadoEm { get; set; }
    public string Status { get; set; } = "ok";
    public DateTime? EnviadoEm { get; set; }
    public DateTime? AbertoEm { get; set; }
    public int Verificacoes { get; set; }

    public void Normalizar()
    {
        Codigo = (Codigo ?? "").Trim().ToUpperInvariant();
        ProdutoId = (ProdutoId ?? "").Trim();
        Lote = (Lote ?? "").Trim();
        Status = (Status ?? "").Trim();

        if (Status == "ok")
        {
            AbertoEm = null;
        }
    }

    public string? Validar()
    {
        if (!Regex.IsMatch(Codigo, "^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$"))
        {
            return "O código do lacre precisa seguir o formato VS-XXXX-XXXX (ex.: VS-7K2M-9QXA).";
        }

        if (string.IsNullOrWhiteSpace(ProdutoId))
        {
            return "Informe o produto do lacre.";
        }

        if (string.IsNullOrWhiteSpace(Lote) || Lote.Length > 12)
        {
            return "Informe o lote com até 12 caracteres.";
        }

        if (FabricadoEm == default)
        {
            return "Informe a data de fabricação.";
        }

        if (Status != "ok" && Status != "opened")
        {
            return "O status precisa ser \"ok\" ou \"opened\".";
        }

        if (Status == "opened" && AbertoEm == null)
        {
            return "Informe a data e a hora em que o lacre foi aberto.";
        }

        return null;
    }
}
