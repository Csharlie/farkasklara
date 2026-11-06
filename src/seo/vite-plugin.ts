import type { Plugin } from 'vite'

/**
 * Build modes that deploy behind the preview login gate (scripts/deploy.mjs).
 * They must never be indexed, so their HTML gets a robots noindex meta.
 */
export const GATED_MODES = ['staging', 'pspro'] as const

/**
 * Client SEO build step (Vite plugin).
 *
 * - Gated preview builds (`--mode staging | pspro`): adds
 *   `<meta name="robots" content="noindex, nofollow">` to index.html.
 * - The production build (`vite build`, mode `production`) stays indexable.
 */
export function fkSeo(): Plugin {
  let mode = ''

  return {
    name: 'fk-seo',
    configResolved(config) {
      mode = config.mode
    },
    transformIndexHtml(html) {
      if (!(GATED_MODES as readonly string[]).includes(mode)) return html
      return html.replace('</title>', '</title>\n    <meta name="robots" content="noindex, nofollow" />')
    },
  }
}
