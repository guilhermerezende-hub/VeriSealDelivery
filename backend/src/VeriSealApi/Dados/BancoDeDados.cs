using MySqlConnector;

namespace VeriSealApi.Dados;

public class BancoDeDados
{
    private readonly string textoconexao;

    public BancoDeDados(string textoconexao)
    {
        this.textoconexao = textoconexao;
    }

    public MySqlConnection AbrirConexao()
    {
        var conexao = new MySqlConnection(textoconexao);
        conexao.Open();

        // Horário de Brasília: as datas automáticas do banco (criado_em, verificado_em)
        // ficam certas mesmo quando o servidor da hospedagem está em outro fuso.
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SET time_zone = '-03:00'";
        comando.ExecuteNonQuery();

        return conexao;
    }
}