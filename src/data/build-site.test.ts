import { describe, expect, it } from 'vitest'
import { validateSiteData } from '@spektra/data'
import type { Page } from '@spektra/types'
import { content, type ClientContent, type Service } from '../content'
import { buildSiteData } from './build-site'
import { phoneLink, emailLink } from './contact'
import { readPrefillService, resolvePageSlug, SLUG_PATTERN } from './routes'

/** Content variant without mutating the shared module objects. */
function withContent(patch: (c: ClientContent) => ClientContent): ClientContent {
  return patch(structuredClone(content))
}

function pageBy(pages: Page[], slug: string): Page {
  const page = pages.find((p) => p.slug === slug)
  if (!page) throw new Error(`page not found: ${slug}`)
  return page
}

const types = (page: Page) => page.sections.map((s) => s.type)
const sectionData = <T>(page: Page, type: string) => page.sections.find((s) => s.type === type)?.data as T

const minimalService: Service = {
  slug: 'konyvvizsgalat-elokeszites',
  title: 'Könyvvizsgálat előkészítése',
  summary: 'Előkészítjük az iratokat a könyvvizsgálathoz.',
  seo: { description: 'Könyvvizsgálat előkészítése Kecskeméten.' },
  order: 7,
  visible: true,
}

describe('SiteData', () => {
  const site = buildSiteData(content)

  it('passes the platform validateSiteData contract', () => {
    const result = validateSiteData(site)
    expect(result.valid ? [] : result.errors).toEqual([])
  })

  it('generates every required route', () => {
    const slugs = site.pages.map((p) => p.slug)
    expect(slugs).toEqual(
      expect.arrayContaining([
        'home',
        'szolgaltatasok',
        'szolgaltatasok/konyveles',
        'szolgaltatasok/adotanacsadas',
        'szolgaltatasok/adobevallas',
        'szolgaltatasok/berszamfejtes',
        'szolgaltatasok/vegelszamolas',
        'szolgaltatasok/palyazatok',
        'konyvelovaltas',
        'rolunk',
        'tudastar',
        'kapcsolat',
        'adatvedelem',
        'impresszum',
      ]),
    )
  })

  it('uses lowercase ASCII, hyphenated, max. two-level URLs', () => {
    for (const { slug } of site.pages) {
      const segments = slug.split('/')
      expect(segments.length).toBeLessThanOrEqual(2)
      for (const segment of segments) expect(segment).toMatch(SLUG_PATTERN)
    }
  })

  it('does not generate the prepared, disabled modules', () => {
    const slugs = site.pages.map((p) => p.slug)
    expect(slugs.some((s) => s.startsWith('kinek'))).toBe(false)
    expect(slugs).not.toContain('dijak')
    expect(site.navigation.primary.map((n) => n.href)).toEqual([
      '/szolgaltatasok',
      '/konyvelovaltas',
      '/rolunk',
      '/tudastar',
      '/kapcsolat',
    ])
  })

  it('fails loudly when a disabled module is switched on', () => {
    const enabled = withContent((c) => ({ ...c, settings: { ...c.settings, modules: { ...c.settings.modules, pricingPage: true } } }))
    expect(() => buildSiteData(enabled)).toThrow(/pricingPage/)
  })

  it('resolves unknown paths to the not-found page, not the homepage', () => {
    const slugs = site.pages.map((p) => p.slug)
    expect(resolvePageSlug('/', slugs)).toBe('home')
    expect(resolvePageSlug('/szolgaltatasok/konyveles/', slugs)).toBe('szolgaltatasok/konyveles')
    expect(resolvePageSlug('/nincs-ilyen', slugs)).toBe('nem-talalhato')
    expect(resolvePageSlug('/dijak', slugs)).toBe('nem-talalhato')
  })
})

describe('homepage', () => {
  const home = pageBy(buildSiteData(content).pages, 'home')

  it('keeps the fixed section order', () => {
    expect(types(home)).toEqual(['hero', 'fk-trust', 'fk-services', 'features', 'features', 'fk-team', 'fk-quote'])
  })

  it('numbers the services and highlights the first one', () => {
    const data = sectionData<{ items: { number: string; href: string }[]; highlightFirst: boolean }>(home, 'fk-services')
    expect(data.highlightFirst).toBe(true)
    expect(data.items.map((i) => i.number)).toEqual(['01', '02', '03', '04', '05', '06'])
    expect(data.items[0]!.href).toBe('/szolgaltatasok/konyveles')
  })

  it('derives trust facts from content and keeps unknown facts as placeholders', () => {
    const data = sectionData<{ facts: { value: string }[] }>(home, 'fk-trust')
    expect(data.facts.map((f) => f.value)).toEqual(['[ÉV]', '[ÜGYFELEK SZÁMA]', '3', 'Kecskemét'])
  })
})

