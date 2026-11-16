namespace VeriSealApi.Modelos;

public class Administrador
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CriadoEm { get; set; }
    public DateTime? UltimoAcesso { get; set; }
}

// Corpo do POST /api/admin/login (admin.html).
public class LoginAdministrador
{
    public string Email { get; set; } = "";
    public string Senha { get; set; } = "";

    public void Normalizar()
    {
        Email = (Email ?? "").Trim().ToLowerInvariant();
        Senha ??= "";
    }

    public string? Validar()
    {
        if (string.IsNullOrEmpty(Email) || string.IsNullOrEmpty(Senha))
        {
            return "Informe o e-mail e a senha.";
        }

        if (Email.Length > 254 || Senha.Length > 200)
        {
            return "E-mail ou senha incorretos.";
        }

        return null;
    }
}
