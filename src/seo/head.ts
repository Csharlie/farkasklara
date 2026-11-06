import type { PageMeta } from '@spektra/types'

/** Escapes a value for an HTML attribute or text node. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface HeadOptions {
  siteName: string
  /** Open Graph locale, e.g. 'hu_HU'. */
  locale: string
  /** false → robots noindex (the page is still crawled for its links). */
  indexable: boolean
  /** Extra ready-made tags (preloads, JSON-LD). */
  extra?: string[]
}

/**
 * Per-page head tags of the production build: title and description, the
 * canonical URL, Open Graph (Facebook, LinkedIn, Messenger previews) and the
 * Twitter card. Values come from the page's PageMeta (src/data/build-pages.ts).
 */
export function headTags(meta: PageMeta, options: HeadOptions): string[] {
  const property = (name: string, value: string | number | undefined) =>
    value === undefined ? undefined : `<meta property="${name}" content="${escapeHtml(String(value))}" />`
  const named = (name: string, value: string | undefined) =>
    value === undefined ? undefined : `<meta name="${name}" content="${escapeHtml(value)}" />`

  const image = meta.ogImage
  return [
    options.indexable ? undefined : named('robots', 'noindex, follow'),
    meta.canonical ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />` : undefined,
    property('og:type', 'website'),
    property('og:locale', options.locale),
    property('og:site_name', options.siteName),
    property('og:title', meta.title),
    property('og:description', meta.description),
    property('og:url', meta.canonical),
    property('og:image', image?.src),
    property('og:image:width', image?.width),
    property('og:image:height', image?.height),
    property('og:image:alt', image?.alt),
    named('twitter:card', image ? 'summary_large_image' : 'summary'),
    ...(options.extra ?? []),
  ].filter((tag): tag is string => tag !== undefined)
}

/**
 * Applies a page's head to the built index.html: replaces the development
 * title and description, then inserts the remaining tags before </head>.
 */
export function applyHead(html: string, meta: PageMeta, options: HeadOptions): string {
  if (!html.includes('<title>')) throw new Error('index.html has no <title> to replace')
  const replaced = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title ?? options.siteName)}</title>`)
    .replace(/<meta name="description"[^>]*>/, meta.description ? `<meta name="description" content="${escapeHtml(meta.description)}" />` : '')
  const tags = headTags(meta, options).map((tag) => `    ${tag}\n`).join('')
  return replaced.replace(/\n[ \t]*<\/head>/, `\n${tags}  </head>`)
}
