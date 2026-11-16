using Microsoft.Extensions.FileProviders;
using MySqlConnector;
using VeriSealApi.Dados;
using VeriSealApi.Modelos;
using VeriSealApi.Seguranca;

var construtor = WebApplication.CreateBuilder(args);

var textoconexao = construtor.Configuration.GetConnectionString("VeriSeal")
    ?? throw new Exception("Falta a ConnectionStrings:VeriSeal no appsettings.json.");

// No computador a senha vem dos user-secrets (SenhaBanco). Na hospedagem ela já vem
// dentro da ConnectionStrings do appsettings.Production.json, criado só no servidor.
// No GitHub Codespaces ela vem da variável de ambiente SenhaBanco (.devcontainer).
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
construtor.Services.AddSingleton<PedidoCrud>();
construtor.Services.AddSingleton<AdministradorCrud>();

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

// Administrador do painel: vem do "AdminInicial" do appsettings. Na primeira vez a API
// cria a conta; depois, a senha do banco fica sempre igual à da configuração.
var adminInicial = aplicacao.Configuration.GetSection("AdminInicial");
if (!string.IsNullOrEmpty(adminInicial["Email"]) && !string.IsNullOrEmpty(adminInicial["Senha"]))
{
    try
    {
        aplicacao.Services.GetRequiredService<AdministradorCrud>().GarantirAdministrador(
            adminInicial["Nome"] ?? "Administrador", adminInicial["Email"]!, adminInicial["Senha"]!);
    }
    catch (MySqlException erro)
    {
        aplicacao.Logger.LogWarning(
            "Não consegui preparar o administrador do painel: {Mensagem}. Se faltar a tabela administradores, " +
            "rode database/atualizacoes/2026-11-15-login-administrador.sql no DBeaver e reinicie a API.", erro.Message);
    }
}

// No GitHub Codespaces a própria API também mostra o site (pasta frontend/): o mesmo
// endereço abre as páginas e responde em /api, sem precisar de outro servidor.
var pastaDoSite = aplicacao.Configuration["PastaDoSite"];
if (!string.IsNullOrEmpty(pastaDoSite))
{
    var arquivosDoSite = new PhysicalFileProvider(Path.GetFullPath(Path.Combine(aplicacao.Environment.ContentRootPath, pastaDoSite)));

    // só as partes públicas do site; node_modules, tests, scripts etc. ficam de fora
    string[] partesPublicas = ["assets", "js", "produtos", "styles", "index.html", "login.html", "sobre.html", "entregadores.html", "painel.html", "admin.html"];
    aplicacao.Use(async (contexto, proximo) =>
    {
        var primeiraParte = contexto.Request.Path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        if (primeiraParte != null && primeiraParte != "api" && !partesPublicas.Contains(primeiraParte))
        {
            contexto.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        await proximo();
    });

    aplicacao.UseDefaultFiles(new DefaultFilesOptions { FileProvider = arquivosDoSite });
    aplicacao.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = arquivosDoSite,
        // HTML e JS sempre conferidos de novo, para uma mudança aparecer na hora
        OnPrepareResponse = arquivo => arquivo.Context.Response.Headers.CacheControl = "no-cache"
    });
}
else
{
    aplicacao.MapGet("/", () =>
    {
        return Results.Ok(new { api = "VeriSeal Delivery", status = "no ar" });
    });
}

aplicacao.MapGet("/api", () =>
{
    return Results.Ok(new { api = "VeriSeal Delivery", status = "no ar" });
});

aplicacao.MapGet("/api/teste-banco", (BancoDeDados banco) =>
{
    using var conexao = banco.AbrirConexao();
    return Results.Ok("Conexão com o banco de dados estabelecida com sucesso!");
});

// Rotas do painel da loja: só respondem para quem entrou com a conta de administrador
// (cabeçalho "Authorization: Bearer <token>", ver Seguranca/FiltroAdministrador.cs).
var painel = aplicacao.MapGroup("/api").AddEndpointFilter<FiltroAdministrador>();

// Login do administrador -------------------------------------------------------

