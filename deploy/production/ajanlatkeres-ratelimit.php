<?php
/**
 * Farkas Klára — rate-limit storage shared by ajanlatkeres.php (writes/reads
 * on every submission) and ajanlatkeres-cleanup.php (the cron sweep). One
 * file so both always agree on the file naming and the retention window.
 *
 * Each visitor's temp file is named after an HMAC-SHA256 of their IP address,
 * keyed with a secret that is generated fresh on every build
 * (ajanlatkeres-config.php, ipHashKey) and never committed to the repo. A
 * keyed hash (HMAC), not a plain hash of "secret + IP", is used on purpose:
 * without the key, the IP cannot be recovered or brute-forced from the file
 * name — not even by trying every IPv4 address, since the attacker would
 * also have to guess the 128-bit key.
 *
 * PHP 7 compatible: no str_starts_with / match / arrow functions.
 */
declare(strict_types=1);

/** Sliding-window length (seconds) — also how long a visitor's entry may live. */
const FK_RATE_WINDOW = 600;

/** HMAC-SHA256 of the IP, keyed with the build's secret — never the plain IP. */
function fk_rate_hash(string $ip, string $key): string
{
    return hash_hmac('sha256', $ip, $key);
}

function fk_rate_file(string $dir, string $ip, string $key): string
{
    return $dir . '/fk-ajanlatkeres-' . fk_rate_hash($ip, $key);
}

/**
 * Deletes every rate-limit file that is either stale (untouched for a full
 * window — the visitor's own entries have already aged out, nothing of
 * theirs is left to filter) or empty (a write that never completed). Returns
 * the number of files removed, for the cron job's log.
 */
function fk_rate_sweep(string $dir, int $now): int
{
    $removed = 0;
    foreach (glob($dir . '/fk-ajanlatkeres-*') ?: [] as $file) {
        if (!is_file($file)) {
            continue;
        }
        $stale = filemtime($file) < $now - FK_RATE_WINDOW;
        $empty = filesize($file) === 0;
        if (($stale || $empty) && @unlink($file)) {
            $removed++;
        }
    }
    return $removed;
}
