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
        return conexao;
    }
}