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


    public string? Validar()
    {
        if (string.IsNullOrWhiteSpace(Codigo) || Codigo.Length != 12)
        {
            return "O código do lacre precisa ter 12 caracteres (ex.: VS-7K2M-9QXA).";
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

        return null;
    }

}
