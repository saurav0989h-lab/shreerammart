<?php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/../db_config.php';

$pdo = get_pdo();
$uploadsDir = __DIR__ . '/uploads/';
$thumbsDir = $uploadsDir . 'thumbnails/';

if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}
if (!is_dir($thumbsDir)) {
    mkdir($thumbsDir, 0755, true);
}

if (empty($_SESSION['admin_csrf'])) {
    $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
}

function starts_with(string $haystack, string $needle): bool
{
    return strncmp($haystack, $needle, strlen($needle)) === 0;
}

function respond_json(array $payload): void
{
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

function validate_csrf(string $token): void
{
    if (empty($_SESSION['admin_csrf']) || !hash_equals($_SESSION['admin_csrf'], $token)) {
        respond_json(['success' => false, 'error' => 'Invalid session token.']);
    }
}

function create_image_resource(string $path, int $type)
{
    switch ($type) {
        case IMAGETYPE_JPEG:
            return imagecreatefromjpeg($path);
        case IMAGETYPE_PNG:
            return imagecreatefrompng($path);
        case IMAGETYPE_WEBP:
            return imagecreatefromwebp($path);
        case IMAGETYPE_GIF:
            return imagecreatefromgif($path);
        default:
            return false;
    }
}

function save_image_resource($image, string $path, int $type): bool
{
    switch ($type) {
        case IMAGETYPE_JPEG:
            return imagejpeg($image, $path, 90);
        case IMAGETYPE_PNG:
            return imagepng($image, $path, 6);
        case IMAGETYPE_WEBP:
            return imagewebp($image, $path, 85);
        case IMAGETYPE_GIF:
            return imagegif($image, $path);
        default:
            return false;
    }
}

function resize_image(string $tempPath, string $destination, string $thumbDestination, int $type): bool
{
    $maxWidth = 1920;
    $maxHeight = 800;
    $thumbWidth = 480;

    $source = create_image_resource($tempPath, $type);
    if ($source === false) {
        return false;
    }

    $width = imagesx($source);
    $height = imagesy($source);

    $scale = min($maxWidth / $width, $maxHeight / $height, 1);
    $newWidth = (int) floor($width * $scale);
    $newHeight = (int) floor($height * $scale);

    $resized = imagecreatetruecolor($newWidth, $newHeight);

    if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) {
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
        imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
    }

    imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    $thumbScale = min($thumbWidth / $newWidth, 1);
    $thumbHeight = (int) floor($newHeight * $thumbScale);
    $thumb = imagecreatetruecolor((int) ($newWidth * $thumbScale), $thumbHeight);

    if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) {
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
        $transparent = imagecolorallocatealpha($thumb, 0, 0, 0, 127);
        imagefilledrectangle($thumb, 0, 0, (int) ($newWidth * $thumbScale), $thumbHeight, $transparent);
    }

    imagecopyresampled($thumb, $resized, 0, 0, 0, 0, (int) ($newWidth * $thumbScale), $thumbHeight, $newWidth, $newHeight);

    $saved = save_image_resource($resized, $destination, $type);
    $thumbSaved = save_image_resource($thumb, $thumbDestination, $type);

    imagedestroy($source);
    imagedestroy($resized);
    imagedestroy($thumb);

    return $saved && $thumbSaved;
}

function handle_image_upload(array $file, string $uploadsDir, string $thumbsDir): array
{
    $maxSize = 5 * 1024 * 1024;
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return [false, 'Image upload failed.'];
    }

    if ($file['size'] > $maxSize) {
        return [false, 'Image exceeds 5MB.'];
    }

    $info = @getimagesize($file['tmp_name']);
    if ($info === false) {
        return [false, 'Selected file is not a valid image.'];
    }

    $type = $info[2];
    $allowedTypes = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
    if (!array_key_exists($type, $allowedTypes)) {
        return [false, 'Only JPG, PNG, GIF, or WEBP images are allowed.'];
    }

    $extension = $allowedTypes[$type];
    $filename = uniqid('slide_', true) . '.' . $extension;
    $destination = $uploadsDir . $filename;
    $thumbDestination = $thumbsDir . $filename;

    if (!resize_image($file['tmp_name'], $destination, $thumbDestination, $type)) {
        return [false, 'Failed to process the image.'];
    }

    return [true, $filename];
}

function delete_image_files(string $filename, string $uploadsDir, string $thumbsDir): void
{
    $paths = [$uploadsDir . $filename, $thumbsDir . $filename];
    foreach ($paths as $path) {
        if (is_file($path)) {
            @unlink($path);
        }
    }
}

