<?php
/**
 * Farkas Klára — quote request endpoint (production, https://farkaskonyveles.hu).
 *
 * Receives the fk-quote form (src/data/php-form-handler.ts) and mails it to the
 * firm's enquiry mailbox. Answers JSON in the platform FormSubmitResult shape:
 *   {"status":"ok"} | {"status":"error","message":…,"field":…} | {"status":"rate_limited","retryAfter":…}
 *
 * Settings come from ajanlatkeres-config.php, generated at build time from
 * src/content (recipient, domain, service labels, messages) — never from the
 * request. Uploaded by `pnpm deploy:production`.
 *
 * PHP 7 compatible: no str_starts_with / match / arrow functions / typed properties.
 */
declare(strict_types=1);

// PHP notices must never end up inside the JSON answer.
ini_set('display_errors', '0');
date_default_timezone_set('Europe/Budapest');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

require __DIR__ . '/ajanlatkeres-ratelimit.php'; // FK_RATE_WINDOW, fk_rate_dir(), fk_rate_file(), fk_rate_sweep()
$config = require __DIR__ . '/ajanlatkeres-config.php';

/** Rate limit: at most this many submissions per IP within the window (FK_RATE_WINDOW). */
const FK_RATE_MAX = 5;
/** Submissions faster than this after page load (ms) are treated as bots. */
const FK_MIN_ELAPSED_MS = 3000;

function fk_respond(int $status, array $body)
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fk_fail(int $status, string $message, string $field = '')
{
    $body = ['status' => 'error', 'message' => $message];
    if ($field !== '') {
        $body['field'] = $field;
    }
    fk_respond($status, $body);
}

/** Lower-case host of a URL, '' when there is none. */
function fk_host_of(string $url): string
{
    $host = parse_url($url, PHP_URL_HOST);
    return is_string($host) ? strtolower($host) : '';
}

/** A posted text field: trimmed string, '' when missing or not a string. */
function fk_text(string $key): string
{
    $value = $_POST[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

function fk_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

/** Control characters (incl. CR/LF) → space: values can never break a mail header. */
function fk_single_line(string $value): string
{
    return trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
}

/** RFC 2047 encoded header text (UTF-8). */
function fk_mime_header(string $value): string
{
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($value, 'UTF-8', 'B', "\r\n");
    }
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

/**
 * Sliding-window limit per visitor. Stores only an HMAC-SHA256 of the IP (the
 * key is a per-build secret from ajanlatkeres-config.php, which the
 * .htaccess denies direct access to — the IP cannot be recovered or
 * brute-forced from the file name without that key) and the timestamps of
 * recent submissions. Entries older than the window are dropped whenever
 * that IP's file is next read, and every request also sweeps the whole temp
 * directory for stale or empty files (fk_rate_sweep, shared with the cron
 * job in ajanlatkeres-cleanup.php — see the README for its setup) — so a
 * one-off visitor's file is deleted the next time anyone submits the form,
 * not just their own next visit, and within FK_RATE_WINDOW regardless of
 * traffic once the cron job runs.
 * Returns the seconds to wait, 0 when the request may proceed.
 */
function fk_rate_limit(string $ip, string $key): int
{
    $dir = fk_rate_dir();
    $now = time();
    $file = fk_rate_file($dir, $ip, $key);

    // Opportunistic cleanup on every request — cheap at this endpoint's
    // traffic — on top of the cron job, which is what actually guarantees
    // the 10-minute retention on a quiet day.
    fk_rate_sweep($dir, $now);

    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return 0; // No writable temp dir: do not block real visitors.
    }
    flock($handle, LOCK_EX);
    $stored = json_decode((string) stream_get_contents($handle), true);
    $times = [];
    foreach (is_array($stored) ? $stored : [] as $time) {
        if (is_int($time) && $time > $now - FK_RATE_WINDOW) {
            $times[] = $time;
        }
    }
    $wait = 0;
    if (count($times) >= FK_RATE_MAX) {
        $wait = max(1, min($times) + FK_RATE_WINDOW - $now);
    } else {
        $times[] = $now;
    }
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode($times));
    flock($handle, LOCK_UN);
    fclose($handle);
    return $wait;
}

