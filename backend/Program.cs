using MySqlConnector;
using VeriSealApi.Dados;

var construtor = WebApplication.CreateBuilder(args);

var textoconexao = construtor.Configuration.GetConnectionString("VeriSeal")
    ?? throw new Exception("Falta a ConectionStrings:VeriSeal no appsettings.json.");

var montadorconexao = new MySqlConnectionStringBuilder(textoconexao)
{
    Password = construtor.Configuration["SenhaBanco"] ?? ""
};

construtor.Services.AddSingleton(new BancoDeDados(montadorconexao.ConnectionString));

construtor.Services.AddSingleton<ClienteCrud>();

var aplicacao = construtor.Build();

aplicacao.MapGet("/api/teste-banco", (BancoDeDados banco) =>
{
    using var conexao = banco.AbrirConexao();
    return Results.Ok("Conexão com o banco de dados estabelecida com sucesso!");
});

aplicacao.MapGet("/api/clientes", (ClienteCrud clienteCrud) =>
{
    return Results.Ok(clienteCrud.Listar());
});

aplicacao.Run();

