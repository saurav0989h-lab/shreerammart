<?php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/../db_config.php';

$uploadsDir = __DIR__ . '/uploads/';
$message = '';
$error = '';
$editingSlide = null;

if (isset($_GET['edit'])) {
    $editId = (int) $_GET['edit'];
    $stmt = $pdo->prepare('SELECT * FROM homepage_slides WHERE id = :id');
    $stmt->execute(['id' => $editId]);
    $editingSlide = $stmt->fetch();
    if (!$editingSlide) {
        $error = 'Slide not found.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create' || $action === 'update') {
        $title = trim($_POST['title'] ?? '');
        $caption = trim($_POST['caption'] ?? '');
        $linkUrl = trim($_POST['link_url'] ?? '');
        $displayOrder = isset($_POST['display_order']) ? (int) $_POST['display_order'] : 0;
        $slideTimer = isset($_POST['slide_timer']) ? (int) $_POST['slide_timer'] : 5000;
        $isActive = isset($_POST['is_active']) ? 1 : 0;
        
        $errorList = [];