aplicacao.MapPost("/api/admin/login", (LoginAdministrador login, AdministradorCrud administradorCrud) =>
{
    login.Normalizar();

    var erroValidacao = login.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    var encontrado = administradorCrud.BuscarParaLogin(login.Email);
    if (encontrado == null || !Senhas.Conferir(login.Senha, encontrado.Value.SenhaHash))
    {
        return Results.Json("E-mail ou senha incorretos.", statusCode: StatusCodes.Status401Unauthorized);
    }

    var administrador = encontrado.Value.Administrador;
    var token = administradorCrud.CriarSessao(administrador.Id);
    return Results.Ok(new { token, nome = administrador.Nome, email = administrador.Email });
});

painel.MapGet("/admin/eu", (HttpContext contexto) =>
{
    return Results.Ok(contexto.Items["administrador"]);
});

painel.MapPost("/admin/sair", (HttpContext contexto, AdministradorCrud administradorCrud) =>
{
    administradorCrud.EncerrarSessao(FiltroAdministrador.LerToken(contexto.Request)!);
    return Results.NoContent();
});

// Pedidos -------------------------------------------------------------------

// Checkout da loja: qualquer visitante pode fazer um pedido, sem login.
aplicacao.MapPost("/api/pedidos", (NovoPedido novoPedido, PedidoCrud pedidoCrud) =>
{
    novoPedido.Normalizar();

    var erroValidacao = novoPedido.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    try
    {
        var pedido = pedidoCrud.Criar(novoPedido);
        return Results.Created($"/api/pedidos/{pedido.Id}", pedido);
    }
    catch (ArgumentException erro)
    {
        return Results.BadRequest(erro.Message);
    }
});

painel.MapGet("/pedidos", (PedidoCrud pedidoCrud) =>
{
    return Results.Ok(pedidoCrud.Listar());
});

painel.MapGet("/pedidos/{id}", (int id, PedidoCrud pedidoCrud) =>
{
    var pedido = pedidoCrud.BuscarPorId(id);
    if (pedido == null)
    {
        return Results.NotFound("Pedido não encontrado.");
    }

    return Results.Ok(pedido);
});

painel.MapPut("/pedidos/{id}/status", (int id, MudancaDeStatus mudanca, PedidoCrud pedidoCrud) =>
{
    var erroValidacao = mudanca.Validar();
    if (erroValidacao != null)
    {
        return Results.BadRequest(erroValidacao);
    }

    var atualizou = pedidoCrud.AtualizarStatus(id, mudanca.Status);
    if (!atualizou)
    {
        return Results.NotFound("Pedido não encontrado.");
    }

    return Results.Ok(pedidoCrud.BuscarPorId(id));
});

// Clientes ------------------------------------------------------------------

painel.MapGet("/clientes", (ClienteCrud clienteCrud) =>
{
    return Results.Ok(clienteCrud.Listar());
});

painel.MapGet("/clientes/{id}", (int id, ClienteCrud clienteCrud) =>
{
    var cliente = clienteCrud.BuscarPorId(id);
    if (cliente == null)
    {
        return Results.NotFound("Cliente não encontrado.");
    }

    return Results.Ok(cliente);
});

painel.MapPost("/clientes", (Cliente cliente, ClienteCrud clienteCrud) =>
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

painel.MapPut("/clientes/{id}", (int id, Cliente cliente, ClienteCrud clienteCrud) =>
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

painel.MapDelete("/clientes/{id}", (int id, ClienteCrud clienteCrud) =>
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

painel.MapGet("/lacres", (LacreCrud lacreCrud) =>
{
    return Results.Ok(lacreCrud.Listar());
});

painel.MapGet("/lacres/{codigo}", (string codigo, LacreCrud lacreCrud) =>
{
    var lacre = lacreCrud.BuscarPorCodigo(codigo);
    if (lacre == null)
    {
        return Results.NotFound("Lacre não encontrado.");
    }

    return Results.Ok(lacre);
});

painel.MapPost("/lacres", (Lacre lacre, LacreCrud lacreCrud) =>
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

painel.MapPut("/lacres/{codigo}", (string codigo, Lacre lacre, LacreCrud lacreCrud) =>
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

painel.MapDelete("/lacres/{codigo}", (string codigo, LacreCrud lacreCrud) =>
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

painel.MapGet("/avisos", (AvisoCrud avisoCrud) =>
{
    return Results.Ok(avisoCrud.Listar());
});

aplicacao.Run();
