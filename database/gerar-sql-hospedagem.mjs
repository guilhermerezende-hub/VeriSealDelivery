// Gera database/hospedagem/veriseal-hospedagem.sql para importar no MySQL da hospedagem.
//
// Na hospedagem o banco já vem criado pelo painel (com um nome como db12345), então o
// arquivo final não pode ter "CREATE DATABASE" nem "USE veriseal_delivery". O script junta
// schema.sql + dados.sql e tira essas linhas.
//
// Uso (na raiz do projeto):  node database/gerar-sql-hospedagem.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const pasta = path.dirname(fileURLToPath(import.meta.url));
const lerSql = async (nome) => {
  try {
    return await readFile(path.join(pasta, nome), "utf8");
  } catch {
    throw new Error(
      `Não encontrei database/${nome}. Ele precisa existir para gerar o arquivo da hospedagem.`,
    );
  }
};

const semCriacaoDoBanco = (sql) =>
  sql
    .replace(/^﻿/, "")
    .replace(/^CREATE DATABASE\b[\s\S]*?;[^\S\n]*\n?/gim, "")
    .replace(/^USE\s+[^;\n]+;[^\S\n]*\n?/gim, "");

const schema = semCriacaoDoBanco(await lerSql("schema.sql"));
const dados = semCriacaoDoBanco(await lerSql("dados.sql"));

if (/^\s*(CREATE DATABASE|USE)\b/im.test(schema + dados))
  throw new Error("Sobrou um CREATE DATABASE ou USE no arquivo gerado.");

const saida = path.join(pasta, "hospedagem");
await mkdir(saida, { recursive: true });
const arquivo = path.join(saida, "veriseal-hospedagem.sql");
await writeFile(
  arquivo,
  [
    "-- VeriSeal Delivery: estrutura + dados para o MySQL da hospedagem.",
    "-- Gerado por database/gerar-sql-hospedagem.mjs. Importe com o banco da hospedagem selecionado.",
    "SET NAMES utf8mb4;",
    "",
    schema.trim(),
    "",
    dados.trim(),
    "",
  ].join("\n"),
  "utf8",
);

const tamanho = (Buffer.byteLength(schema) + Buffer.byteLength(dados)) / 1024;
console.log(
  `Pronto: ${path.relative(process.cwd(), arquivo)} (${tamanho.toFixed(0)} KB)`,
);
