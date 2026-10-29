<?php
/**
 * Farkas Klára preview — serves the SPA (index.html) to logged-in visitors,
 * everyone else goes to the login page. Every non-file request lands here
 * (.htaccess), so deep links (/farkasklara/kapcsolat) work after login.
 */
declare(strict_types=1);
require __DIR__ . '/gate.php';

fk_private_headers();

if (!fk_token_ok()) {
    $target = $_SERVER['REQUEST_URI'] ?? fk_base();
    header('Location: ' . fk_base() . 'login.php?next=' . rawurlencode($target), true, 302);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
