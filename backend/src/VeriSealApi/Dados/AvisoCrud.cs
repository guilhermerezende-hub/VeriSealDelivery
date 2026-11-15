using MySqlConnector;
using VeriSealApi.Modelos;

namespace VeriSealApi.Dados;

public class AvisoCrud
{
    private readonly BancoDeDados banco;

    public AvisoCrud(BancoDeDados banco)
    {
        this.banco = banco;
    }

    public List<AvisoMarca> Listar()
    {
        var avisos = new List<AvisoMarca>();

        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SELECT id, lacre_codigo, motivo, status, criado_em FROM avisos_marca ORDER BY criado_em DESC, id DESC";

        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            avisos.Add(LerAviso(leitor));
        }

        return avisos;
    }

    public int Criar(AvisoMarca aviso)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "INSERT INTO avisos_marca (lacre_codigo, motivo) VALUES (@lacre_codigo, @motivo)";
        comando.Parameters.AddWithValue("@lacre_codigo", aviso.LacreCodigo);
        comando.Parameters.AddWithValue("@motivo", aviso.Motivo);
        comando.ExecuteNonQuery();

        return (int)comando.LastInsertedId;
    }

    private static AvisoMarca LerAviso(MySqlDataReader leitor)
    {
        return new AvisoMarca
        {
            Id = leitor.GetInt32("id"),
            LacreCodigo = leitor.GetString("lacre_codigo"),
            Motivo = leitor.GetString("motivo"),
            Status = leitor.GetString("status"),
            CriadoEm = leitor.GetDateTime("criado_em")
        };
    }
}
