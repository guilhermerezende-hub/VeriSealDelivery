<?php
$host = 'sql213.infinityfree.com';
$banco = 'if0_43484930_veriseal_delivery';
$usuario = 'if0_43484930';
$senha = '5yZmuEV6TCYX';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=3306;dbname=$banco;charset=utf8mb4",
        $usuario,
        $senha,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    exit('Erro na conexão com o banco de dados.');
}