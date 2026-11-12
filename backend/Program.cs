using MySqlConnector;
using VeriSealApi.Dados;
using VeriSealApi.Modelos;

var construtor = WebApplication.CreateBuilder(args);

var textoconexao = construtor.Configuration.GetConnectionString("VeriSeal")
    ?? throw new Exception("Falta a ConnectionStrings:VeriSeal no appsettings.json.");

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

aplicacao.MapGet("/api/clientes/{id}", (int id, ClienteCrud clienteCrud) =>
{
    var cliente = clienteCrud.BuscarPorId(id);
    if (cliente == null)
    {
        return Results.NotFound("Cliente não encontrado.");
    }

    return Results.Ok(cliente);
});

aplicacao.MapPost("/api/clientes", (Cliente cliente, ClienteCrud clienteCrud) =>
{
    if (string.IsNullOrWhiteSpace(cliente.Nome) || string.IsNullOrWhiteSpace(cliente.Telefone))
    {
        return Results.BadRequest("Nome e telefone são obrigatórios.");
    }

    var novoId = clienteCrud.Criar(cliente);
    return Results.Created($"/api/clientes/{novoId}", clienteCrud.BuscarPorId(novoId));
});

aplicacao.MapPut("/api/clientes/{id}", (int id, Cliente cliente, ClienteCrud clienteCrud) =>
{
    if (string.IsNullOrWhiteSpace(cliente.Nome) || string.IsNullOrWhiteSpace(cliente.Telefone))
    {
        return Results.BadRequest("Nome e telefone são obrigatórios.");
    }

    var atualizou = clienteCrud.Atualizar(id, cliente);
    if (!atualizou)
    {
        return Results.NotFound("Cliente não foi encontrado");
    }

    return Results.Ok(clienteCrud.BuscarPorId(id));
});

aplicacao.MapDelete("/api/clientes/{id}", (int id, ClienteCrud clienteCrud) =>
{
    try
    {
        var deletou = clienteCrud.Deletar(id);
        if (!deletou)
        {
            return Results.NotFound("Cliente não foi encontrado");
        }

        return Results.NoContent();
    }
        catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.RowIsReferenced2)
        {
            return Results.Conflict("Esse cliente tem endereços ou pedidos cadastrados e não pode ser excluído.");

        }
});

aplicacao.Run();
