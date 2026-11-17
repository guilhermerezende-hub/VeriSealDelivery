using MySqlConnector;
using VeriSealApi.Dados;
using VeriSealApi.Modelos;

var construtor = WebApplication.CreateBuilder(args);

var textoconexao = construtor.Configuration.GetConnectionString("VeriSeal")
    ?? throw new Exception("Falta a ConnectionStrings:VeriSeal no appsettings.json.");

// No computador a senha vem dos user-secrets (SenhaBanco). Na hospedagem ela já vem
// dentro da ConnectionStrings do appsettings.Production.json, criado só no servidor.
var montadorconexao = new MySqlConnectionStringBuilder(textoconexao);
var senhaBanco = construtor.Configuration["SenhaBanco"];
if (!string.IsNullOrEmpty(senhaBanco))
{
    montadorconexao.Password = senhaBanco;
}

construtor.Services.AddSingleton(new BancoDeDados(montadorconexao.ConnectionString));

construtor.Services.AddSingleton<ClienteCrud>();
construtor.Services.AddSingleton<LacreCrud>();
construtor.Services.AddSingleton<AvisoCrud>();

// Endereços do site que podem chamar a API (CORS). Ficam no appsettings de cada ambiente.
var origensDoSite = construtor.Configuration.GetSection("OrigensDoSite").Get<string[]>() ?? [];
construtor.Services.AddCors(opcoes =>
{
    opcoes.AddPolicy("site", politica =>
    {
        politica.WithOrigins(origensDoSite)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

construtor.Services.AddProblemDetails();

var aplicacao = construtor.Build();

aplicacao.UseExceptionHandler();
aplicacao.UseCors("site");

aplicacao.MapGet("/", () =>
{
    return Results.Ok(new { api = "VeriSeal Delivery", status = "no ar" });
});

aplicacao.MapGet("/api/teste-banco", (BancoDeDados banco) =>
{
    using var conexao = banco.AbrirConexao();
    return Results.Ok("Conexão com o banco de dados estabelecida com sucesso!");
});

// Clientes ------------------------------------------------------------------

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
    cliente.Normalizar();

    var erroValidacao = cliente.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    try
    {
        var novoId = clienteCrud.Criar(cliente);
        return Results.Created($"/api/clientes/{novoId}", clienteCrud.BuscarPorId(novoId));
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.NoReferencedRow2)
    {
        return Results.BadRequest("Usuário não encontrado.");
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.DuplicateKeyEntry)
    {
        return Results.Conflict("Esse usuário já tem um cadastro de cliente.");
    }
});

aplicacao.MapPut("/api/clientes/{id}", (int id, Cliente cliente, ClienteCrud clienteCrud) =>
{
    cliente.Normalizar();

    var erroValidacao = cliente.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    var atualizou = clienteCrud.Atualizar(id, cliente);
    if (!atualizou)
    {
        return Results.NotFound("Cliente não encontrado.");
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
            return Results.NotFound("Cliente não encontrado.");
        }

        return Results.NoContent();
    }
    catch (MySqlException erro) when (erro.ErrorCode == MySqlErrorCode.RowIsReferenced2)
    {
        return Results.Conflict("Esse cliente tem endereços ou pedidos cadastrados e não pode ser excluído.");
    }
});

// Lacres --------------------------------------------------------------------

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
    lacre.Normalizar();

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
    lacre.Normalizar();

    var erroValidacao = lacre.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    try
    {
        var atualizou = lacreCrud.Atualizar(lacre.Codigo, lacre);
        if (!atualizou)
        {
            return Results.NotFound("Lacre não encontrado.");
        }

        return Results.Ok(lacreCrud.BuscarPorCodigo(lacre.Codigo));
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

// Verificação feita no site: grava a leitura e devolve o lacre atualizado.
aplicacao.MapPost("/api/lacres/{codigo}/verificacoes", (string codigo, Verificacao verificacao, LacreCrud lacreCrud) =>
{
    var erroValidacao = verificacao.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    var registrou = lacreCrud.RegistrarVerificacao(codigo, verificacao.Origem);
    if (!registrou)
    {
        return Results.NotFound("Lacre não encontrado.");
    }

    return Results.Ok(lacreCrud.BuscarPorCodigo(codigo));
});

// Botão "Avisar a marca" do resultado da verificação.
aplicacao.MapPost("/api/avisos", (AvisoMarca aviso, AvisoCrud avisoCrud) =>
{
    aviso.Normalizar();

    var erroValidacao = aviso.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    var novoId = avisoCrud.Criar(aviso);
    return Results.Created($"/api/avisos/{novoId}", new { id = novoId, lacreCodigo = aviso.LacreCodigo, motivo = aviso.Motivo, status = "aberto" });
});

aplicacao.MapGet("/api/avisos", (AvisoCrud avisoCrud) =>
{
    return Results.Ok(avisoCrud.Listar());
});

aplicacao.Run();
