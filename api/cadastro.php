<?php
require_once __DIR__ . '/conexao.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$nome = trim($_POST['name'] ?? '');
$email = strtolower(trim($_POST['email'] ?? ''));
$senha = $_POST['password'] ?? '';

if (
    $nome === '' || strlen($nome) > 100 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($email) > 254 ||
    strlen($senha) < 8 || strlen($senha) > 72
) {
    http_response_code(400);
    exit(json_encode(['mensagem' => 'Dados inválidos.']));
}

try {
    $consulta = $pdo->prepare(
        "INSERT INTO usuarios (nome, email, senha_hash)
         VALUES (?, ?, ?)"
    );

    $consulta->execute([
        $nome,
        $email,
        password_hash($senha, PASSWORD_DEFAULT)
    ]);

    http_response_code(201);
    echo json_encode(['mensagem' => 'Conta criada com sucesso!']);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['mensagem' => 'Não foi possível criar a conta.']);
}