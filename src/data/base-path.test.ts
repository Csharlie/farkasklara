import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * The pspro.hu preview runs under /farkasklara/ (vite --mode pspro). Routes,
 * page slugs and route resolution must agree under a non-root base too.
 */
describe('deploy base /farkasklara/', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('resolves every page from its own link, and links carry the base', async () => {
    vi.stubEnv('BASE_URL', '/farkasklara/')
    vi.resetModules()
    const { content } = await import('../content')
    const { buildSiteData } = await import('./build-site')
    const { NOT_FOUND_SLUG, pageSlugToPath, resolvePageSlug, routes } = await import('./routes')
    const site = buildSiteData(content)
    const slugs = site.pages.map((p) => p.slug)

    expect(routes.home).toBe('/farkasklara/')
    expect(routes.service('konyveles')).toBe('/farkasklara/szolgaltatasok/konyveles')
    for (const slug of slugs) {
      expect(slug, slug).not.toMatch(/^farkasklara/)
      if (slug === NOT_FOUND_SLUG) continue
      expect(resolvePageSlug(pageSlugToPath(slug), slugs), slug).toBe(slug)
    }
    expect(resolvePageSlug('/farkasklara/szolgaltatasok/konyveles', slugs)).toBe('szolgaltatasok/konyveles')
    expect(resolvePageSlug('/farkasklara/szolgaltatasok/konyveles/', slugs)).toBe('szolgaltatasok/konyveles')
    expect(resolvePageSlug('/farkasklara/', slugs)).toBe('home')
    expect(resolvePageSlug('/farkasklara/nincs-ilyen', slugs)).toBe(NOT_FOUND_SLUG)
    // Every internal nav link points under the base.
    for (const item of [...site.navigation.primary, ...(site.navigation.footer ?? [])]) {
      expect(item.href.startsWith('/farkasklara/'), item.href).toBe(true)
    }
  })
})
