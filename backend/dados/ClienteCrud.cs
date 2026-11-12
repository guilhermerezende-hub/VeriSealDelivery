using MySqlConnector;
using VeriSealApi.Modelos;

namespace VeriSealApi.Dados;

public class ClienteCrud
{
    private readonly BancoDeDados banco;

    public ClienteCrud(BancoDeDados banco)
    {
        this.banco = banco;
    }

    public List<Cliente> Listar()
    {
        var clientes = new List<Cliente>();

        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SELECT Id, usuario_id, nome, telefone, criado_em FROM clientes ORDER BY id";

        using var leitor = comando.ExecuteReader();
        while (leitor.Read())
        {
            clientes.Add(LerCliente(leitor));
        }

        return clientes;
    }

    private static Cliente LerCliente(MySqlDataReader leitor)
    {
        return new Cliente
        {
            Id = leitor.GetInt32("id"),
            UsuarioId = leitor.IsDBNull(leitor.GetOrdinal("usuario_id")) ? null : leitor.GetInt32("usuario_id"),
            Nome = leitor.GetString("nome"),
            Telefone = leitor.GetString("telefone"),
            CriadoEm = leitor.GetDateTime("criado_em")

        };
    }
}