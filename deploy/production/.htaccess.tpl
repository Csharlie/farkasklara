# Farkas Klára — production site ({{ORIGIN}}). Generated from
# deploy/production/.htaccess.tpl by scripts/deploy.mjs; the cPanel-generated
# blocks above (MultiPHP) are kept as they were on the server.
# Apache 2.4 and LiteSpeed: no <If> blocks; path-specific caching lives in
# assets/.htaccess and images/.htaccess.

Options -Indexes
DirectoryIndex index.html
AddDefaultCharset utf-8

# Every page is a flat file: /kapcsolat → kapcsolat.html. /szolgaltatasok is
# both a page (szolgaltatasok.html) and a folder (szolgaltatasok/*.html); with
# the default DirectorySlash On, Apache would answer /szolgaltatasok with a
# 301 to /szolgaltatasok/, which is not the canonical URL.
DirectorySlash Off

# Unknown URLs: the site's own 404 page, with a real 404 status.
ErrorDocument 404 /404.html

# Server-side files that are never served: the form settings, the rate-limit
# helpers meant for CLI/cron only, and any login gate files left over from
# the staging preview.
<FilesMatch "^(ajanlatkeres-config|ajanlatkeres-ratelimit|ajanlatkeres-cleanup|gate|auth-config|auth-check|login)\.php$">
    Require all denied
</FilesMatch>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # 0. /.well-known/ (AutoSSL / ACME, domain validation): no rewrite at all,
    #    on http and https alike.
    RewriteRule ^\.well-known/ - [L]

    # 1. http:// or another host name (www.) → {{ORIGIN}}, trailing slash
    #    dropped — one single 301, no redirect chain.
    RewriteCond %{HTTPS} !=on [OR]
    RewriteCond %{HTTP_HOST} !^{{HOST_PATTERN}}$ [NC]
    RewriteCond %{REQUEST_URI} ^/(.*?)/*$
    RewriteRule ^ {{ORIGIN}}/%1 [R=301,L,NE]

    # 2. Trailing slash → the canonical URL without it (/kapcsolat/ → /kapcsolat).
    RewriteRule ^(.+?)/+$ {{ORIGIN}}/$1 [R=301,L,NE]

    # 3. Direct file names → the clean URL (/index.html → /, /kapcsolat.html →
    #    /kapcsolat). THE_REQUEST is the browser's original request line, so the
    #    internal rewrite of rule 4 never loops back here.
    RewriteCond %{THE_REQUEST} ^[A-Z]+\s/index\.html[\s?]
    RewriteRule ^ {{ORIGIN}}/ [R=301,L]
    RewriteCond %{THE_REQUEST} ^[A-Z]+\s/([^?\s]+)\.html[\s?]
    RewriteCond %1 !^404$
    RewriteRule ^ {{ORIGIN}}/%1 [R=301,L,NE]

    # 4. Clean URL → its page file (404.html only ever answers as an error).
    RewriteCond $1 !^404$
    RewriteCond %{REQUEST_FILENAME}.html -f
    RewriteRule ^(.+)$ $1.html [L]

    # 5. A folder without a page of its own (/assets, /images) → 404, not 403.
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^.+$ - [R=404,L]
</IfModule>

<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    # Pages, sitemap and robots.txt are revalidated on every visit, so a new
    # deploy shows up at once. Hashed /assets files are cached for a year
    # (assets/.htaccess) — a new build gives them new names.
    <FilesMatch "\.(html|xml|txt)$">
        Header set Cache-Control "no-cache"
    </FilesMatch>
</IfModule>

<IfModule mod_mime.c>
    AddType image/webp .webp
    AddType font/woff2 .woff2
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml application/javascript application/json image/svg+xml
</IfModule>
