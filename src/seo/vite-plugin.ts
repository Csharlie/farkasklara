import { randomBytes } from 'node:crypto'
import type { Plugin } from 'vite'
import { content } from '../content'
import { buildSiteData } from '../data/build-site'
import { quoteFormConfigPhp } from '../data/quote-form-config'
import { prerenderSite } from './prerender'

/**
 * Build modes that deploy behind the preview login gate (scripts/deploy.mjs).
 * They must never be indexed, so their HTML gets a robots noindex meta.
 */
export const GATED_MODES = ['staging', 'pspro'] as const

/** Fonts worth preloading: the body text face (regular weight), Latin + Hungarian accents. */
const PRELOAD_FONT = /instrument-sans-latin(-ext)?-400-normal[^/]*\.woff2$/

/**
 * Client SEO build step (Vite plugin).
 *
 * - Gated preview builds (`--mode staging | pspro`): adds
 *   `<meta name="robots" content="noindex, nofollow">` to index.html, and
 *   nothing else (the gate serves one index.html for every route).
 * - Production build (`vite build`): one HTML file per SiteData page with its
 *   own title, description, canonical, Open Graph and (homepage) JSON-LD, plus
 *   404.html, sitemap.xml and robots.txt — see src/seo/prerender.ts — and
 *   the quote endpoint's settings (ajanlatkeres-config.php).
 *
 * SiteData is built here in Node from the same content as the app. The data
 * layer only imports types from the platform, so no React code runs.
 */
export function fkSeo(): Plugin {
  let mode = ''
  let base = '/'

  return {
    name: 'fk-seo',
    // After Vite's own HTML plugin, so index.html is final (hashed asset URLs).
    enforce: 'post',
    configResolved(config) {
      mode = config.mode
      base = config.base
    },
    transformIndexHtml(html) {
      if (!(GATED_MODES as readonly string[]).includes(mode)) return html
      return html.replace('</title>', '</title>\n    <meta name="robots" content="noindex, nofollow" />')
    },
    generateBundle(_options, bundle) {
      if (mode !== 'production') return
      if (base !== '/') this.error(`production build must use base "/" (got "${base}") — canonical URLs name the domain root`)

      const index = bundle['index.html']
      if (!index || index.type !== 'asset') this.error('index.html missing from the bundle')

      const fontPreloads = Object.keys(bundle)
        .filter((file) => PRELOAD_FONT.test(file))
        .map((file) => base + file)

      const site = buildSiteData(content)
      for (const file of prerenderSite(String(index.source), site, content, { fontPreloads })) {
        if (file.fileName === 'index.html') index.source = file.source
        else this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source })
      }
      // 16 random bytes (128-bit) HMAC key, generated fresh on every build — never
      // reused, never in the repo. See quoteFormConfig() / ajanlatkeres.php.
      this.emitFile({ type: 'asset', fileName: 'ajanlatkeres-config.php', source: quoteFormConfigPhp(content, randomBytes(16).toString('hex')) })
    },
  }
}
