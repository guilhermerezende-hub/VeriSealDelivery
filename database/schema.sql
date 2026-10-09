CREATE DATABASE IF NOT EXISTS veriseal_delivery
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE veriseal_delivery;

CREATE TABLE categorias (
  id      VARCHAR(20) PRIMARY KEY,
  nome    VARCHAR(50) NOT NULL,
  icone   VARCHAR(40),
  cor     CHAR(7)
);

CREATE TABLE produtos (
  id            VARCHAR(40) PRIMARY KEY,
  categoria_id  VARCHAR(20) NOT NULL,
  marca         VARCHAR(60) NOT NULL,
  nome          VARCHAR(100) NOT NULL,
  volume        VARCHAR(20),
  teor_alcool   DECIMAL(4,1),
  origem        VARCHAR(60),
  preco         DECIMAL(10,2) NOT NULL,
  preco_antigo  DECIMAL(10,2),
  selo          VARCHAR(40),
  destaque      BOOLEAN NOT NULL DEFAULT FALSE,
  imagem        VARCHAR(200),
  descricao     TEXT,
  notas         JSON,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE kit_itens (
  kit_id      VARCHAR(40) NOT NULL,
  produto_id  VARCHAR(40) NOT NULL,
  quantidade  TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (kit_id, produto_id),
  FOREIGN KEY (kit_id) REFERENCES produtos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE clientes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  telefone   VARCHAR(20) NOT NULL,
  criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE pedidos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  numero         VARCHAR(12) NOT NULL UNIQUE,
  cliente_id     INT NOT NULL,
  endereco_id    INT NOT NULL,
  pagamento      ENUM('pix', 'card', 'cod') NOT NULL,
  parcelas       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  troco_para     DECIMAL(10,2),
  agendado_para  VARCHAR(40),
  subtotal       DECIMAL(10,2) NOT NULL,
  desconto       DECIMAL(10,2) NOT NULL DEFAULT 0,
  frete          DECIMAL(10,2) NOT NULL DEFAULT 0,
  total          DECIMAL(10,2) NOT NULL,
  status         ENUM('recebido', 'em_rota', 'entregue', 'cancelado') NOT NULL DEFAULT 'recebido',
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id)
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
  verificado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lacre_codigo) REFERENCES lacres(codigo)
);

INSERT INTO categorias (id, nome, icone, cor) VALUES
  ('whisky',  'Whisky',  'jw-black',      '#fbf1e4'),
  ('vodka',   'Vodka',   'absolut-1l',    '#eaf2fd'),
  ('gin',     'Gin',     'tanqueray',     '#e8f6ee'),
  ('cachaca', 'Cachaça', 'cachaca-51',    '#fdf7dc'),
  ('kits',    'Kits',    'kit-jack-trio', '#ecebfa');
