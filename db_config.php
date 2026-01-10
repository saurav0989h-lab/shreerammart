<?php
// Database bootstrap for the promotional slider system.
// Update the constants below with your production credentials.
const DB_HOST = 'localhost';
const DB_NAME = 'your_database_name';
const DB_USER = 'your_username';
const DB_PASS = 'your_password';

function get_pdo(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            exit('Database connection failed.');
        }
    }

    return $pdo;
}