// Handle JSON payloads (AJAX for sorting/toggling)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
    $rawBody = file_get_contents('php://input');
    try {
        $payload = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        respond_json(['success' => false, 'error' => 'Malformed request body.']);
    }
    $action = $payload['action'] ?? '';
    $token = $payload['csrf_token'] ?? '';

    validate_csrf($token);

    if ($action === 'sort') {
        $order = $payload['order'] ?? [];
        if (!is_array($order)) {
            respond_json(['success' => false, 'error' => 'Invalid payload.']);
        }

        $pdo->beginTransaction();
        try {
            $position = 1;
            $stmt = $pdo->prepare('UPDATE homepage_slides SET display_order = :order WHERE id = :id');
            foreach ($order as $id) {
                $stmt->execute([
                    'order' => $position,
                    'id' => (int) $id,
                ]);
                $position++;
            }
            $pdo->commit();
            respond_json(['success' => true]);
        } catch (Throwable $e) {
            $pdo->rollBack();
            respond_json(['success' => false, 'error' => 'Unable to reorder slides.']);
        }
    }

    if ($action === 'toggle') {
        $id = (int) ($payload['id'] ?? 0);
        $stmt = $pdo->prepare('UPDATE homepage_slides SET is_active = 1 - is_active WHERE id = :id');
        $stmt->execute(['id' => $id]);
        respond_json(['success' => true]);
    }

    respond_json(['success' => false, 'error' => 'Unknown action.']);
}

$feedback = [
    'errors' => [],
    'messages' => [],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && (!isset($_SERVER['CONTENT_TYPE']) || !starts_with($_SERVER['CONTENT_TYPE'], 'application/json'))) {
    $action = $_POST['action'] ?? '';
    $token = $_POST['csrf_token'] ?? '';

    if (empty($token) || !hash_equals($_SESSION['admin_csrf'], $token)) {
        $feedback['errors'][] = 'Invalid session token.';
    } else {
        if ($action === 'create' || $action === 'update') {
            $slideId = isset($_POST['id']) ? (int) $_POST['id'] : null;
            $title = trim($_POST['title'] ?? '');
            $caption = trim($_POST['caption'] ?? '');
            $linkUrl = trim($_POST['link_url'] ?? '');
            $displayOrder = (int) ($_POST['display_order'] ?? 0);
            $slideTimer = (int) ($_POST['slide_timer'] ?? 5000);
            $isActive = isset($_POST['is_active']) ? 1 : 0;
            $selectedImage = trim($_POST['existing_image'] ?? '');
            $imageToUse = '';

            if (!empty($linkUrl) && !filter_var($linkUrl, FILTER_VALIDATE_URL)) {
                $feedback['errors'][] = 'Please provide a valid URL.';
            }
            if ($slideTimer <= 0) {
                $slideTimer = 5000;
            }

            if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] !== UPLOAD_ERR_NO_FILE) {
                [$success, $result] = handle_image_upload($_FILES['image_file'], $uploadsDir, $thumbsDir);
                if ($success) {
                    $imageToUse = $result;
                } else {
                    $feedback['errors'][] = $result;
                }
            } elseif (!empty($selectedImage)) {
                $imageToUse = basename($selectedImage);
            }

            if ($action === 'create' && empty($imageToUse)) {
                $feedback['errors'][] = 'Please upload an image or choose one from the gallery.';
            }

            if (empty($feedback['errors'])) {
                if ($action === 'create') {
                    $stmt = $pdo->prepare('INSERT INTO homepage_slides (image_path, title, caption, link_url, display_order, is_active, slide_timer) VALUES (:image_path, :title, :caption, :link_url, :display_order, :is_active, :slide_timer)');
                    $stmt->execute([
                        'image_path' => $imageToUse,
                        'title' => $title,
                        'caption' => $caption,
                        'link_url' => $linkUrl,
                        'display_order' => $displayOrder,
                        'is_active' => $isActive,
                        'slide_timer' => $slideTimer,
                    ]);
                    header('Location: dashboard.php?status=created');
                    exit;
                }

                if ($action === 'update' && $slideId !== null) {
                    $stmtCurrent = $pdo->prepare('SELECT image_path FROM homepage_slides WHERE id = :id');
                    $stmtCurrent->execute(['id' => $slideId]);
                    $current = $stmtCurrent->fetch();

                    if ($current) {
                        $imagePath = $imageToUse ?: $current['image_path'];
                        if (!empty($imageToUse) && $imageToUse !== $current['image_path']) {
                            delete_image_files($current['image_path'], $uploadsDir, $thumbsDir);
                        }

                        $stmt = $pdo->prepare('UPDATE homepage_slides SET image_path = :image_path, title = :title, caption = :caption, link_url = :link_url, display_order = :display_order, is_active = :is_active, slide_timer = :slide_timer WHERE id = :id');
                        $stmt->execute([
                            'image_path' => $imagePath,
                            'title' => $title,
                            'caption' => $caption,
                            'link_url' => $linkUrl,
                            'display_order' => $displayOrder,
                            'is_active' => $isActive,
                            'slide_timer' => $slideTimer,
                            'id' => $slideId,
                        ]);
                        header('Location: dashboard.php?status=updated');
                        exit;
                    }

                    $feedback['errors'][] = 'Slide not found.';
                }
            }
        }

        if ($action === 'delete') {
            $slideId = (int) ($_POST['id'] ?? 0);
            $stmt = $pdo->prepare('SELECT image_path FROM homepage_slides WHERE id = :id');
            $stmt->execute(['id' => $slideId]);
            $current = $stmt->fetch();

            if ($current) {
                $pdo->prepare('DELETE FROM homepage_slides WHERE id = :id')->execute(['id' => $slideId]);
                delete_image_files($current['image_path'], $uploadsDir, $thumbsDir);
                header('Location: dashboard.php?status=deleted');
                exit;
            }
            $feedback['errors'][] = 'Slide not found.';
        }
    }
}

