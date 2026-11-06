#!/usr/bin/env node
/**
 * Generates the static images derived from existing assets. Run once after a
 * source change and commit the output (they are not built on every deploy):
 *
 *   node scripts/make-images.mjs
 *
 * - public/favicon.svg, favicon-32.png, apple-touch-icon.png — temporary
 *   "FK" monogram (src/sections/shared/monogram.ts) until a logo exists.
 *   The letters are drawn as shapes, so the icon never depends on a font.
 * - public/og-image.jpg — 1200×630 social share image (Open Graph), cropped
 *   from the hero photo.
 * - public/images/hero.webp — smaller WebP copy of the hero photo.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const pub = (file) => join(root, 'public', file)

// Brand colors from src/index.css: --fk-surface-strong, --fk-accent.
const background = '#262f3b'
const accent = '#c8992d'

const letters = `
  <g fill="${accent}">
    <rect x="12" y="18" width="6" height="28"/>
    <rect x="12" y="18" width="16" height="6"/>
    <rect x="12" y="29" width="13" height="5"/>
    <rect x="32" y="18" width="6" height="28"/>
    <polygon points="38,28.5 45.5,18 52.5,18 38,38"/>
    <polygon points="41.5,30.5 52.5,46 45.5,46 38,35.5"/>
  </g>`
const icon = (radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="${background}"/>${letters}</svg>\n`

// Browser tab icon: rounded square. Apple icon: full square (iOS rounds it itself).
writeFileSync(pub('favicon.svg'), icon(12))
await sharp(Buffer.from(icon(12))).resize(32, 32).png().toFile(pub('favicon-32.png'))
await sharp(Buffer.from(icon(0))).resize(180, 180).png().toFile(pub('apple-touch-icon.png'))

const hero = pub('images/hero.jpg')
await sharp(hero).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, mozjpeg: true }).toFile(pub('og-image.jpg'))
await sharp(hero).webp({ quality: 78 }).toFile(pub('images/hero.webp'))

console.log('✔ favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.jpg, images/hero.webp')
