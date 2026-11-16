# Hospedagem da VeriSeal Delivery

Guia para publicar o projeto na internet e gerar as evidências de deploy por FileZilla
(roteiro da matéria em `Forma de hospedar/Evidencias_Deploy_App_FileZilla.docx`).

## Como fica no ar

```text
 Navegador                    HostGator                         MonsterASP.NET (grátis)
 ─────────                    ─────────                         ───────────────────────
 https://SEU-DOMINIO  ──────▶ site (HTML, CSS, JS)
                              pasta public_html
        │
        │ fetch + JSON (HTTPS)
        └───────────────────────────────────────────────────▶  API em C# (.NET 10)
                                                                https://SEU-APP.runasp.net
                                                                        │ SQL
                                                                        ▼
                                                                MySQL (banco dbXXXX)
```

- **Site → HostGator.** O plano de hospedagem de sites da HostGator é Linux com cPanel e PHP.
  Ele serve muito bem o site estático, mas **não roda .NET**. Por isso a API não fica lá.
- **API + banco → MonsterASP.NET.** O plano grátis roda ASP.NET Core no .NET 10, tem um banco
  MySQL e também recebe os arquivos pelo **FileZilla**. Assim, os dois deploys seguem o mesmo
  roteiro de evidências.
- O site chama a API pelo endereço público com HTTPS. A API só aceita chamadas vindas do
  domínio do site (CORS, configurado em `OrigensDoSite`).

| O que | Onde está no projeto | Para onde vai |
| --- | --- | --- |
| Site pronto | `frontend/dist/` (gerado por `npm run dist`) | HostGator → `public_html/` |
| API compilada | `backend/publish/` (gerado por `dotnet publish`) | MonsterASP → `wwwroot/` |
| Configuração da API com a senha | `backend/publish/appsettings.Production.json` (criado na hora, fora do Git) | MonsterASP → `wwwroot/` |
| Banco (estrutura + dados) | `database/hospedagem/veriseal-hospedagem.sql` (gerado) | MySQL do MonsterASP |

## Antes de começar

