<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
$method = $_SERVER['REQUEST_METHOD'];

/*GET – Lista todos os slides ou retorna 1 slide pelo id*/
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM slideshow WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        $stmt = $pdo->query("SELECT * FROM slideshow ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

/*POST – Cria um novo slide*/
if ($method === 'POST') {
    $image = $input['image'] ?? '';
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $button_link = $input['button_link'] ?? '';

    $stmt = $pdo->prepare(
        "INSERT INTO slideshow (image, title, description, button_link, updated_at) VALUES (?, ?, ?, ?, NOW())"
    );
    $stmt->execute([$image, $title, $description, $button_link]);

    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

/*PUT – Atualiza um slide*/
if ($method === 'PUT') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não encontrado']);
        exit;
    }

    $id = $_GET['id'];

    $check = $pdo->prepare("SELECT id FROM slideshow WHERE id = ?");
    $check->execute([$id]);

    if ($check->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'ID não encontrado']);
        exit;
    }

    $image = $input['image'] ?? '';
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $button_link = $input['button_link'] ?? '';

    $stmt = $pdo->prepare(
        "UPDATE slideshow SET image=?, title=?, description=?, button_link=?, updated_at=NOW() WHERE id=?"
    );
    $stmt->execute([$image, $title, $description, $button_link, $id]);

    echo json_encode(['ok' => true]);
    exit;
}

/*DELETE – Deleta um slide*/
if ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não encontrado']);
        exit;
    }

    $id = $_GET['id'];
    $check = $pdo->prepare("SELECT id FROM slideshow WHERE id = ?");
    $check->execute([$id]);

    if ($check->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'ID não encontrado']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM slideshow WHERE id = ?");
    $stmt->execute([$_GET['id']]);

    echo json_encode(['ok' => true]);
    exit;
}

