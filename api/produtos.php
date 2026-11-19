<?php
require_once __DIR__ . '/conexao.php';

header('Content-Type: application/json; charset=utf-8');

$consulta = $pdo->query("
    SELECT id, marca, nome, preco, preco_antigo, categoria_id
    FROM produtos
    WHERE ativo = 1
    ORDER BY ordem
");

echo json_encode(
    $consulta->fetchAll(PDO::FETCH_ASSOC),
    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
);