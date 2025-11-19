<?php
header('Content-Type: application/json');

// Pasta onde os uploads serão salvos
$uploadDir = __DIR__ . '/../uploads/';
if(!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

if (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $_SERVER['REQUEST_METHOD'] = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $files = array_diff(scandir($uploadDir), ['.', '..']);
    $files = array_values($files);
    $urls = array_map(fn($f) => '/uploads/' . $f, $files);
    echo json_encode($urls);
    exit;
}

if ($method === 'POST') {
    if (!isset($_FILES['image'])) {
        echo json_encode(['success' => false, 'message' => 'Nenhum arquivo enviado']);
        exit;
    }

    $file = $_FILES['image'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $ext = strtolower($ext);
    $filename = uniqid('img_') . '.' . $ext;
    $filename = preg_replace("/[^a-zA-Z0-9_\.-]/", "", $filename);

    $targetFile = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        echo json_encode([
            'success' => true,
            'url' => '/uploads/' . $filename
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Falha ao salvar o arquivo']);
    }
    exit;
}

if ($method === 'PUT') {
    if (!isset($_POST['file']) || !isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Arquivo antigo não informado']);
        exit;
    }

    $oldFile = basename($_POST['file']);
    $oldPath = $uploadDir . $oldFile;

    $newFile = $_FILES['image'];
    $ext = strtolower(pathinfo($newFile['name'], PATHINFO_EXTENSION));
    $newFilename = uniqid('img_') . '.' . $ext;
    $newFilename = preg_replace("/[^a-zA-Z0-9_\.-]/", "", $newFilename);
    $newPath = $uploadDir . $newFilename;

    if (move_uploaded_file($newFile['tmp_name'], $newPath)) {
        if (file_exists($oldPath)) unlink($oldPath);
        echo json_encode([
            'success' => true,
            'url' => '/uploads/' . $newFilename
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Falha ao substituir o arquivo']);
        exit;
    }
}

if ($method === 'DELETE') {
    $fileToDelete = $_POST['file'] ?? null;

    if (!$fileToDelete) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Arquivo não informado']);
        exit;
    }

    $fileToDelete = basename($fileToDelete);
    $filePath = $uploadDir . $fileToDelete;

    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Arquivo não encontrado']);
        exit;
    }

    if (unlink($filePath)) {
        echo json_encode(['success' => true, 'message' => 'Arquivo deletado']);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Falha ao deletar o arquivo']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido']);