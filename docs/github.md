# VeriSeal Delivery pelo GitHub

O projeto roda inteiro pelo GitHub, com o banco de dados funcionando, em duas partes:

| Parte | O que faz | Fica no ar |
| --- | --- | --- |
| **GitHub Codespaces** | Um computador na nuvem do GitHub com o **MySQL** e a **API em C#**. Ela também mostra o site, no mesmo endereço. | Enquanto o Codespace estiver ligado |
| **GitHub Pages** | Publica os arquivos do site (HTML, CSS, JS) em `guilhermerezende-hub.github.io`. Não roda C# nem MySQL: para ler e gravar no banco, chama a API do Codespace. | Sempre |

```text
Navegador ──> GitHub Pages (site)  ──┐
                                     ├──> API C# (Codespace, porta 5021) ──> MySQL (Codespace)
Navegador ──> Codespace (site) ──────┘
```

A hospedagem pelo FileZilla (HostGator + MonsterASP) continua descrita em [hospedagem.md](hospedagem.md). Ela não depende deste guia.

---

## 1. Abrir o projeto com o banco (Codespaces)

1. No GitHub, abra o repositório e clique em **Code → Codespaces → Create codespace on main**.
   Ou use o botão "Open in GitHub Codespaces" do README.
2. Espere de 2 a 4 minutos na primeira vez. O GitHub monta tudo sozinho:
   - cria o MySQL 8.4 com o banco `veriseal_delivery`, rodando `database/schema.sql` e `database/dados.sql`;
   - compila e liga a API em C#, que fica na **porta 5021**.
3. Quando terminar, o terminal mostra **"API e site no ar na porta 5021"**. Abra a aba **PORTAS** (*PORTS*), passe o mouse na linha **5021 · VeriSeal (site + API)** e clique no ícone de globo. A loja abre no navegador.

O endereço tem este formato: `https://<nome-do-codespace>-5021.app.github.dev/`. Ele não muda enquanto o Codespace existir.

## 2. Entrar como administrador e acompanhar os pedidos

1. No rodapé da loja, clique em **Painel da loja**, ou abra `…/admin.html`.
2. Entre com:
   - **E-mail:** `admin@veriseal.com.br`
   - **Senha:** `VeriSeal@2026`
3. O painel abre na aba **Pedidos**:
   - os números do dia, os pedidos em andamento, os entregues e o faturamento;
   - a busca por número, cliente ou celular, e o filtro por situação;
   - **Ver pedido** mostra o cliente, o endereço, os itens com os preços, o pagamento e os lacres de cada garrafa;
   - em **Situação do pedido** você muda para *Separando*, *Saiu para entrega*, *Entregue* ou *Cancelado*. Cada mudança fica no histórico. *Saiu para entrega* grava a hora do envio em todos os lacres do pedido, e a verificação do lacre passa a mostrar essa hora.
4. Faça um pedido na loja (outra aba): ele aparece no painel em até 30 segundos, com um aviso "Novo pedido".

As abas **Lacres**, **Clientes** e **Avisos** continuam com o CRUD de antes. Sem o login, a API responde 401 nessas rotas.

## 3. Ver as tabelas do banco

No Codespace, clique no ícone de **cilindro (SQLTools)** na barra da esquerda e abra a conexão **"VeriSeal (MySQL do Codespace)"**. Se ele pedir para instalar o driver do MySQL, aceite. Depois é só expandir as tabelas ou abrir um editor SQL, por exemplo:

```sql
SELECT p.numero, p.status, c.nome, p.total, p.criado_em
FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
ORDER BY p.id DESC;
```

Dados da conexão, se precisar: servidor `127.0.0.1`, porta `3306`, usuário `root`, senha `veriseal`, banco `veriseal_delivery`.

## 4. Deixar público (professor e GitHub Pages)

No começo, a porta 5021 é **privada**: só você, logado no GitHub, consegue abrir. Para outra pessoa ou o GitHub Pages acessarem:

1. Aba **PORTAS** → botão direito na porta **5021** → **Port Visibility** → **Public**.
2. Copie o endereço da porta (botão direito → **Copy Local Address**) e mande para quem for acessar.

> **Antes de deixar público, troque a senha do administrador** (seção 7). A senha padrão está escrita neste repositório, que é público. Com a porta pública, qualquer pessoa com o endereço consegue chegar na tela de login.

