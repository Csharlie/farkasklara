import type { Page } from '@spektra/types'
import type { ClientContent } from '../content'
import { HOME_SLUG, NOT_FOUND_SLUG, pathToPageSlug, routes } from '../data/routes'

export const KNOWLEDGE_SLUG = pathToPageSlug(routes.knowledge)

/**
 * Whether search engines may index a page (robots meta, sitemap).
 * - the not-found page never;
 * - the Tudástár index only once it lists at least one visible article —
 *   an empty list page is "thin content" for search engines.
 * Hidden articles get no page at all (createBuildContext).
 */
export function isIndexable(page: Page, content: ClientContent): boolean {
  if (page.slug === NOT_FOUND_SLUG) return false
  if (page.slug === KNOWLEDGE_SLUG) return content.articles.some((a) => a.visible)
  return true
}

/**
 * Output file of a page in the production build. Flat `<path>.html` files
 * (not `<path>/index.html` folders), so the served URL has no trailing slash
 * and matches the canonical — see deploy/production/.htaccess.tpl.
 */
export function htmlFileOf(slug: string): string {
  if (slug === HOME_SLUG) return 'index.html'
  if (slug === NOT_FOUND_SLUG) return '404.html'
  return `${slug}.html`
}
