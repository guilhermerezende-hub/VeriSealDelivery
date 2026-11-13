namespace VeriSealApi.Modelos;

public class Cliente
{
    public int Id { get; set; }
    public int? UsuarioId { get; set; }
    public string Nome { get; set; } = "";
    public string Telefone { get; set; } = "";
    public DateTime CriadoEm { get; set; }
}