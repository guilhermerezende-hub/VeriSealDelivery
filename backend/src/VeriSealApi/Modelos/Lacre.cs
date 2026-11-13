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
}