import { content } from '../content'
import { createBuildContext } from '../data/build-pages'
import { quoteHref, routes } from '../data/routes'

/**
 * Shell view of the client content. Header/Footer receive SiteData from the
 * platform LayoutShellProps; client-wide contact data and the visible service
 * list come from the same single source as the page sections.
 */
const ctx = createBuildContext(content)

export const shell = {
  companyName: content.company.name,
  tagline: content.copy.home.hero.eyebrow,
  contact: ctx.contact,
  services: ctx.services.map((s) => ({ slug: s.slug, title: s.title, href: routes.service(s.slug) })),
  quote: { label: content.copy.nav.quote, href: quoteHref(content.settings.quote.prefillParam) },
  copy: content.copy.footer,
}

/** Current path without trailing slash ('/' stays '/'). */
export function currentPath(): string {
  if (typeof window === 'undefined') return '/'
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

/** aria-current for a nav link: exact page, or a section parent (e.g. /szolgaltatasok/*). */
export function ariaCurrent(href: string, path: string): 'page' | 'true' | undefined {
  if (href === path) return 'page'
  if (href !== '/' && path.startsWith(`${href}/`)) return 'true'
  return undefined
}
