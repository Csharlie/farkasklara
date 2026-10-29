# Farkas Klára preview — login gate + SPA fallback. Generated from
# deploy/pspro/.htaccess.tpl by scripts/deploy-pspro.mjs ({{BASE}} = deploy base).
DirectoryIndex auth-check.php
Options -Indexes

# Gate internals are never served directly.
<FilesMatch "^(gate|auth-config)\.php$">
    Require all denied
</FilesMatch>

<IfModule mod_headers.c>
    Header always set X-Robots-Tag "noindex, nofollow"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase {{BASE}}

    # Login page and the gate itself are always reachable.
    RewriteRule ^(login|auth-check)\.php$ - [L]

    # index.html only through the gate.
    RewriteRule ^index\.html$ {{BASE}}auth-check.php [L]

    # Static files (JS, CSS, images) need the login cookie.
    RewriteCond %{HTTP_COOKIE} !fk_preview=
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule . {{BASE}}login.php [L,R=302]

    # SPA routes (/kapcsolat, /rolunk, …) → gate → index.html.
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . {{BASE}}auth-check.php [L]
</IfModule>
