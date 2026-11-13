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
construtor.Services.AddSingleton<LacreCrud>();


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

aplicacao.MapGet("/api/lacres", (LacreCrud lacreCrud) =>
{
    return Results.Ok(lacreCrud.Listar());
});

aplicacao.MapGet("/api/lacres/{codigo}", (string codigo, LacreCrud lacreCrud) =>
{
    var lacre = lacreCrud.BuscarPorCodigo(codigo);
    if (lacre == null)
    {
        return Results.NotFound("Lacre não encontrado.");
    }

    return Results.Ok(lacre);
});

aplicacao.MapPost("/api/lacres", (Lacre lacre, LacreCrud lacreCrud) =>
{
    var erroValidacao = lacre.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    try
    {
        lacreCrud.Criar(lacre);
        return Results.Created($"/api/lacres/{lacre.Codigo}", lacreCrud.BuscarPorCodigo(lacre.Codigo));
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.DuplicateKeyEntry)
    {
        return Results.Conflict("Já existe um lacre com esse código.");
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.NoReferencedRow2)
    {
        return Results.BadRequest("Produto ou pedido não encontrado.");
    }
});

aplicacao.MapPut("/api/lacres/{codigo}", (string codigo, Lacre lacre, LacreCrud lacreCrud) =>
{
    lacre.Codigo = codigo;

    var erroValidacao = lacre.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    try
    {
        var atualizou = lacreCrud.Atualizar(codigo, lacre);
        if (!atualizou)
        {
            return Results.NotFound("Lacre não encontrado.");
        }

        return Results.Ok(lacreCrud.BuscarPorCodigo(codigo));
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.NoReferencedRow2)
    {
        return Results.BadRequest("Produto ou pedido não encontrado.");
    }
});

aplicacao.MapDelete("/api/lacres/{codigo}", (string codigo, LacreCrud lacreCrud) =>
{
    try
    {
        var deletou = lacreCrud.Deletar(codigo);
        if (!deletou)
        {
            return Results.NotFound("Lacre não encontrado.");
        }

        return Results.NoContent();
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.RowIsReferenced2)
    {
        return Results.Conflict("Esse lacre já tem verificações registradas e não pode ser excluído.");
    }
});

aplicacao.Run();