Para fechar de novo: mesmo caminho, **Port Visibility → Private**.

## 5. Ligar o GitHub Pages ao banco

O site do GitHub Pages fica em <https://guilhermerezende-hub.github.io/VeriSealDelivery/frontend/>. Para ele usar o banco do seu Codespace:

1. Abra o Codespace **na branch `main`** e deixe a porta 5021 pública (seção 4).
2. No terminal do Codespace, rode uma vez:

   ```bash
   bash .devcontainer/conectar-github-pages.sh
   ```

   O script grava o endereço da API em `frontend/js/config.js` (`API_PUBLIC_URL`), faz o commit e o push. Em 1 ou 2 minutos o GitHub Pages publica a mudança.
3. Abra o site do GitHub Pages: a verificação de lacres, os pedidos e o painel (`…/frontend/admin.html`) passam a usar o banco do Codespace.

Só precisa repetir se você **apagar** o Codespace e criar outro, porque o endereço muda. Desligar e ligar de novo mantém o endereço.

Com o Codespace desligado, o site do GitHub Pages continua abrindo: a loja funciona com os dados guardados no navegador, e o painel avisa que está sem conexão com o banco.

## 6. Ligar, desligar e limites do plano grátis

- O Codespace **desliga sozinho depois de 30 minutos sem uso**. Para aumentar (até 4 horas), vá em <https://github.com/settings/codespaces> → **Default idle timeout**.
- Para religar: <https://github.com/codespaces> → seu Codespace → **Open in browser**. O MySQL e a API ligam sozinhos, e os dados continuam lá.
- Confira se a porta 5021 continua pública depois de religar.
- O plano grátis da conta pessoal dá 120 horas-núcleo por mês (60 horas na máquina de 2 núcleos). Desligue quando não estiver usando: <https://github.com/codespaces> → **⋯ → Stop codespace**.
- Apagar o Codespace apaga o banco dele. O próximo Codespace cria tudo de novo a partir do `schema.sql` e do `dados.sql`.

## 7. Trocar a senha do administrador

A API deixa o administrador igual ao `AdminInicial` da configuração toda vez que liga. A senha vai para o banco só como hash (PBKDF2), nunca em texto.

**No Codespace, sem mudar o código:**

1. Vá em <https://github.com/settings/codespaces> → **Secrets → New secret**.
2. Nome: `ADMININICIAL__SENHA` (com dois sublinhados). Valor: a nova senha. Em **Repository access**, escolha `VeriSealDelivery`.
3. Volte ao Codespace. Vai aparecer um aviso para recarregar por causa do novo secret: aceite. Se não aparecer, desligue e ligue o Codespace.

**No código:** mude `AdminInicial:Senha` em `backend/src/VeriSealApi/appsettings.json` e reinicie a API.

## 8. Quando algo não funciona

| O que aparece | O que fazer |
| --- | --- |
| A porta 5021 não aparece ou o site não abre | No terminal do Codespace: `bash .devcontainer/iniciar.sh`. Ele espera o MySQL e liga a API de novo. |
| "Sem conexão com a API" no painel | Veja o erro da API: `tail -n 50 /tmp/veriseal-api.log`. Depois rode `bash .devcontainer/iniciar.sh`. |
| Mudei o C# e nada mudou | A API precisa ser religada: `bash .devcontainer/iniciar.sh`. |
| GitHub Pages: "Não foi possível conectar ao servidor" | O Codespace está desligado, ou a porta 5021 está privada (seções 4 e 6). |
| GitHub Pages: erro de CORS no Console | O endereço do site precisa estar em `OrigensDoSite` do `appsettings.Codespaces.json`. O `https://guilhermerezende-hub.github.io` já está lá. |
| "Sua sessão terminou" no painel | O login vale 12 horas. Entre de novo. |
| Quero o banco do zero | Apague o Codespace e crie outro. |

## 9. No seu computador (DBeaver)

O banco local precisa das tabelas novas do login. Rode **uma vez** no DBeaver o arquivo `database/atualizacoes/2026-11-15-login-administrador.sql` e reinicie a API (`dotnet run` em `backend/src/VeriSealApi`). O resto continua igual: site em `npm run dev` (porta 4173) e login em `http://127.0.0.1:4173/admin.html`.
