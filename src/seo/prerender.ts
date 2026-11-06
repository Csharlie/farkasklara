import type { SiteData } from '@spektra/types'
import type { ClientContent } from '../content'
import type { FkHeroData } from '../sections/platform'
import { HOME_SLUG, NOT_FOUND_SLUG } from '../data/routes'
import { applyHead, escapeHtml } from './head'
import { htmlFileOf, isIndexable } from './indexable'
import { businessJsonLd, jsonLdScript } from './json-ld'

export interface OutputFile {
  fileName: string
  source: string
}

export interface PrerenderOptions {
  /** Font files to preload (URLs under the deploy base). */
  fontPreloads?: string[]
}

/** Canonical origin of the site, without a trailing slash. */
function originOf(content: ClientContent): string {
  const url = content.company.url?.replace(/\/$/, '')
  if (!url) throw new Error('company.url is required for the production build (canonical links, sitemap)')
  return url
}

/** sitemap.xml — the canonical URL of every indexable page, nothing else. */
export function sitemapXml(site: SiteData, content: ClientContent): string {
  const urls = site.pages
    .filter((page) => isIndexable(page, content))
    .map((page) => page.meta?.canonical)
    .filter((url): url is string => url !== undefined)
    .map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>\n`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('')}</urlset>\n`
}

/** Production robots.txt: everything may be crawled; points to the sitemap. */
export function robotsTxt(content: ClientContent): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${originOf(content)}/sitemap.xml\n`
}

/**
 * Production output derived from SiteData: one HTML file per page (built
 * index.html + that page's head), sitemap.xml and robots.txt. The body stays
 * the client-rendered app; only the head differs per route, which is what
 * search engines and link previews read first.
 */
export function prerenderSite(indexHtml: string, site: SiteData, content: ClientContent, options: PrerenderOptions = {}): OutputFile[] {
  originOf(content)
  const fonts = (options.fontPreloads ?? []).map(
    (href) => `<link rel="preload" href="${escapeHtml(href)}" as="font" type="font/woff2" crossorigin />`,
  )

  const pages = site.pages.map((page): OutputFile => {
    const extra = [...fonts]
    // Hero photo is a CSS background (platform HeroBlock): preload it, high priority (LCP).
    const hero = page.sections.find((s) => s.type === 'hero')?.data as FkHeroData | undefined
    if (hero?.backgroundImage) {
      extra.push(`<link rel="preload" href="${escapeHtml(hero.backgroundImage.src)}" as="image" fetchpriority="high" />`)
    }
    if (page.slug === HOME_SLUG) {
      const jsonLd = businessJsonLd(content)
      if (jsonLd) extra.push(jsonLdScript(jsonLd))
    }
    return {
      fileName: htmlFileOf(page.slug),
      // 404.html answers every unknown URL: it names no canonical URL of its own.
      source: applyHead(indexHtml, page.slug === NOT_FOUND_SLUG ? { ...page.meta, canonical: undefined } : (page.meta ?? {}), {
        siteName: site.site.name,
        locale: 'hu_HU',
        indexable: isIndexable(page, content),
        extra,
      }),
    }
  })

  return [...pages, { fileName: 'sitemap.xml', source: sitemapXml(site, content) }, { fileName: 'robots.txt', source: robotsTxt(content) }]
}
