using System.Text.RegularExpressions;

namespace VeriSealApi.Modelos;

public class AvisoMarca
{
    public int Id { get; set; }
    public string LacreCodigo { get; set; } = "";
    public string Motivo { get; set; } = "";
    public string Status { get; set; } = "aberto";
    public DateTime CriadoEm { get; set; }

    public void Normalizar()
    {
        LacreCodigo = (LacreCodigo ?? "").Trim().ToUpperInvariant();
        Motivo = (Motivo ?? "").Trim();
    }

    public string? Validar()
    {
        if (!Regex.IsMatch(LacreCodigo, "^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$"))
        {
            return "O código do lacre precisa seguir o formato VS-XXXX-XXXX.";
        }

        if (Motivo != "nao_encontrado" && Motivo != "violado")
        {
            return "O motivo precisa ser \"nao_encontrado\" ou \"violado\".";
        }

        return null;
    }
}
