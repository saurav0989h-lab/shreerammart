Homepage Promotional Slider System
=================================

Requirements
------------
* PHP 7.4 or newer with PDO, GD (with JPEG, PNG, WEBP, GIF support), and JSON extensions enabled
* MySQL 5.7+ or MariaDB equivalent
* Web server configured to serve the project root

Initial Setup
-------------
1. Copy the project directory to your web server.
2. Import setup.sql into your target database to create the `homepage_slides` table.
3. Update DB_HOST, DB_NAME, DB_USER, and DB_PASS in db_config.php with your credentials.
4. Ensure the admin/uploads directory (and thumbnails subfolder) are writable by the web server user.
5. Optionally protect the admin directory with HTTP authentication in addition to the built-in login.

Admin Access
------------
* Navigate to /admin/ and log in with the default credentials:
  * Username: admin
  * Password: admin123
* Change the password immediately by replacing ADMIN_PASSWORD_HASH in admin/index.php with a newly generated hash (use `password_hash('new-password', PASSWORD_DEFAULT)`).

Managing Slides
---------------
* Create or edit slides from the dashboard. Upload new images or choose an existing asset from the gallery modal.
* Reorder slides via drag-and-drop; changes save automatically.
* Toggle a slide between active/inactive without deleting it.
* Configure individual slide timers in milliseconds; the frontend slider will use the slide-specific values.

Frontend Slider
---------------
* The homepage slider (index.php) automatically renders active slides ordered by display_order.
* Navigation arrows, dot indicators, autoplay, and hover pause are wired in js/slider.js.
* The slider adapts to responsive breakpoints defined in css/style.css.

Security Notes
--------------
* All admin forms include CSRF protection and server-side validation.
* Inputs are sanitized and rendered with escaping to prevent XSS.
* Uploaded images are validated, resized to a maximum of 1920x800, and thumbnails are generated automatically.
* Gallery deletions are only allowed when an image is not referenced by any slide.

Troubleshooting
---------------
* If images are not appearing, verify GD extension support for the uploaded format.
* Ensure file permissions for admin/uploads allow the server to write and delete files.
* Check web server and PHP error logs for additional diagnostics.