describe('audiences — segments.complex.enabled', () => {
  const audienceTitles = (c: ClientContent) => {
    const home = pageBy(buildSiteData(c).pages, 'home')
    const features = home.sections.find((s) => s.id === 'kinek')!.data as { features: { title: string }[] }
    return features.features.map((f) => f.title)
  }

  it('hides the complex audience by default', () => {
    expect(audienceTitles(content)).toEqual(['Egyéni vállalkozók', 'Kis- és középvállalkozások', 'Könyvelőt váltana'])
  })

  it('shows it when the segment is enabled — configuration only', () => {
    const enabled = withContent((c) => ({ ...c, settings: { ...c.settings, segments: { complex: { enabled: true } } } }))
    expect(audienceTitles(enabled)).toContain('Összetettebb vállalkozások')
  })
})

describe('service page template', () => {
  const site = buildSiteData(content)
  const servicePages = site.pages.filter((p) => p.slug.startsWith('szolgaltatasok/'))

  it('has a unique title, description and H1 per service', () => {
    const titles = servicePages.map((p) => p.meta?.title)
    const descriptions = servicePages.map((p) => p.meta?.description)
    expect(new Set(titles).size).toBe(servicePages.length)
    expect(new Set(descriptions).size).toBe(servicePages.length)
    const berszam = pageBy(site.pages, 'szolgaltatasok/berszamfejtes')
    expect(berszam.meta?.title).toBe('Bérszámfejtés Kecskemét | Farkas Klára Könyvelőiroda')
    expect(sectionData<{ title: string }>(berszam, 'fk-page-header').title).toBe('Bérszámfejtés')
  })

  it('keeps the fixed block order', () => {
    const order = ['fk-page-header', 'fk-list', 'features', 'features', 'fk-list', 'fk-price', 'fk-faq', 'fk-cta', 'fk-services', 'fk-articles']
    for (const page of servicePages) {
      const ids = types(page)
      // Each page's block types must be a subsequence of the fixed order.
      let cursor = 0
      for (const type of ids) {
        cursor = order.indexOf(type, cursor)
        expect(cursor, `${page.slug}: ${ids.join(',')}`).toBeGreaterThanOrEqual(0)
        cursor += 1
      }
    }
  })

  it('renders a contextual, prefilled CTA', () => {
    const page = pageBy(site.pages, 'szolgaltatasok/vegelszamolas')
    const cta = sectionData<{ primary: { text: string; href: string } }>(page, 'fk-cta')
    expect(cta.primary.text).toBe('Végelszámolás indítása')
    expect(cta.primary.href).toBe('/kapcsolat?szolgaltatas=vegelszamolas#ajanlatkeres')
  })

  it('omits every empty optional block', () => {
    const c = withContent((x) => ({ ...x, services: [...x.services, minimalService] }))
    const page = pageBy(buildSiteData(c).pages, 'szolgaltatasok/konyvvizsgalat-elokeszites')
    expect(types(page)).toEqual(['fk-page-header', 'fk-cta'])
  })

  it('adds a service through content only', () => {
    const c = withContent((x) => ({ ...x, services: [...x.services, minimalService] }))
    const site7 = buildSiteData(c)
    const home = pageBy(site7.pages, 'home')
    const cards = sectionData<{ items: { slug: string; number: string }[] }>(home, 'fk-services').items
    expect(cards[cards.length - 1]).toMatchObject({ slug: 'konyvvizsgalat-elokeszites', number: '07' })
    const quote = sectionData<{ services: { value: string }[] }>(home, 'fk-quote')
    expect(quote.services.map((s) => s.value)).toContain('konyvvizsgalat-elokeszites')
  })

  it('hides hidden services everywhere', () => {
    const c = withContent((x) => ({ ...x, services: x.services.map((s) => (s.slug === 'palyazatok' ? { ...s, visible: false } : s)) }))
    const site5 = buildSiteData(c)
    expect(site5.pages.map((p) => p.slug)).not.toContain('szolgaltatasok/palyazatok')
  })
})

