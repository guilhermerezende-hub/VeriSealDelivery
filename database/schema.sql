-- Estrutura do banco da VeriSeal Delivery.
-- Rode este arquivo primeiro e depois o database/dados.sql.

CREATE DATABASE IF NOT EXISTS veriseal_delivery
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE veriseal_delivery;

-- Imagens -------------------------------------------------------------------

-- Todas as fotos do site, com o próprio arquivo guardado no banco.
CREATE TABLE imagens (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  arquivo            VARCHAR(200) NOT NULL UNIQUE,  -- endereço original no site; o back-end pode servir a foto nele
  tipo               VARCHAR(30) NOT NULL,          -- tipo MIME, ex.: image/webp
  largura            SMALLINT UNSIGNED NOT NULL,
  altura             SMALLINT UNSIGNED NOT NULL,
  texto_alternativo  VARCHAR(200),                  -- NULL nas fotos de produto: o site usa o nome do produto
  dados              MEDIUMBLOB NOT NULL            -- o arquivo da foto (até 16 MB)
);

-- Catálogo ------------------------------------------------------------------

CREATE TABLE categorias (
  id      VARCHAR(20) PRIMARY KEY,
  nome    VARCHAR(50) NOT NULL,
  icone   VARCHAR(40),  -- id do produto cuja foto aparece no botão da categoria
  cor     CHAR(7),
  ordem   TINYINT UNSIGNED NOT NULL DEFAULT 0
);

CREATE TABLE produtos (
  id              VARCHAR(40) PRIMARY KEY,
  categoria_id    VARCHAR(20) NOT NULL,
  marca           VARCHAR(60) NOT NULL,
  nome            VARCHAR(100) NOT NULL,
  volume          VARCHAR(20),
  teor_alcool     DECIMAL(4,1),
  origem          VARCHAR(60),
  preco           DECIMAL(10,2) NOT NULL,
  preco_antigo    DECIMAL(10,2),
  selo            VARCHAR(40),
  destaque        BOOLEAN NOT NULL DEFAULT FALSE,
  imagem_id       INT,           -- foto da garrafa; NULL nos kits, que usam as fotos das garrafas
  lacre_y         DECIMAL(4,3),  -- linha de ruptura (borda de baixo da tampa), em fração da altura da foto
  lacre_largura   DECIMAL(4,3),  -- largura do lacre, em fração da largura da foto
  descricao       TEXT,
  notas           JSON,
  ordem           SMALLINT UNSIGNED NOT NULL DEFAULT 0,  -- ordem de "Relevância" no catálogo
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (imagem_id) REFERENCES imagens(id)
);

-- Fotos extras da galeria do produto (com estojo, verso...).
CREATE TABLE produto_imagens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  produto_id  VARCHAR(40) NOT NULL,
  imagem_id   INT NOT NULL,
  legenda     VARCHAR(60),
  ordem       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (imagem_id) REFERENCES imagens(id)
);

CREATE TABLE kit_itens (
  kit_id      VARCHAR(40) NOT NULL,
  produto_id  VARCHAR(40) NOT NULL,
  quantidade  TINYINT UNSIGNED NOT NULL DEFAULT 1,
  ordem       TINYINT UNSIGNED NOT NULL DEFAULT 1,  -- posição da garrafa na foto do kit
  PRIMARY KEY (kit_id, produto_id),
  FOREIGN KEY (kit_id) REFERENCES produtos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Carrossel do topo da página inicial. Cores e recortes do visual ficam no código.
CREATE TABLE banners (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  produto_id  VARCHAR(40) NOT NULL,   -- produto aberto em "Ver detalhes"
  imagem_id   INT,                    -- foto de fundo; NULL monta o banner com as garrafas
  chamada     VARCHAR(60) NOT NULL,   -- etiqueta acima do título
  titulo      VARCHAR(100) NOT NULL,  -- {desconto} é trocado pelo % de desconto do produto
  subtitulo   VARCHAR(200),
  garrafas    JSON,                   -- garrafas do banner sem foto, da esquerda para a direita
  ordem       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (imagem_id) REFERENCES imagens(id)
);

-- Configurações -------------------------------------------------------------

-- Regras da loja (frete, Pix, parcelas, horário) e dados da empresa.
CREATE TABLE configuracoes (
  chave      VARCHAR(40) PRIMARY KEY,
  valor      VARCHAR(200),
  descricao  VARCHAR(200) NOT NULL
);

-- Contas --------------------------------------------------------------------

-- Uma conta só para cliente e entregador: o login.html é o mesmo, e a mesma
-- pessoa pode comprar e entregar. O papel vem de clientes/entregadores.
CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(100) NOT NULL,
  email          VARCHAR(254) NOT NULL UNIQUE,
  senha_hash     VARCHAR(255) NOT NULL,  -- bcrypt ou argon2, nunca a senha em texto
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso  DATETIME
);

