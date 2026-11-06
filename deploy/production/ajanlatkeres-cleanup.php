<?php
/**
 * Farkas Klára — cron sweep for the quote-form rate limiter.
 *
 * ajanlatkeres.php already sweeps on every request, but on a quiet day
 * nothing may hit the endpoint for hours, so a one-off visitor's rate-limit
 * file (an HMAC of their IP, see ajanlatkeres-ratelimit.php) could outlive
 * the stated 10-minute retention. This script makes that deletion happen on
 * schedule instead of only "whenever someone next submits the form" — set it
 * up as a cron job (README: "Élesítés a farkaskonyveles.hu-n").
 *
 * CLI only: the .htaccess also denies it over HTTP, but this check holds
 * even if that rule is ever missing or misconfigured.
 *
 * PHP 7 compatible: no str_starts_with / match / arrow functions.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden');
}

require __DIR__ . '/ajanlatkeres-ratelimit.php';

$removed = fk_rate_sweep(sys_get_temp_dir(), time());
echo "ajanlatkeres-cleanup: removed {$removed} stale/empty rate-limit file(s)\n";
