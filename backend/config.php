<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

function loadEnv($path) {
    if (!file_exists($path)) return;

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        if (str_starts_with($line, '#')) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

loadEnv(__DIR__ . '/.env');

$DB_HOST = $_ENV['DB_HOST'];
$DB_NAME = $_ENV['DB_NAME'];
$DB_USER = $_ENV['DB_USER'];
$DB_PASS = $_ENV['DB_PASSWORD'];

try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
  exit;
}
