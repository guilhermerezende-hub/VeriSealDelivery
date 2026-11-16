namespace VeriSealApi.Modelos;

// Endereço de entrega de um pedido (tabela enderecos).
public class Endereco
{
    public string Cep { get; set; } = "";
    public string Rua { get; set; } = "";
    public string Numero { get; set; } = "";
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }

    public void Normalizar()
    {
        // CEP sempre no formato 00000-000
        var numerosDoCep = new string((Cep ?? "").Where(char.IsDigit).ToArray());
        Cep = numerosDoCep.Length == 8 ? $"{numerosDoCep[..5]}-{numerosDoCep[5..]}" : numerosDoCep;
        Rua = (Rua ?? "").Trim();
        Numero = (Numero ?? "").Trim();
        Complemento = TextoOuNulo(Complemento);
        Bairro = TextoOuNulo(Bairro);
        Cidade = TextoOuNulo(Cidade);
        Uf = TextoOuNulo(Uf)?.ToUpperInvariant();
    }

    public string? Validar()
    {
        if (Cep.Length != 9)
        {
            return "Informe um CEP com 8 números.";
        }

        if (string.IsNullOrEmpty(Rua) || Rua.Length > 120)
        {
            return "Informe a rua (até 120 caracteres).";
        }

        if (string.IsNullOrEmpty(Numero) || Numero.Length > 10)
        {
            return "Informe o número do endereço (até 10 caracteres).";
        }

        if (string.IsNullOrEmpty(Bairro) || Bairro.Length > 60 || string.IsNullOrEmpty(Cidade) || Cidade.Length > 60)
        {
            return "Informe o bairro e a cidade (até 60 caracteres cada).";
        }

        if (Complemento?.Length > 60)
        {
            return "O complemento pode ter no máximo 60 caracteres.";
        }

        if (Uf != null && (Uf.Length != 2 || !Uf.All(char.IsAsciiLetterUpper)))
        {
            return "A UF precisa ter 2 letras (ex.: SP).";
        }

        return null;
    }

    private static string? TextoOuNulo(string? texto)
    {
        return string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();
    }
}
