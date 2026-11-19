<?php
require_once __DIR__ . '/conexao.php';

$consulta = $pdo->query("SELECT COUNT(*) FROM produtos");
$total = $consulta->fetchColumn();

echo "Conexao realizada com sucesso!";
echo "<br>Produtos cadastrados: " . $total;