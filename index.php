<?php
require_once __DIR__ . '/db_config.php';

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, image_path, title, caption, link_url, slide_timer FROM homepage_slides WHERE is_active = 1 ORDER BY display_order ASC, created_at ASC');
$stmt->execute();
$slides = $stmt->fetchAll();

$defaultTimer = 5000;
$globalTimer = $defaultTimer;
if (!empty($slides)) {
    $firstTimer = (int) ($slides[0]['slide_timer'] ?? 0);
    $globalTimer = $firstTimer > 0 ? $firstTimer : $defaultTimer;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Homepage Slider</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <main>
        <section class="homepage-hero">
            <?php if (empty($slides)) : ?>
                <p class="slider-empty">No promotional slides are available yet.</p>
            <?php else : ?>
                <div class="slideshow-container" data-slider>
                    <?php foreach ($slides as $index => $slide) : ?>
                        <article class="mySlides fade" data-slide-id="<?= (int) $slide['id']; ?>" data-timer="<?= (int) ($slide['slide_timer'] ?: $defaultTimer); ?>">
                            <img src="admin/uploads/<?= htmlspecialchars($slide['image_path'], ENT_QUOTES, 'UTF-8'); ?>" alt="<?= htmlspecialchars($slide['title'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                            <div class="slide-text">
                                <?php if (!empty($slide['title'])) : ?>
                                    <h2><?= htmlspecialchars($slide['title'], ENT_QUOTES, 'UTF-8'); ?></h2>
                                <?php endif; ?>
                                <?php if (!empty($slide['caption'])) : ?>
                                    <p><?= nl2br(htmlspecialchars($slide['caption'], ENT_QUOTES, 'UTF-8')); ?></p>
                                <?php endif; ?>
                                <?php if (!empty($slide['link_url'])) : ?>
                                    <a href="<?= htmlspecialchars($slide['link_url'], ENT_QUOTES, 'UTF-8'); ?>" class="slide-button" target="_blank" rel="noopener">Shop Now</a>
                                <?php endif; ?>
                            </div>
                        </article>
                    <?php endforeach; ?>
                    <button class="prev" type="button" aria-label="Previous slide" data-prev>&#10094;</button>
                    <button class="next" type="button" aria-label="Next slide" data-next>&#10095;</button>
                </div>
                <div class="slider-dots" role="tablist" aria-label="Promotional slides">
                    <?php foreach ($slides as $index => $slide) : ?>
                        <button type="button" class="dot" aria-label="Go to slide <?= $index + 1; ?>" data-target="<?= $index + 1; ?>"></button>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>
    </main>

    <script>
        window.SLIDER_CONFIG = {
            defaultInterval: <?= $defaultTimer; ?>,
            globalInterval: <?= $globalTimer; ?>
        };
    </script>
    <script src="js/slider.js"></script>
</body>
</html>
