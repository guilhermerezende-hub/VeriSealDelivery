using System.Security.Cryptography;
using System.Text;

namespace VeriSealApi.Seguranca;

// Senha e token nunca vão para o banco em texto: o banco guarda só o hash.
public static class Senhas
{
    private const string Algoritmo = "pbkdf2-sha256";
    private const int Iteracoes = 100_000;
    private const int TamanhoDoSal = 16;
    private const int TamanhoDoHash = 32;

    // Formato guardado em administradores.senha_hash:
    // pbkdf2-sha256$100000$<sal em base64>$<hash em base64>
    public static string GerarHash(string senha)
    {
        var sal = RandomNumberGenerator.GetBytes(TamanhoDoSal);
        var hash = Rfc2898DeriveBytes.Pbkdf2(senha, sal, Iteracoes, HashAlgorithmName.SHA256, TamanhoDoHash);
        return $"{Algoritmo}${Iteracoes}${Convert.ToBase64String(sal)}${Convert.ToBase64String(hash)}";
    }

    public static bool Conferir(string senha, string hashGuardado)
    {
        var partes = hashGuardado.Split('$');
        if (partes.Length != 4 || partes[0] != Algoritmo || !int.TryParse(partes[1], out var iteracoes))
        {
            return false;
        }

        byte[] sal;
        byte[] hashEsperado;
        try
        {
            sal = Convert.FromBase64String(partes[2]);
            hashEsperado = Convert.FromBase64String(partes[3]);
        }
        catch (FormatException)
        {
            return false;
        }

        var hashCalculado = Rfc2898DeriveBytes.Pbkdf2(senha, sal, iteracoes, HashAlgorithmName.SHA256, hashEsperado.Length);

        // compara em tempo constante, para não dar pistas pelo tempo de resposta
        return CryptographicOperations.FixedTimeEquals(hashCalculado, hashEsperado);
    }

    // Token entregue no login: 32 bytes aleatórios em hexadecimal (64 caracteres).
    public static string GerarToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
    }

    public static string HashDoToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
    }
}
