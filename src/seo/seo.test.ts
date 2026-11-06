import { afterEach, describe, expect, it, vi } from 'vitest'
import { content, type ClientContent } from '../content'
import { buildSiteData } from '../data/build-site'
import { NOT_FOUND_SLUG } from '../data/routes'
import { applyHead } from './head'
import { KNOWLEDGE_SLUG, isIndexable } from './indexable'
import { businessJsonLd } from './json-ld'
import { prerenderSite, sitemapXml } from './prerender'

const ORIGIN = 'https://farkaskonyveles.hu'
const PLACEHOLDER = /\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]/
const INDEX_HTML = `<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta name="description" content="dev" />
    <title>dev</title>
  </head>
  <body><div id="root"></div></body>
</html>
`

const site = buildSiteData(content)
const indexable = site.pages.filter((p) => isIndexable(p, content))

/** Content with one visible article (the Tudástár becomes indexable). */
const withArticle: ClientContent = {
  ...content,
  articles: [{ slug: 'afa-bevallas', title: 'Áfabevallás', summary: 'Összefoglaló.', body: ['Szöveg.'], seo: { description: 'Leírás.' }, visible: true }],
}

describe('page meta', () => {
  it('gives every indexable page a unique title, description and canonical on the final domain', () => {
    for (const key of ['title', 'description', 'canonical'] as const) {
      const values = indexable.map((p) => p.meta?.[key])
      expect(values.every(Boolean), key).toBe(true)
      expect(new Set(values).size, key).toBe(values.length)
    }
    for (const page of indexable) {
      const canonical = page.meta!.canonical!
      expect(canonical.startsWith(`${ORIGIN}/`), canonical).toBe(true)
      // No trailing slash except the homepage.
      if (canonical !== `${ORIGIN}/`) expect(canonical, canonical).not.toMatch(/\/$/)
      expect(page.meta!.ogImage?.src).toBe(`${ORIGIN}/og-image.jpg`)
    }
  })

  it('keeps placeholders out of every title and description', () => {
    for (const page of site.pages) {
      expect(`${page.meta?.title} ${page.meta?.description}`, page.slug).not.toMatch(PLACEHOLDER)
    }
  })
})

describe('deploy base /farkasklara/', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('canonical URLs never carry the preview base', async () => {
    vi.stubEnv('BASE_URL', '/farkasklara/')
    vi.resetModules()
    const { content: c } = await import('../content')
    const { buildSiteData: build } = await import('../data/build-site')
    for (const page of build(c).pages) {
      expect(page.meta?.canonical, page.slug).not.toContain('/farkasklara')
    }
    expect(build(c).pages.find((p) => p.slug === 'kapcsolat')?.meta?.canonical).toBe(`${ORIGIN}/kapcsolat`)
  })
})

