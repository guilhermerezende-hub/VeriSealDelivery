using MySqlConnector;
using VeriSealApi.Modelos;

namespace VeriSealApi.Dados;

public class LacreCrud
{
    private readonly BancoDeDados banco;
    
    public LacreCrud(BancoDeDados banco)
    {
        this.banco = banco;
    }

    public List<Lacre> Listar()
    {
        var lacres = new List<Lacre>();

        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SELECT codigo, produto_id, pedido_id, lote, fabricado_em, status, enviado_em, aberto_em FROM lacres ORDER BY codigo";

        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            lacres.Add(LerLacre(leitor));
        }

        return lacres;
    }
}