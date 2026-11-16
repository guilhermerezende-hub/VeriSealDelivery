using VeriSealApi.Dados;

namespace VeriSealApi.Seguranca;

// Fica nas rotas do painel: só deixa passar quem mandou, no cabeçalho
// "Authorization: Bearer <token>", o token de um login de administrador ainda válido.
public class FiltroAdministrador : IEndpointFilter
{
    private readonly AdministradorCrud administradorCrud;

    public FiltroAdministrador(AdministradorCrud administradorCrud)
    {
        this.administradorCrud = administradorCrud;
    }

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext contexto, EndpointFilterDelegate proximo)
    {
        var token = LerToken(contexto.HttpContext.Request);
        var administrador = token == null ? null : administradorCrud.BuscarPelaSessao(token);

        if (administrador == null)
        {
            return Results.Json(
                "Entre com a conta de administrador para continuar.",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        // a rota pode saber quem está logado (ex.: GET /api/admin/eu)
        contexto.HttpContext.Items["administrador"] = administrador;
        return await proximo(contexto);
    }

    public static string? LerToken(HttpRequest requisicao)
    {
        const string prefixo = "Bearer ";
        var cabecalho = requisicao.Headers.Authorization.ToString();
        if (!cabecalho.StartsWith(prefixo, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var token = cabecalho[prefixo.Length..].Trim();
        return token.Length == 0 ? null : token;
    }
}
