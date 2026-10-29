/**
 * Route table. Every route is a platform Page whose slug is the path without
 * the leading slash ('/' ↔ 'home'). Rendering selects the page through the
 * platform LandingTemplate `pageSlug` extension point (see src/App.tsx).
 */

/**
 * Deploy base path from Vite `base` ('/' locally and on the final domain,
 * '/farkasklara/' on the pspro.hu preview — see vite.config.ts, .env.pspro).
 * Every internal link and asset URL is built through `withBase`.
 */
export const BASE_PATH = (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/')

/** App path ('/kapcsolat', '/images/x.jpg') → URL under the deploy base. */
export function withBase(path: string): string {
  return BASE_PATH + path.replace(/^\/+/, '')
}

/** Every candidate of a srcset string under the deploy base. */
export function withBaseSrcSet(srcSet: string): string {
  return srcSet
    .split(',')
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/)
      return [withBase(url!), ...descriptor].join(' ')
    })
    .join(', ')
}

/** Strips the deploy base from a location pathname ('/farkasklara/kapcsolat' → '/kapcsolat'). */
export function stripBase(pathname: string): string {
  const base = BASE_PATH.replace(/\/$/, '')
  return base && (pathname === base || pathname.startsWith(`${base}/`)) ? pathname.slice(base.length) || '/' : pathname
}

export const HOME_SLUG = 'home'
export const NOT_FOUND_SLUG = 'nem-talalhato'

/** Anchor id of the quote form section (homepage and /kapcsolat). */
export const QUOTE_ANCHOR = 'ajanlatkeres'

export const routes = {
  home: withBase('/'),
  services: withBase('/szolgaltatasok'),
  service: (slug: string) => withBase(`/szolgaltatasok/${slug}`),
  switch: withBase('/konyvelovaltas'),
  about: withBase('/rolunk'),
  knowledge: withBase('/tudastar'),
  article: (slug: string) => withBase(`/tudastar/${slug}`),
  contact: withBase('/kapcsolat'),
  privacy: withBase('/adatvedelem'),
  imprint: withBase('/impresszum'),
  // Prepared, disabled modules (settings.modules) — no pages are generated.
  audience: (id: string) => withBase(`/kinek/${id}`),
  pricing: withBase('/dijak'),
} as const

/** URL convention: lowercase ASCII, hyphen-separated segments. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function pathToPageSlug(pathname: string): string {
  const trimmed = stripBase(pathname).replace(/\/+$/, '').replace(/^\/+/, '')
  return trimmed === '' ? HOME_SLUG : trimmed
}

export function pageSlugToPath(slug: string): string {
  return slug === HOME_SLUG ? routes.home : withBase(`/${slug}`)
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
