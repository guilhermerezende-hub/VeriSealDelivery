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
        comando.CommandText = "SELECT codigo, produto_id, pedido_id, lote, fabricado_em, status, enviado_em, aberto_em FROM lacres ORDER BY fabricado_em DESC";

        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            lacres.Add(LerLacre(leitor));
        }

        return lacres;
    }

    public Lacre? BuscarPorCodigo(string codigo)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SELECT codigo, produto_id, pedido_id, lote, fabricado_em, status, enviado_em, aberto_em FROM lacres WHERE codigo = @codigo";
        comando.Parameters.AddWithValue("@codigo", codigo);

        using var leitor = comando.ExecuteReader();
        if (leitor.Read())
        {
            return LerLacre(leitor);
        }

        return null;
    }

    public void Criar(Lacre lacre)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "INSERT INTO lacres (codigo, produto_id, pedido_id, lote, fabricado_em, status, enviado_em, aberto_em) VALUES (@codigo, @produto_id, @pedido_id, @lote, @fabricado_em, @status, @enviado_em, @aberto_em)";
        comando.Parameters.AddWithValue("@codigo", lacre.Codigo);
        comando.Parameters.AddWithValue("@produto_id", lacre.ProdutoId);
        comando.Parameters.AddWithValue("@pedido_id", lacre.PedidoId);
        comando.Parameters.AddWithValue("@lote", lacre.Lote);
        comando.Parameters.AddWithValue("@fabricado_em", lacre.FabricadoEm);
        comando.Parameters.AddWithValue("@status", lacre.Status);
        comando.Parameters.AddWithValue("@enviado_em", lacre.EnviadoEm);
        comando.Parameters.AddWithValue("@aberto_em", lacre.AbertoEm);
        comando.ExecuteNonQuery();
    }

        public bool Atualizar(string codigo, Lacre lacre)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "UPDATE lacres SET produto_id = @produto_id, pedido_id = @pedido_id, lote = @lote, fabricado_em = @fabricado_em, status = @status, enviado_em = @enviado_em, aberto_em = @aberto_em WHERE codigo = @codigo";
        comando.Parameters.AddWithValue("@produto_id", lacre.ProdutoId);
        comando.Parameters.AddWithValue("@pedido_id", lacre.PedidoId);
        comando.Parameters.AddWithValue("@lote", lacre.Lote);
        comando.Parameters.AddWithValue("@fabricado_em", lacre.FabricadoEm);
        comando.Parameters.AddWithValue("@status", lacre.Status);
        comando.Parameters.AddWithValue("@enviado_em", lacre.EnviadoEm);
        comando.Parameters.AddWithValue("@aberto_em", lacre.AbertoEm);
        comando.Parameters.AddWithValue("@codigo", codigo);

        var linhasAfetadas = comando.ExecuteNonQuery();
        return linhasAfetadas > 0;
    }

    public bool Deletar(string codigo)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "DELETE FROM lacres WHERE codigo = @codigo";
        comando.Parameters.AddWithValue("@codigo", codigo);

        var linhasAfetadas = comando.ExecuteNonQuery();
        return linhasAfetadas > 0;
    }

    private static Lacre LerLacre(MySqlDataReader leitor)
    {
        return new Lacre
        {
            Codigo = leitor.GetString("codigo"),
            ProdutoId = leitor.GetString("produto_id"),
            PedidoId = leitor.IsDBNull(leitor.GetOrdinal("pedido_id")) ? null : leitor.GetInt32("pedido_id"),
            Lote = leitor.GetString("lote"),
            FabricadoEm = leitor.GetDateOnly("fabricado_em"),
            Status = leitor.GetString("status"),
            EnviadoEm = leitor.IsDBNull(leitor.GetOrdinal("enviado_em")) ? null : leitor.GetDateTime("enviado_em"),
            AbertoEm = leitor.IsDBNull(leitor.GetOrdinal("aberto_em")) ? null : leitor.GetDateTime("aberto_em")
        };
    }
}