$messages = $config['messages'];

// 1. Only POST from a page of this site --------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fk_fail(405, $messages['general']);
}
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
// Browsers send Origin on POST; Referer is the fallback. Neither → not our form.
$source = $origin !== '' ? $origin : $referer;
if ($source === '' || fk_host_of($source) !== strtolower($config['host'])) {
    fk_fail(403, $messages['general']);
}

// 2. Rate limit -----------------------------------------------------------------
$wait = fk_rate_limit((string) ($_SERVER['REMOTE_ADDR'] ?? ''), (string) $config['ipHashKey']);
if ($wait > 0) {
    header('Retry-After: ' . $wait);
    fk_respond(429, ['status' => 'rate_limited', 'retryAfter' => $wait]);
}

// 3. Spam traps: answer "ok" so bots learn nothing, but send no mail ----------
if (fk_text('website') !== '' || (int) fk_text('elapsed') < FK_MIN_ELAPSED_MS) {
    fk_respond(200, ['status' => 'ok']);
}

// 4. Validation (mirrors the form's own checks) -------------------------------
$name = fk_single_line(fk_text('name'));
$email = fk_text('email');
$phone = fk_single_line(fk_text('phone'));
$message = fk_text('message');

if ($name === '' || fk_length($name) > 100) {
    fk_fail(422, $messages['name'], 'name');
}
if ($email === '' && $phone === '') {
    fk_fail(422, $messages['contact'], 'email');
}
if ($email !== '' && (fk_length($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false)) {
    fk_fail(422, $messages['email'], 'email');
}
if (fk_length($phone) > 40) {
    fk_fail(422, $messages['contact'], 'phone');
}
if (fk_length($message) > 5000) {
    fk_fail(422, $messages['general'], 'message');
}

// services[]: 1…N distinct labels, each one of the site's services.
$services = $_POST['services'] ?? null;
if (!is_array($services) || count($services) === 0 || count($services) > count($config['services'])) {
    fk_fail(422, $messages['services'], 'service');
}
foreach ($services as $service) {
    if (!is_string($service) || !in_array($service, $config['services'], true)) {
        fk_fail(422, $messages['services'], 'service');
    }
}
if (count(array_unique($services)) !== count($services)) {
    fk_fail(422, $messages['services'], 'service');
}
if (fk_text('consent') !== 'yes') {
    fk_fail(422, $messages['consent'], 'consent');
}

// 5. Mail to the enquiry mailbox ------------------------------------------------
// From and the envelope sender (-f) are the site's own mailbox, so SPF/DKIM of
// farkaskonyveles.hu apply; replies go to the visitor via Reply-To.
$from = (string) $config['from'];
$headers = [
    'From: ' . fk_mime_header($config['site'] . ' – weboldal') . ' <' . $from . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
];
if ($email !== '') {
    $headers[] = 'Reply-To: ' . $email;
}

$body = implode("\r\n", [
    'Új ajánlatkérés érkezett a weboldalról (' . $config['host'] . ').',
    '',
    'Név: ' . $name,
    'E-mail: ' . ($email !== '' ? $email : '–'),
    'Telefon: ' . ($phone !== '' ? $phone : '–'),
    'Szolgáltatás: ' . implode(', ', $services),
    '',
    'Üzenet:',
    $message !== '' ? $message : '–',
    '',
    '—',
    'Az adatkezelési tájékoztatót a küldő megismerte.',
    'Beküldve: ' . date('Y-m-d H:i'),
]);

$subject = fk_mime_header('Ajánlatkérés: ' . $name);
// Quoted-printable: some mail transports mangle long 8bit lines (RFC 5322
// caps a line at 998 octets); quoted_printable_encode() keeps every line
// short and pure ASCII, so the Hungarian accented text always arrives intact.
$sent = mail((string) $config['to'], $subject, quoted_printable_encode($body), implode("\r\n", $headers), '-f' . $from);
if (!$sent) {
    $fallback = $config['phone'] !== '' ? ' Telefon: ' . $config['phone'] : '';
    fk_fail(500, $messages['general'] . $fallback);
}

fk_respond(200, ['status' => 'ok']);
