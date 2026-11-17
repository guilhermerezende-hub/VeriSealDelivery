namespace VeriSealApi.Modelos;

public class Verificacao
{
    public string Origem { get; set; } = "codigo";

    public string? Validar()
    {
        if (Origem != "codigo" && Origem != "nfc")
        {
            return "A origem da verificação precisa ser \"codigo\" ou \"nfc\".";
        }

        return null;
    }
}
