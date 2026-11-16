-- Atualização de 15/11/2026: login do administrador no painel da loja.
--
-- Só para o banco que já existia antes dessa data (o do seu computador, no DBeaver).
-- Quem cria o banco do zero com database/schema.sql já ganha estas tabelas.
-- Pode rodar mais de uma vez: o IF NOT EXISTS não recria o que já existe.

USE veriseal_delivery;

CREATE TABLE IF NOT EXISTS administradores (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(100) NOT NULL,
  email          VARCHAR(254) NOT NULL UNIQUE,
  senha_hash     VARCHAR(255) NOT NULL,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso  DATETIME
);

CREATE TABLE IF NOT EXISTS sessoes_admin (
  token_hash        CHAR(64) PRIMARY KEY,
  administrador_id  INT NOT NULL,
  criado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em         DATETIME NOT NULL,
  FOREIGN KEY (administrador_id) REFERENCES administradores(id) ON DELETE CASCADE
);
