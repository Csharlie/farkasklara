<?php
/**
 * Farkas Klára preview — login page (brand colors, no external resources).
 */
declare(strict_types=1);
require __DIR__ . '/gate.php';

fk_private_headers();

if (isset($_GET['logout'])) {
    fk_clear_token();
    header('Location: ' . fk_base() . 'login.php', true, 302);
    exit;
}

/** Only same-site paths under the base are accepted as redirect targets. */
function fk_next(): string {
    $next = (string) ($_POST['next'] ?? $_GET['next'] ?? '');
    $base = fk_base();
    if ($next === '' || !str_starts_with($next, $base) || str_contains($next, '//') || str_contains($next, '\\')) return $base;
    return $next;
}

$error = null;
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    usleep(400000); // slows down guessing
    if (fk_password_ok((string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''))) {
        fk_issue_token();
        header('Location: ' . fk_next(), true, 303);
        exit;
    }
    $error = 'Hibás felhasználónév vagy jelszó.';
}
$next = htmlspecialchars(fk_next(), ENT_QUOTES, 'UTF-8');
?><!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Előnézet — Farkas Klára Könyvelőiroda</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased;
    color: hsl(213 28% 17%);
    background: radial-gradient(ellipse at top, hsl(42 63% 48% / 0.12), transparent 60%), hsl(38 27% 94%);
  }
  .card {
    width: 100%; max-width: 26rem; padding: 2.5rem 2rem; border-radius: 1rem;
    background: #fff; border: 1px solid hsl(38 20% 85%);
    box-shadow: 0 30px 60px -30px hsl(215 22% 19% / 0.35);
  }
  .brand { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.01em; text-align: center; }
  .brand span { color: hsl(41 72% 31%); }
  .lead { margin: 0.5rem 0 2rem; text-align: center; color: hsl(215 14% 40%); font-size: 0.9375rem; }
  label { display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.375rem; }
  input {
    width: 100%; padding: 0.75rem 0.875rem; border-radius: 0.5rem; font: inherit;
    border: 1px solid hsl(38 15% 78%); background: #fff; color: inherit;
  }
  input:focus { outline: 2px solid hsl(41 72% 31%); outline-offset: 1px; border-color: transparent; }
  .field + .field { margin-top: 1rem; }
  button {
    margin-top: 1.75rem; width: 100%; padding: 0.875rem; border: 0; border-radius: 999px; cursor: pointer;
    font: inherit; font-weight: 700; color: hsl(213 28% 17%); background: hsl(42 63% 48%);
  }
  button:hover { background: hsl(42 63% 43%); }
  .error { margin-bottom: 1.25rem; padding: 0.75rem 0.875rem; border-radius: 0.5rem; font-size: 0.875rem; background: hsl(0 70% 96%); color: hsl(0 60% 35%); }
  .foot { margin-top: 1.5rem; text-align: center; font-size: 0.75rem; color: hsl(215 14% 50%); }
</style>
</head>
<body>
  <main class="card">
    <p class="brand">Farkas Klára <span>Könyvelőiroda</span></p>
    <p class="lead">A weboldal előnézete. Kérjük, jelentkezzen be.</p>
    <?php if ($error): ?><p class="error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <form method="post" action="<?= htmlspecialchars(fk_base(), ENT_QUOTES, 'UTF-8') ?>login.php">
      <input type="hidden" name="next" value="<?= $next ?>">
      <div class="field">
        <label for="username">Felhasználónév</label>
        <input id="username" name="username" autocomplete="username" required autofocus>
      </div>
      <div class="field">
        <label for="password">Jelszó</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button type="submit">Belépés</button>
    </form>
    <p class="foot">PSPro · előnézet</p>
  </main>
</body>
</html>