describe('indexing', () => {
  it('keeps the 404 page and the empty Tudástár out of the index', () => {
    const slugs = site.pages.filter((p) => !isIndexable(p, content)).map((p) => p.slug)
    expect(slugs.sort()).toEqual([KNOWLEDGE_SLUG, NOT_FOUND_SLUG].sort())
  })

  it('lists exactly the indexable pages in the sitemap', () => {
    const locs = [...sitemapXml(site, content).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual(indexable.map((p) => p.meta!.canonical))
    expect(locs).not.toContain(`${ORIGIN}/tudastar`)
    expect(locs.some((l) => l!.includes('nem-talalhato'))).toBe(false)
  })

  it('indexes the Tudástár and its article once an article is visible', () => {
    const locs = sitemapXml(buildSiteData(withArticle), withArticle)
    expect(locs).toContain(`<loc>${ORIGIN}/tudastar</loc>`)
    expect(locs).toContain(`<loc>${ORIGIN}/tudastar/afa-bevallas</loc>`)
  })
})

describe('prerendered HTML', () => {
  const files = new Map(prerenderSite(INDEX_HTML, site, content).map((f) => [f.fileName, f.source]))

  it('writes one flat HTML file per page, 404.html, sitemap.xml and robots.txt', () => {
    expect([...files.keys()]).toEqual(
      expect.arrayContaining(['index.html', 'kapcsolat.html', 'szolgaltatasok.html', 'szolgaltatasok/konyveles.html', '404.html', 'sitemap.xml', 'robots.txt']),
    )
    expect(files.get('robots.txt')).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`)
  })

  it('puts the page head into each file, noindex only where needed', () => {
    const contact = files.get('kapcsolat.html')!
    expect(contact).toContain('<title>Kapcsolat és ajánlatkérés | Farkas Klára Könyvelőiroda</title>')
    expect(contact).toContain(`<link rel="canonical" href="${ORIGIN}/kapcsolat" />`)
    expect(contact).toContain(`<meta property="og:url" content="${ORIGIN}/kapcsolat" />`)
    expect(contact).toContain('<meta property="og:locale" content="hu_HU" />')
    expect(contact).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(contact).not.toContain('name="robots"')
    expect(contact.match(/<meta name="description"/g)).toHaveLength(1)

    const notFound = files.get('404.html')!
    expect(notFound).toContain('<meta name="robots" content="noindex, follow" />')
    expect(notFound).not.toContain('rel="canonical"')
    expect(files.get('tudastar.html')).toContain('<meta name="robots" content="noindex, follow" />')
  })

  it('has no placeholder in any generated file', () => {
    for (const [name, source] of files) expect(source, name).not.toMatch(PLACEHOLDER)
  })

  it('escapes attribute values', () => {
    const html = applyHead(INDEX_HTML, { title: 'A "B" & <C>', description: 'x' }, { siteName: 's', locale: 'hu_HU', indexable: true })
    expect(html).toContain('<title>A &quot;B&quot; &amp; &lt;C&gt;</title>')
  })
})

describe('JSON-LD', () => {
  const homepage = () => prerenderSite(INDEX_HTML, site, content).find((f) => f.fileName === 'index.html')!.source
  const parse = (html: string) => JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)![1]!)

  it('is valid JSON on the homepage with the firm NAP from company.ts', () => {
    const data = parse(homepage())
    expect(data['@type']).toBe('AccountingService')
    expect(data.name).toBe(content.company.name)
    expect(data.telephone).toBe('+36702312517')
    expect(data.email).toBe(content.company.email)
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Tatay András utca 10.',
      postalCode: '6000',
      addressLocality: 'Kecskemét',
      addressCountry: 'HU',
    })
    expect(JSON.stringify(data)).not.toMatch(PLACEHOLDER)
    // Only the homepage carries it.
    expect(prerenderSite(INDEX_HTML, site, content).filter((f) => f.source.includes('application/ld+json'))).toHaveLength(1)
  })

  it('publishes the confirmed opening hours (Monday–Thursday 09:00–16:00) on the homepage', () => {
    expect(content.company.openingHoursConfirmed).toBe(true)
    expect(parse(homepage()).openingHoursSpecification).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:00', closes: '16:00' },
    ])
    expect(businessJsonLd(content)).not.toHaveProperty('sameAs')
  })

  it('leaves out opening hours that are not confirmed', () => {
    const c: ClientContent = { ...content, company: { ...content.company, openingHoursConfirmed: false } }
    expect(businessJsonLd(c)).not.toHaveProperty('openingHoursSpecification')
  })

  it('adds known profiles to sameAs', () => {
    const c: ClientContent = { ...content, company: { ...content.company, sameAs: ['https://www.facebook.com/example', '[GBP LINK]'] } }
    expect(businessJsonLd(c)!.sameAs).toEqual(['https://www.facebook.com/example'])
  })

  it('drops placeholder values instead of publishing them', () => {
    const c: ClientContent = { ...content, company: { ...content.company, phone: '[TELEFONSZÁM]', address: { ...content.company.address, street: '[UTCA]' } } }
    const data = businessJsonLd(c)!
    expect(data).not.toHaveProperty('telephone')
    expect(data).not.toHaveProperty('address')
  })

  it('rejects confirmed opening hours it cannot read', () => {
    const c: ClientContent = { ...content, company: { ...content.company, openingHoursConfirmed: true, openingHours: [{ days: 'Hétköznap', hours: 'délelőtt' }] } }
    expect(() => buildSiteData(c)).toThrow(/openingHours/)
  })
})