describe('prices — settings.showPrices', () => {
  const priceSections = (c: ClientContent) =>
    buildSiteData(c).pages.flatMap((p) => p.sections).filter((s) => s.type === 'fk-price')
  const cardPrices = (c: ClientContent) => {
    const home = pageBy(buildSiteData(c).pages, 'home')
    return sectionData<{ items: { price?: unknown }[] }>(home, 'fk-services').items.filter((i) => i.price)
  }

  it('renders no price UI when false', () => {
    expect(content.settings.showPrices).toBe(false)
    expect(priceSections(content)).toHaveLength(0)
    expect(cardPrices(content)).toHaveLength(0)
  })

  it('renders every defined price when true', () => {
    const on = withContent((c) => ({ ...c, settings: { ...c.settings, showPrices: true } }))
    expect(priceSections(on)).toHaveLength(6)
    expect(cardPrices(on)).toHaveLength(6)
    const berszam = pageBy(buildSiteData(on).pages, 'szolgaltatasok/berszamfejtes')
    expect(sectionData<{ price: { amount: string; unit: string } }>(berszam, 'fk-price').price).toMatchObject({
      amount: '[ÁR] Ft',
      unit: '/ fő/hó',
    })
  })
})

describe('contact — single source and primary contact', () => {
  it('resolves the primary contact from isPrimaryContact', () => {
    const contactPage = pageBy(buildSiteData(content).pages, 'kapcsolat')
    const data = sectionData<{ primaryContact: { name: string } }>(contactPage, 'fk-contact')
    expect(data.primaryContact.name).toBe('Farkas Klára')
  })

  it('follows the data, not a hard-coded name', () => {
    const c = withContent((x) => ({
      ...x,
      people: x.people.map((p) => ({ ...p, isPrimaryContact: p.id === 'munkatars-1' })),
    }))
    const quote = sectionData<{ primaryContact: { name: string } }>(pageBy(buildSiteData(c).pages, 'home'), 'fk-quote')
    expect(quote.primaryContact.name).toBe('[MUNKATÁRS NEVE]')
  })

  it('rejects zero or several primary contacts', () => {
    const none = withContent((x) => ({ ...x, people: x.people.map((p) => ({ ...p, isPrimaryContact: false })) }))
    const two = withContent((x) => ({ ...x, people: x.people.map((p) => ({ ...p, isPrimaryContact: true })) }))
    expect(() => buildSiteData(none)).toThrow(/isPrimaryContact/)
    expect(() => buildSiteData(two)).toThrow(/isPrimaryContact/)
  })

  it('propagates one company value to every contact area', () => {
    const c = withContent((x) => ({ ...x, company: { ...x.company, phone: '+36 76 000 0000' } }))
    const site = buildSiteData(c)
    const contact = sectionData<{ phone: { href?: string } }>(pageBy(site.pages, 'kapcsolat'), 'fk-contact')
    const quote = sectionData<{ primaryContact: { phone: { href?: string } } }>(pageBy(site.pages, 'home'), 'fk-quote')
    expect(contact.phone.href).toBe('tel:+36760000000')
    expect(quote.primaryContact.phone.href).toBe('tel:+36760000000')
  })

  it('never builds tel:/mailto: links from placeholders', () => {
    expect(phoneLink('[TELEFONSZÁM]').href).toBeUndefined()
    expect(emailLink('[E-MAIL]').href).toBeUndefined()
    expect(emailLink('iroda@example.hu').href).toBe('mailto:iroda@example.hu')
  })
})

describe('quote prefill (?szolgaltatas=)', () => {
  const allowed = content.services.map((s) => s.slug)
  it('preselects a known service', () => {
    expect(readPrefillService('?szolgaltatas=vegelszamolas', 'szolgaltatas', allowed)).toEqual(['vegelszamolas'])
  })
  it('ignores unknown values', () => {
    expect(readPrefillService('?szolgaltatas=nincs', 'szolgaltatas', allowed)).toEqual([])
    expect(readPrefillService('', 'szolgaltatas', allowed)).toEqual([])
  })
})