$status = $_GET['status'] ?? '';
if ($status === 'created') {
    $feedback['messages'][] = 'Slide created successfully.';
}
if ($status === 'updated') {
    $feedback['messages'][] = 'Slide updated successfully.';
}
if ($status === 'deleted') {
    $feedback['messages'][] = 'Slide deleted successfully.';
}

$editingSlide = null;
if (isset($_GET['edit'])) {
    $editId = (int) $_GET['edit'];
    $stmt = $pdo->prepare('SELECT * FROM homepage_slides WHERE id = :id');
    $stmt->execute(['id' => $editId]);
    $editingSlide = $stmt->fetch();
    if (!$editingSlide) {
        $feedback['errors'][] = 'Unable to find the selected slide.';
    }
}

$stmt = $pdo->query('SELECT * FROM homepage_slides ORDER BY display_order ASC, created_at ASC');
$slides = $stmt->fetchAll();

$csrfToken = $_SESSION['admin_csrf'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slider Dashboard</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body class="admin">
    <header class="top-bar">
        <h1>Homepage Slider</h1>
        <nav>
            <a href="dashboard.php">Dashboard</a>
            <a href="index.php?logout=1" class="logout">Logout</a>
        </nav>
    </header>
    <main class="admin-main">
        <?php foreach ($feedback['messages'] as $message) : ?>
            <div class="alert success"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endforeach; ?>
        <?php foreach ($feedback['errors'] as $message) : ?>
            <div class="alert error"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endforeach; ?>

        <section class="panel">
            <div class="panel-header">
                <h2><?= $editingSlide ? 'Edit Slide' : 'Add Slide'; ?></h2>
                <?php if ($editingSlide) : ?>
                    <a class="btn" href="dashboard.php">Create New</a>
                <?php endif; ?>
            </div>
            <form class="form" method="post" enctype="multipart/form-data">
                <div class="form-grid">
                    <div class="form-field">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" value="<?= htmlspecialchars($editingSlide['title'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                    </div>
                    <div class="form-field">
                        <label for="link_url">Link URL</label>
                        <input type="url" id="link_url" name="link_url" placeholder="https://example.com" value="<?= htmlspecialchars($editingSlide['link_url'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                    </div>
                    <div class="form-field">
                        <label for="display_order">Display Order</label>
                        <input type="number" id="display_order" name="display_order" value="<?= htmlspecialchars((string) ($editingSlide['display_order'] ?? 0), ENT_QUOTES, 'UTF-8'); ?>">
                    </div>
                    <div class="form-field">
                        <label for="slide_timer">Slide Timer (ms)</label>
                        <input type="number" id="slide_timer" name="slide_timer" min="1000" step="500" value="<?= htmlspecialchars((string) ($editingSlide['slide_timer'] ?? 5000), ENT_QUOTES, 'UTF-8'); ?>">
                    </div>
                </div>
                <div class="form-field">
                    <label for="caption">Caption</label>
                    <textarea id="caption" name="caption" rows="4"><?= htmlspecialchars($editingSlide['caption'] ?? '', ENT_QUOTES, 'UTF-8'); ?></textarea>
                </div>
                <div class="form-upload">
                    <div>
                        <label for="image_file">Upload Image (JPG, PNG, WEBP, GIF up to 5MB)</label>
                        <input type="file" id="image_file" name="image_file" accept="image/*">
                    </div>
                    <div>
                        <label>Choose from Gallery</label>
                        <div class="gallery-picker">
                            <input type="hidden" id="existing_image" name="existing_image" value="<?= htmlspecialchars($editingSlide['image_path'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                            <button type="button" class="btn secondary" data-open-gallery>Choose from Gallery</button>
                            <span class="selected-image" data-selected-label><?= htmlspecialchars($editingSlide['image_path'] ?? 'No image selected', ENT_QUOTES, 'UTF-8'); ?></span>
                        </div>
                    </div>
                    <div class="switch">
                        <input type="checkbox" id="is_active" name="is_active" <?= !isset($editingSlide['is_active']) || (int) $editingSlide['is_active'] === 1 ? 'checked' : ''; ?>>
                        <label for="is_active">Active</label>
                    </div>
                </div>
                <div class="form-actions">
                    <input type="hidden" name="action" value="<?= $editingSlide ? 'update' : 'create'; ?>">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
                    <?php if ($editingSlide) : ?>
                        <input type="hidden" name="id" value="<?= (int) $editingSlide['id']; ?>">
                    <?php endif; ?>
                    <button class="btn" type="submit"><?= $editingSlide ? 'Update Slide' : 'Create Slide'; ?></button>
                    <button class="btn secondary" type="button" data-preview>Preview</button>
                </div>
            </form>
        </section>

        <section class="panel">
            <div class="panel-header">
                <h2>Existing Slides</h2>
            </div>
            <div class="table-wrapper">
                <table class="slides-table" data-draggable>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Preview</th>
                            <th>Title</th>
                            <th>Timer (ms)</th>
                            <th>Status</th>
                            <th>Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($slides)) : ?>
                            <tr>
                                <td colspan="7">No slides have been created yet.</td>
                            </tr>
                        <?php else : ?>
                            <?php foreach ($slides as $slide) : ?>
                                <tr data-id="<?= (int) $slide['id']; ?>">
                                    <td class="handle" title="Drag to reorder">☰</td>
                                    <td>
                                        <?php if (!empty($slide['image_path'])) : ?>
                                            <img src="uploads/thumbnails/<?= htmlspecialchars($slide['image_path'], ENT_QUOTES, 'UTF-8'); ?>" alt="<?= htmlspecialchars($slide['title'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                                        <?php endif; ?>
                                    </td>
                                    <td><?= htmlspecialchars($slide['title'] ?? '(Untitled)', ENT_QUOTES, 'UTF-8'); ?></td>
                                    <td><?= (int) $slide['slide_timer']; ?></td>
                                    <td><span class="status <?= (int) $slide['is_active'] === 1 ? 'active' : 'inactive'; ?>"><?= (int) $slide['is_active'] === 1 ? 'Active' : 'Inactive'; ?></span></td>
                                    <td><?= htmlspecialchars($slide['updated_at'], ENT_QUOTES, 'UTF-8'); ?></td>
                                    <td class="actions">
                                        <a class="btn secondary" href="dashboard.php?edit=<?= (int) $slide['id']; ?>">Edit</a>
                                        <button class="btn tertiary" type="button" data-toggle data-id="<?= (int) $slide['id']; ?>">Toggle</button>
                                        <form method="post" onsubmit="return confirm('Delete this slide?');">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?= (int) $slide['id']; ?>">
                                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
                                            <button class="btn danger" type="submit">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <div class="modal" data-gallery-modal hidden>
        <div class="modal-backdrop" data-close-gallery></div>
        <div class="modal-card">
            <header>
                <h3>Image Gallery</h3>
                <button type="button" class="btn tertiary" data-close-gallery>&times;</button>
            </header>
            <div class="modal-body">
                <div class="gallery-grid" data-gallery-grid></div>
                <div class="pagination" data-gallery-pagination></div>
            </div>
        </div>
    </div>

    <div class="modal" data-preview-modal hidden>
        <div class="modal-backdrop" data-close-preview></div>
        <div class="modal-card preview-card">
            <header>
                <h3>Slide Preview</h3>
                <button type="button" class="btn tertiary" data-close-preview>&times;</button>
            </header>
            <div class="modal-body" data-preview-body></div>
        </div>
    </div>

    <script>
        window.ADMIN_CONFIG = {
            csrfToken: '<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>'
        };
    </script>
    <script src="../js/admin.js" defer></script>
</body>
</html>
