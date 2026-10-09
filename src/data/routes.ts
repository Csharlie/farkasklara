/**
 * Route table. Every route is a platform Page whose slug is the path without
 * the leading slash ('/' ↔ 'home'). Rendering selects the page through the
 * platform LandingTemplate `pageSlug` extension point (see src/App.tsx).
 */

export const HOME_SLUG = 'home'
export const NOT_FOUND_SLUG = 'nem-talalhato'

/** Anchor id of the quote form section (homepage and /kapcsolat). */
export const QUOTE_ANCHOR = 'ajanlatkeres'

export const routes = {
  home: '/',
  services: '/szolgaltatasok',
  service: (slug: string) => `/szolgaltatasok/${slug}`,
  switch: '/konyvelovaltas',
  about: '/rolunk',
  knowledge: '/tudastar',
  article: (slug: string) => `/tudastar/${slug}`,
  contact: '/kapcsolat',
  privacy: '/adatvedelem',
  imprint: '/impresszum',
  // Prepared, disabled modules (settings.modules) — no pages are generated.
  audience: (id: string) => `/kinek/${id}`,
  pricing: '/dijak',
} as const

/** URL convention: lowercase ASCII, hyphen-separated segments. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function pathToPageSlug(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '').replace(/^\/+/, '')
  return trimmed === '' ? HOME_SLUG : trimmed
}

export function pageSlugToPath(slug: string): string {
  return slug === HOME_SLUG ? routes.home : `/${slug}`
}

/**
 * Explicit route resolution: an unknown path renders the not-found page,
 * never silently the first page (LandingTemplate's default).
 */
export function resolvePageSlug(pathname: string, pageSlugs: readonly string[]): string {
  const slug = pathToPageSlug(pathname)
  return pageSlugs.includes(slug) ? slug : NOT_FOUND_SLUG
}

/** Reads the preselected service from a query string; unknown slugs are ignored. */
export function readPrefillService(search: string, prefillParam: string, allowed: readonly string[]): string[] {
  const requested = new URLSearchParams(search).get(prefillParam)
  return requested && allowed.includes(requested) ? [requested] : []
}

/** Quote form link, optionally preselecting a service (?szolgaltatas=<slug>). */
export function quoteHref(prefillParam: string, serviceSlug?: string): string {
  const query = serviceSlug ? `?${prefillParam}=${encodeURIComponent(serviceSlug)}` : ''
  return `${routes.contact}${query}#${QUOTE_ANCHOR}`
}
