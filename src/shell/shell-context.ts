import { content } from '../content'
import { createBuildContext } from '../data/build-pages'
import type { Page } from '@spektra/types'
import { QUOTE_ANCHOR, pathToPageSlug, quoteHref, routes } from '../data/routes'
import { knownItems } from '../data/text'

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
  // The Facebook page, if company.sameAs names one (footer link, icon + handle).
  facebook: facebookLink(content.company.sameAs),
  copy: content.copy.footer,
}

/** 'https://www.facebook.com/xyz' → { href, label: 'facebook.com/xyz' } (no protocol/www, easy to read in the footer). */
function facebookLink(sameAs: readonly string[] | undefined): { href: string; label: string } | undefined {
  const href = knownItems(sameAs).find((url) => url.includes('facebook.com'))
  if (!href) return undefined
  return { href, label: href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') }
}

/** Path without trailing slash ('/' stays '/'). */
function normalize(path: string): string {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/** Current path (deploy base included, like every link href), without trailing slash. */
export function currentPath(): string {
  if (typeof window === 'undefined') return normalize(routes.home)
  return normalize(window.location.pathname)
}

/** aria-current for a nav link: exact page, or a section parent (e.g. /szolgaltatasok/*). */
export function ariaCurrent(href: string, path: string): 'page' | 'true' | undefined {
  const target = normalize(href)
  if (target === path) return 'page'
  if (target !== normalize(routes.home) && path.startsWith(`${target}/`)) return 'true'
  return undefined
}

/**
 * Header quote CTA target for the current page:
 * - the page has the quote form (home, /kapcsolat) → scroll to it (#ajanlatkeres)
 * - a service page → /kapcsolat with that service preselected
 * - anywhere else → /kapcsolat quote form
 */
export function contextualQuoteHref(path: string, pages: readonly Page[]): string {
  const page = pages.find((p) => p.slug === pathToPageSlug(path))
  if (page?.sections.some((s) => s.type === 'fk-quote')) return `#${QUOTE_ANCHOR}`
  const { prefillParam } = content.settings.quote
  const service = shell.services.find((s) => s.href === path)
  return service ? quoteHref(prefillParam, service.slug) : quoteHref(prefillParam)
}
