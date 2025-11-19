<?php
$request = $_SERVER['REQUEST_URI'];

// Rota para upload
if(str_starts_with($request, '/api/upload')) {
    require_once __DIR__ . '/../api/upload.php';
    exit;
}

// Outras APIs podem ser roteadas aqui
if(str_starts_with($request, '/api/users')) {
    require_once __DIR__ . '/../api/users.php';
    exit;
}

echo file_get_contents(__DIR__ . '/index.html');
