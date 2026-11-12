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
    
    public Cliente? BuscarPorId(int id)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SELECT Id, usuario_id, nome, telefone, criado_em FROM clientes WHERE id = @id";
        comando.Parameters.AddWithValue("@id", id);

        using var leitor = comando.ExecuteReader();
        if (leitor.Read())
        {
            return LerCliente(leitor);
        }

        return null;
    }

    public int Criar(Cliente cliente)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "INSERT INTO clientes (usuario_id, nome, telefone) VALUES (@usuario_id, @nome, @telefone)";
        comando.Parameters.AddWithValue("@usuario_id", cliente.UsuarioId);
        comando.Parameters.AddWithValue("@nome", cliente.Nome);
        comando.Parameters.AddWithValue("@telefone", cliente.Telefone);
        comando.ExecuteNonQuery();

        return (int)comando.LastInsertedId;
    }

    public bool Atualizar(int id, Cliente cliente)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "UPDATE clientes SET nome = @nome, telefone = @telefone WHERE id = @id";
        comando.Parameters.AddWithValue("@nome", cliente.Nome);
        comando.Parameters.AddWithValue("@telefone", cliente.Telefone);
        comando.Parameters.AddWithValue("@id", id);

        var linhasAfetadas = comando.ExecuteNonQuery();
        return linhasAfetadas > 0;
    }

    public bool Deletar(int id)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "DELETE FROM clientes WHERE id = @id";
        comando.Parameters.AddWithValue("@id", id);

        var linhasAfetadas = comando.ExecuteNonQuery();
        return linhasAfetadas > 0;
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