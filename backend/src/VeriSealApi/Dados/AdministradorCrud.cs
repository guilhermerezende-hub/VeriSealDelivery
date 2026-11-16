using MySqlConnector;
using VeriSealApi.Modelos;
using VeriSealApi.Seguranca;

namespace VeriSealApi.Dados;

public class AdministradorCrud
{
    // Quanto tempo um login no painel vale antes de pedir a senha de novo.
    private const int HorasDaSessao = 12;

    private readonly BancoDeDados banco;

    public AdministradorCrud(BancoDeDados banco)
    {
        this.banco = banco;
    }

    // Chamado quando a API liga, com o "AdminInicial" do appsettings: cria o administrador
    // na primeira vez e, nas próximas, deixa a senha do banco igual à da configuração.
    public void GarantirAdministrador(string nome, string email, string senha)
    {
        email = email.Trim().ToLowerInvariant();
        var existente = BuscarParaLogin(email);

        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();

        if (existente == null)
        {
            comando.CommandText = "INSERT INTO administradores (nome, email, senha_hash) VALUES (@nome, @email, @senha_hash)";
        }
        else if (existente.Value.Administrador.Nome != nome || !Senhas.Conferir(senha, existente.Value.SenhaHash))
        {
            comando.CommandText = "UPDATE administradores SET nome = @nome, senha_hash = @senha_hash WHERE email = @email";
        }
        else
        {
            return;
        }

        comando.Parameters.AddWithValue("@nome", nome);
        comando.Parameters.AddWithValue("@email", email);
        comando.Parameters.AddWithValue("@senha_hash", Senhas.GerarHash(senha));
        comando.ExecuteNonQuery();
    }

    public (Administrador Administrador, string SenhaHash)? BuscarParaLogin(string email)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "SELECT id, nome, email, criado_em, ultimo_acesso, senha_hash FROM administradores WHERE email = @email";
        comando.Parameters.AddWithValue("@email", email);

        using var leitor = comando.ExecuteReader();
        if (leitor.Read())
        {
            return (LerAdministrador(leitor), leitor.GetString("senha_hash"));
        }

        return null;
    }

    // Login certo: cria a sessão e devolve o token (o banco guarda só o hash dele).
    public string CriarSessao(int administradorId)
    {
        var token = Senhas.GerarToken();

        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText =
            "DELETE FROM sessoes_admin WHERE expira_em < NOW(); " +
            "INSERT INTO sessoes_admin (token_hash, administrador_id, expira_em) " +
            $"VALUES (@token_hash, @administrador_id, NOW() + INTERVAL {HorasDaSessao} HOUR); " +
            "UPDATE administradores SET ultimo_acesso = NOW() WHERE id = @administrador_id;";
        comando.Parameters.AddWithValue("@token_hash", Senhas.HashDoToken(token));
        comando.Parameters.AddWithValue("@administrador_id", administradorId);
        comando.ExecuteNonQuery();

        return token;
    }

    public Administrador? BuscarPelaSessao(string token)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText =
            "SELECT a.id, a.nome, a.email, a.criado_em, a.ultimo_acesso " +
            "FROM sessoes_admin s JOIN administradores a ON a.id = s.administrador_id " +
            "WHERE s.token_hash = @token_hash AND s.expira_em > NOW()";
        comando.Parameters.AddWithValue("@token_hash", Senhas.HashDoToken(token));

        using var leitor = comando.ExecuteReader();
        if (leitor.Read())
        {
            return LerAdministrador(leitor);
        }

        return null;
    }

    public void EncerrarSessao(string token)
    {
        using var conexao = banco.AbrirConexao();
        using var comando = conexao.CreateCommand();
        comando.CommandText = "DELETE FROM sessoes_admin WHERE token_hash = @token_hash";
        comando.Parameters.AddWithValue("@token_hash", Senhas.HashDoToken(token));
        comando.ExecuteNonQuery();
    }

    private static Administrador LerAdministrador(MySqlDataReader leitor)
    {
        return new Administrador
        {
            Id = leitor.GetInt32("id"),
            Nome = leitor.GetString("nome"),
            Email = leitor.GetString("email"),
            CriadoEm = leitor.GetDateTime("criado_em"),
            UltimoAcesso = leitor.IsDBNull(leitor.GetOrdinal("ultimo_acesso")) ? null : leitor.GetDateTime("ultimo_acesso")
        };
    }
}
