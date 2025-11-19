<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
$method = $_SERVER['REQUEST_METHOD'];

/*GET – Lista todos os cursos ou retorna 1 curso pelo id*/
if ($method === 'GET') {
  if (isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        echo json_encode(['error' => 'Curso não encontrado']);
        exit;
    }
    
    echo json_encode($course);
    exit;
  }
  
  $stmt = $pdo->query("SELECT * FROM courses ORDER BY created_at DESC");
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
  exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
  
/*POST – Cria um novo curso*/
if ($method === 'POST') {
  $title = $input['title'] ?? '';

  if ($title === '') {
      http_response_code(422);
      echo json_encode(['error' => 'Título é obrigatório']);
      exit;
  }

  $description = $input['description'] ?? '';

  $stmt = $pdo->prepare("INSERT INTO courses (title, description) VALUES (?, ?)");
  $stmt->execute([$title, $description]);

  echo json_encode(['id' => $pdo->lastInsertId()]);
  exit;
}

/*PUT – Atualiza um curso*/
if ($method === 'PUT') {
  if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error'=>'ID é obrigatório']);
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

  $title = $input['title'] ?? '';
  $description = $input['description'] ?? '';

  $stmt = $pdo->prepare("UPDATE courses SET title = ?, description = ? WHERE id = ?");
  $stmt->execute([$title, $description, $id]);
  echo json_encode(['ok' => true]);
  exit;
}

/*DELETE – Deleta um curso*/
if ($method === 'DELETE') {
  if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error'=>'ID é obrigatório']);
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

  $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
  $stmt->execute([$_GET['id']]);

  echo json_encode(['ok' => true]);
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
