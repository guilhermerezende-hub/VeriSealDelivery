namespace VeriSealApi.Modelos;

public class Cliente
{
    public int Id { get; set; }
    public int? UsuarioId { get; set; }
    public string Nome { get; set; } = "";
    public string Telefone { get; set; } = "";
    public DateTime CriadoEm { get; set; }

    public void Normalizar()
    {
        Nome = (Nome ?? "").Trim();
        Telefone = (Telefone ?? "").Trim();
    }

    public string? Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome) || string.IsNullOrWhiteSpace(Telefone))
        {
            return "Nome e telefone são obrigatórios.";
        }

        if (Nome.Length > 100)
        {
            return "O nome pode ter no máximo 100 caracteres.";
        }

        var numerosDoTelefone = Telefone.Count(char.IsDigit);
        if (numerosDoTelefone < 10 || numerosDoTelefone > 13 || Telefone.Length > 20)
        {
            return "Informe um telefone com DDD (ex.: (11) 98765-4321).";
        }

        return null;
    }
}