- Node.js 22+ e .NET SDK 10 instalados (os mesmos usados no desenvolvimento).
- FileZilla instalado.
- Acesso ao cPanel da HostGator (domínio, contas FTP e SSL).
- Uma conta grátis no MonsterASP.NET (https://www.monsterasp.net, sem cartão de crédito).
- `database/dados.sql` presente no computador. Ele não vai para o Git; está só na máquina.

> **Senhas:** nenhuma senha vai para o Git nem para arquivos do projeto versionados.
> A senha do banco da hospedagem fica só em `appsettings.Production.json`, que está no
> `.gitignore` e é enviado direto para o servidor.

## Etapa 1: banco e site da API no MonsterASP

1. Entre no painel (https://admin.monsterasp.net) e crie um **website** grátis.
   Anote o endereço, por exemplo `https://veriseal.runasp.net`.
2. **Peça o HTTPS logo no começo.** No plano grátis a ativação é manual: abra um chamado
   no suporte pedindo HTTPS (Let's Encrypt) para o subdomínio. Pode levar algumas horas,
   e no plano grátis a renovação também é manual, a cada 90 dias. Sem HTTPS na API, o
   navegador bloqueia as chamadas feitas pelo site com cadeado.
3. Em **Databases**, crie um banco **MySQL**. Anote o nome/login (`dbXXXX`) e a senha.
   - A aba **Local access** mostra o *servidor* que a API deve usar (conexão interna).
   - Para importar pelo DBeaver, ative **Remote access** e use
     `dbXXXX.public.databaseasp.net:3306` com SSL.
4. No computador, gere o arquivo do banco (na raiz do projeto):

   ```powershell
   node database/gerar-sql-hospedagem.mjs
   ```

   Ele cria `database/hospedagem/veriseal-hospedagem.sql`: o `schema.sql` + o `dados.sql`
   **sem** `CREATE DATABASE` e `USE`, porque na hospedagem o banco já existe com outro nome.
5. Importe esse arquivo no banco `dbXXXX`, de um destes jeitos:
   - **Painel:** Databases → o banco → **Backups** → *Upload SQL file* → **Restore**.
   - **DBeaver:** conexão remota no `dbXXXX`, abra o arquivo e execute como script (Alt+X).
6. Confira: `SELECT COUNT(*) FROM produtos;` deve dar **21**, e `SELECT COUNT(*) FROM lacres;` deve dar **3**.

## Etapa 2: publicar a API (FileZilla → MonsterASP)

1. Compile a API para produção (na raiz do projeto):

   ```powershell
   dotnet publish backend/src/VeriSealApi -c Release -o backend/publish
   ```

2. Copie `backend/deploy/appsettings.Production.exemplo.json` para
   `backend/publish/appsettings.Production.json` e preencha:
   - `Server`: o servidor da aba **Local access** do banco;
   - `Database` e `User ID`: o `dbXXXX`;
   - `Password`: a senha do banco;
   - `OrigensDoSite`: o domínio do site na HostGator, **com https**, nas duas formas
     (`https://dominio.com.br` e `https://www.dominio.com.br`);
   - `AdminInicial`: e-mail e **uma senha nova** para o administrador do painel. Não use a
     senha padrão do `appsettings.json`, que está no GitHub.
3. No painel do MonsterASP, abra o site → **Deploy** → cartão **FTP / SFTP access**
   (servidor, porta, login e senha). Prefira **SFTP** ou **FTPS**.
4. No FileZilla (*Arquivo → Gerenciador de Sites*), conecte e entre em **`wwwroot`**.
   Se já houver uma versão rodando, envie antes um arquivo `app_offline.htm` (ou clique
   em **Stop** no painel), porque o servidor trava os arquivos em uso.
5. Envie **todo o conteúdo** de `backend/publish/` para `wwwroot/`. Depois apague o
   `app_offline.htm` (ou clique em **Start**).
6. Teste no navegador:
   - `https://SEU-APP.runasp.net/` → `{"api":"VeriSeal Delivery","status":"no ar"}`
   - `https://SEU-APP.runasp.net/api/teste-banco` → "Conexão com o banco de dados estabelecida com sucesso!"
   - `https://SEU-APP.runasp.net/api/lacres` → `"Entre com a conta de administrador para continuar."`
     (401: as rotas do painel só respondem com login, então esse erro é o esperado)

   Se o painel pedir a versão do .NET do site, escolha **.NET 10**.

## Etapa 3: publicar o site (FileZilla → HostGator)

1. No cPanel, em **SSL/TLS Status**, confira se o domínio tem certificado ativo (AutoSSL).
   Se não tiver, rode o AutoSSL. O `.htaccess` do site força `https://`.
2. Gere o site com o endereço da API (dentro de `frontend/`):

   ```powershell
   cd frontend
   npm ci
   npm run build
   npm run dist -- --api https://SEU-APP.runasp.net/api --dominio www.SEU-DOMINIO.com.br
   ```

   A pasta `frontend/dist/` sai com cerca de 126 arquivos (≈ 2 MB), incluindo o `.htaccess`.
3. No cPanel, pegue os dados de acesso em **Contas FTP** (servidor, usuário, porta).
   Use FTP com TLS (porta 21) ou SFTP, se estiver liberado no plano.
4. No FileZilla: à esquerda `frontend/dist`, à direita `/public_html`.
   **Faça backup antes:** baixe o conteúdo atual de `public_html` para uma pasta no computador.
5. Envie **todo o conteúdo** de `frontend/dist/` (não a pasta `dist` em si) para `public_html/`.
   O FileZilla mostra arquivos ocultos como o `.htaccess` em *Servidor → Forçar exibição de arquivos ocultos*.
6. Permissões: pastas **755** e arquivos **644** (clique direito → *Permissões de arquivo* →
   *Recursivo*).

## Etapa 4: validar

Em uma janela anônima, com o DevTools aberto (F12):

- [ ] `https://SEU-DOMINIO` abre com cadeado, sem falhas de CSS ou imagem.
- [ ] **Console** sem erros (nenhum 404, 500 ou CORS). **Network**: documento principal `200`.
- [ ] `https://SEU-DOMINIO/admin.html`: entre com o e-mail e a senha do `AdminInicial`.
      O painel mostra **"Banco de dados conectado · SEU-APP.runasp.net"** e lista os 3 lacres.
- [ ] No painel: cadastre um lacre de teste, edite e exclua. Faça o mesmo com um cliente.
- [ ] Na loja: verifique `VS-7K2M-9QXA` (íntegro) e `VS-4HZP-1LCE` (violado).
      O número de **Verificações** sobe a cada consulta.
- [ ] Faça um pedido. Ele aparece na aba **Pedidos** do painel; o cliente, na aba **Clientes**;
      e os lacres do pedido, na aba **Lacres**. Mude a situação para "Saiu para entrega".
- [ ] Em um código inexistente, "Avisar a marca" → o aviso aparece na aba **Avisos**.

## Etapa 5: evidências (roteiro da matéria)

Tire os prints no deploy do site (HostGator). Se quiser, repita no deploy da API (MonsterASP).
**Esconda senhas e tokens** antes de salvar.

| Evidência | O que precisa aparecer |
| --- | --- |
| EVID-01 Autenticação | FileZilla com host, usuário e porta; log com "Conectado/Autenticado" e "Listagem do diretório "/" concluída" (destaque em vermelho) |
| EVID-02 Preparação | Painel lado a lado: esquerda `frontend/dist`, direita `/public_html` |
| EVID-03 Transferência | Aba "Transferências bem-sucedidas" com o total; "Transferências com falha" = **0** (destaque em vermelho); fila vazia |
| EVID-04 Persistência | Listagem remota com `index.html`, `painel.html`, `js/app.js`, `.htaccess`; data/hora da publicação e permissões 755/644 |
| EVID-05 Homologação | Navegador com `https://` e cadeado, DevTools: Network com `200 OK` e Console sem erros |

Checklist do documento: backup do `public_html` e do banco antes de sobrescrever; não
sobrescrever o `appsettings.Production.json` do servidor com arquivos locais; tirar as
credenciais do histórico do FileZilla antes de prints públicos; limpar o cache antes de testar.

## Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| Console: *blocked by CORS policy* | O endereço do site não está em `OrigensDoSite`. Confira `https` e as versões com e sem `www`; reenvie o `appsettings.Production.json` e reinicie a API. |
| Console: *Mixed Content* | A API está em `http://`. Ative o HTTPS do MonsterASP (chamado no suporte) e gere a `dist` com `https://`. |
| Painel: "Sem conexão com a API" | A API está parada ou o endereço do `npm run dist -- --api` está errado. Abra `https://SEU-APP.runasp.net/` para testar. |
| API: *HTTP Error 500.30* | A API não iniciou. Em geral é a ConnectionString: confira servidor, `dbXXXX` e senha. Para ver o erro, mude `stdoutLogEnabled="true"` no `web.config` e leia a pasta `logs`. |
| API: *500.31* (runtime não encontrado) | Publique incluindo o .NET: `dotnet publish backend/src/VeriSealApi -c Release -r win-x64 --self-contained true -o backend/publish`. |
| Importação: erro em `CREATE DATABASE`/`USE` | Use o arquivo gerado por `node database/gerar-sql-hospedagem.mjs`, não o `schema.sql` direto. |
| FileZilla: arquivo em uso | Coloque o `app_offline.htm` ou clique em **Stop** antes de enviar a API. |
| Site abre sem estilos | A pasta `assets` não subiu inteira, ou o conteúdo foi enviado dentro de `public_html/dist`. Envie o *conteúdo* da `dist`. |

## Publicar de novo depois de mudanças

- **Site:** `npm run build` → `npm run dist -- --api ...` → reenviar o conteúdo de `frontend/dist`.
- **API:** `dotnet publish ...` → `app_offline.htm` → reenviar `backend/publish` **sem** sobrescrever
  o `appsettings.Production.json` do servidor → apagar o `app_offline.htm`.

> **Segurança:** o painel (`painel.html`) só abre com o login do administrador (`admin.html`),
> e a API recusa (401) as rotas do painel sem o token desse login. Continuam abertas, porque a
> loja precisa delas: fazer pedido, verificar lacre e avisar a marca.