-- "Esqueceu sua senha?": guarda só o hash do link enviado por e-mail.
CREATE TABLE recuperacoes_senha (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  token_hash  CHAR(64) NOT NULL UNIQUE,  -- SHA-256 em hexadecimal
  expira_em   DATETIME NOT NULL,
  usado_em    DATETIME,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Clientes ------------------------------------------------------------------

CREATE TABLE clientes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNIQUE,  -- NULL quando a compra é feita sem conta
  nome        VARCHAR(100) NOT NULL,
  telefone    VARCHAR(20) NOT NULL,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE enderecos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id   INT NOT NULL,
  cep          CHAR(9) NOT NULL,
  rua          VARCHAR(120) NOT NULL,
  numero       VARCHAR(10) NOT NULL,
  complemento  VARCHAR(60),
  bairro       VARCHAR(60),
  cidade       VARCHAR(60),
  uf           CHAR(2),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Entregadores --------------------------------------------------------------

-- Cadastro de entregadores.html (3 etapas: dados, veículo e região, termos).
CREATE TABLE entregadores (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id         INT UNIQUE,
  nome               VARCHAR(100) NOT NULL,
  cpf                CHAR(11) NOT NULL UNIQUE,  -- só os números
  nascimento         DATE NOT NULL,
  telefone           VARCHAR(20) NOT NULL,
  email              VARCHAR(254) NOT NULL,
  veiculo            ENUM('moto', 'bike', 'car') NOT NULL,
  cnh                CHAR(11),
  placa              CHAR(7),  -- ABC1D23 ou ABC1234, sem hífen
  cep                CHAR(9) NOT NULL,  -- região onde quer entregar
  bairro             VARCHAR(60),
  cidade             VARCHAR(60),
  uf                 CHAR(2),
  status             ENUM('em_analise', 'aprovado', 'recusado', 'inativo') NOT NULL DEFAULT 'em_analise',
  termos_aceitos_em  DATETIME NOT NULL,
  criado_em          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  -- moto e carro exigem CNH e placa; bicicleta não
  CHECK (veiculo = 'bike' OR (cnh IS NOT NULL AND placa IS NOT NULL))
);

CREATE TABLE entregador_turnos (
  entregador_id  INT NOT NULL,
  turno          ENUM('manha', 'tarde', 'noite', 'fds') NOT NULL,
  PRIMARY KEY (entregador_id, turno),
  FOREIGN KEY (entregador_id) REFERENCES entregadores(id) ON DELETE CASCADE
);

-- Pedidos -------------------------------------------------------------------

CREATE TABLE pedidos (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  numero                 VARCHAR(12) NOT NULL UNIQUE,
  cliente_id             INT NOT NULL,
  endereco_id            INT NOT NULL,
  entregador_id          INT,  -- preenchido quando um entregador pega o pedido
  pagamento              ENUM('pix', 'card', 'cod') NOT NULL,
  parcelas               TINYINT UNSIGNED NOT NULL DEFAULT 1,
  troco_para             DECIMAL(10,2),
  agendado_para          VARCHAR(40),
  presente               BOOLEAN NOT NULL DEFAULT FALSE,
  mensagem_presente      VARCHAR(140),
  maioridade_confirmada  BOOLEAN NOT NULL,
  subtotal               DECIMAL(10,2) NOT NULL,
  desconto               DECIMAL(10,2) NOT NULL DEFAULT 0,
  frete                  DECIMAL(10,2) NOT NULL DEFAULT 0,
  total                  DECIMAL(10,2) NOT NULL,
  status                 ENUM('recebido', 'separando', 'em_rota', 'entregue', 'cancelado') NOT NULL DEFAULT 'recebido',
  criado_em              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id),
  FOREIGN KEY (entregador_id) REFERENCES entregadores(id),
  -- o checkout só fecha com "Tenho 18 anos ou mais" marcado
  CHECK (maioridade_confirmada = TRUE)
);

CREATE TABLE pedido_itens (
  pedido_id       INT NOT NULL,
  produto_id      VARCHAR(40) NOT NULL,
  quantidade      TINYINT UNSIGNED NOT NULL,
  preco_unitario  DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (pedido_id, produto_id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Linha do tempo do pedido confirmado: cada mudança de status com o horário.
CREATE TABLE pedido_historico (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  pedido_id  INT NOT NULL,
  status     ENUM('recebido', 'separando', 'em_rota', 'entregue', 'cancelado') NOT NULL,
  criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Confirmação do pagamento (Pix, cartão ou na entrega).
CREATE TABLE pagamentos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id     INT NOT NULL,
  metodo        ENUM('pix', 'card', 'cod') NOT NULL,
  valor         DECIMAL(10,2) NOT NULL,
  status        ENUM('pendente', 'aprovado', 'recusado', 'estornado') NOT NULL DEFAULT 'pendente',
  transacao_id  VARCHAR(100) UNIQUE,  -- código devolvido pela operadora
  pago_em       DATETIME,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Lacres --------------------------------------------------------------------

CREATE TABLE lacres (
  codigo        CHAR(12) PRIMARY KEY,
  produto_id    VARCHAR(40) NOT NULL,
  pedido_id     INT,
  lote          VARCHAR(12) NOT NULL,
  fabricado_em  DATE NOT NULL,
  status        ENUM('ok', 'opened') NOT NULL DEFAULT 'ok',
  enviado_em    DATETIME,
  aberto_em     DATETIME,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE TABLE verificacoes (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  lacre_codigo   CHAR(12) NOT NULL,
  origem         ENUM('nfc', 'codigo') NOT NULL,
  resultado      ENUM('ok', 'opened') NOT NULL,  -- situação do lacre no momento da leitura
  verificado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lacre_codigo) REFERENCES lacres(codigo)
);

-- Botão "Avisar a marca". Sem FK para lacres: o aviso também vale para
-- código sem registro (possível falsificação).
CREATE TABLE avisos_marca (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  lacre_codigo  CHAR(12) NOT NULL,
  motivo        ENUM('nao_encontrado', 'violado') NOT NULL,
  status        ENUM('aberto', 'em_analise', 'resolvido') NOT NULL DEFAULT 'aberto',
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (lacre_codigo)
);
