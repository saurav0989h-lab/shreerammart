<?php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$pdo = get_pdo();
$uploadsDir = __DIR__ . '/uploads/';
$thumbsDir = $uploadsDir . 'thumbnails/';

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

function file_list(string $directory): array
{
    $pattern = $directory . '*.{jpg,jpeg,png,gif,webp}';
    $files = glob($pattern, GLOB_BRACE);
    if ($files === false) {
        return [];
    }
    sort($files, SORT_NATURAL | SORT_FLAG_CASE);
    return array_values(array_filter($files, 'is_file'));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strncmp($contentType, 'application/json', 16) !== 0) {
        respond(['success' => false, 'error' => 'Unsupported content type.'], 400);
    }

    $raw = file_get_contents('php://input');
    try {
        $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        respond(['success' => false, 'error' => 'Invalid JSON payload.'], 400);
    }

    $token = $payload['csrf_token'] ?? '';
    if (empty($token) || empty($_SESSION['admin_csrf']) || !hash_equals($_SESSION['admin_csrf'], $token)) {
        respond(['success' => false, 'error' => 'Invalid session token.'], 403);
    }

    $action = $payload['action'] ?? '';
    if ($action !== 'delete') {
        respond(['success' => false, 'error' => 'Unsupported action.'], 400);
    }

    $name = basename($payload['name'] ?? '');
    if ($name === '') {
        respond(['success' => false, 'error' => 'Missing image name.'], 422);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM homepage_slides WHERE image_path = :name');
    $stmt->execute(['name' => $name]);
    $inUse = (int) $stmt->fetchColumn() > 0;

    if ($inUse) {
        respond(['success' => false, 'error' => 'Cannot delete an image currently in use.'], 409);
    }

    $paths = [$uploadsDir . $name, $thumbsDir . $name];
    $deleted = false;
    foreach ($paths as $path) {
        if (is_file($path)) {
            $deleted = @unlink($path) || $deleted;
        }
    }

    if (!$deleted) {
        respond(['success' => false, 'error' => 'Image not found on disk.'], 404);
    }

    respond(['success' => true]);
}

$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = (int) ($_GET['limit'] ?? 20);
if ($limit <= 0) {
    $limit = 20;
}
if ($limit > 100) {
    $limit = 100;
}

$files = file_list($uploadsDir);
$total = count($files);
$pages = $total > 0 ? (int) ceil($total / $limit) : 1;
if ($page > $pages) {
    $page = $pages;
}
$offset = ($page - 1) * $limit;
$filesPage = array_slice($files, $offset, $limit);

$stmt = $pdo->query('SELECT image_path FROM homepage_slides');
$usedPaths = [];
foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $path) {
    $usedPaths[$path] = true;
}

$images = [];
foreach ($filesPage as $file) {
    $name = basename($file);
    $images[] = [
        'name' => $name,
        'url' => 'uploads/' . $name,
        'thumbnail' => 'uploads/thumbnails/' . $name,
        'inUse' => isset($usedPaths[$name]),
    ];
}

respond([
    'success' => true,
    'images' => $images,
    'page' => $page,
    'pages' => $pages,
    'total' => $total,
]);
