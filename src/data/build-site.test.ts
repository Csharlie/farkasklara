import { describe, expect, it } from 'vitest'
import { validateSiteData } from '@spektra/data'
import type { Page } from '@spektra/types'
import { content, type ClientContent, type Service } from '../content'
import { buildSiteData } from './build-site'
import { emailLink, phoneLink } from './contact'
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

const unknownStreet = (c: ClientContent): ClientContent => ({
  ...c,
  company: { ...c.company, address: { ...c.company.address, street: '[UTCA, HÁZSZÁM]' } },
})

describe('SiteData', () => {
  const site = buildSiteData(content)

  it('passes the platform validateSiteData contract', () => {
    const result = validateSiteData(site)
    expect(result.valid ? [] : result.errors).toEqual([])
  })

  it('keeps every existing route', () => {
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

  it('has the focused section order: no stats strip under the hero, no generic process', () => {
    expect(types(home)).toEqual(['hero', 'fk-services', 'features', 'fk-team', 'fk-quote', 'fk-map'])
  })

  it('keeps the hero message', () => {
    expect(sectionData<{ title: string }>(home, 'hero').title).toBe('Rendben tartjuk a számait. Szólunk, mielőtt baj lenne.')
  })

  it('numbers the six services, highlights the first and offers a short preview', () => {
    const data = sectionData<{ items: { number: string; href: string; highlights?: string[] }[]; highlightFirst: boolean }>(home, 'fk-services')
    expect(data.highlightFirst).toBe(true)
    expect(data.items.map((i) => i.number)).toEqual(['01', '02', '03', '04', '05', '06'])
    expect(data.items[0]!.href).toBe('/szolgaltatasok/konyveles')
    for (const item of data.items) {
      expect(item.highlights!.length).toBeGreaterThan(0)
      expect(item.highlights!.length).toBeLessThanOrEqual(4)
    }
  })

  it('shows the professional lead emphasized, with verified facts only', () => {
    const team = sectionData<{ lead: { name: string; badge: string }; facts: { value: string }[]; members: { role: string }[] }>(home, 'fk-team')
    expect(team.lead.name).toBe('Farkas Klára')
    expect(team.lead.badge).toBe('Szakmai vezető')
    expect(team.facts.map((f) => f.value)).toEqual(['3', 'Kecskemét'])
    expect(team.members.map((m) => m.role)).toEqual(['Ügyintéző, kapcsolattartó', 'Könyvelő'])
  })

  it('shows a fact once it is known', () => {
    const c = withContent((x) => ({
      ...x,
      copy: {
        ...x.copy,
        home: {
          ...x.copy.home,
          about: { ...x.copy.home.about, facts: [{ value: '2010', label: 'óta dolgozunk' }, ...x.copy.home.about.facts.slice(1)] },
        },
      },
    }))
    const team = sectionData<{ facts: { value: string }[] }>(pageBy(buildSiteData(c).pages, 'home'), 'fk-team')
    expect(team.facts.map((f) => f.value)).toEqual(['2010', '3', 'Kecskemét'])
  })
})

describe('audiences', () => {
  const audienceTitles = (c: ClientContent) => {
    const home = pageBy(buildSiteData(c).pages, 'home')
    const features = home.sections.find((s) => s.id === 'kinek')!.data as { features: { title: string }[] }
    return features.features.map((f) => f.title)
  }

  it('shows the three primary client groups; switching is not an audience', () => {
    expect(audienceTitles(content)).toEqual(['Egyéni vállalkozók', 'Kis- és középvállalkozások', 'Nagyobb vállalatok'])
  })

  it('can switch off the larger-company group through configuration only', () => {
    const off = withContent((c) => ({ ...c, settings: { ...c.settings, segments: { complex: { enabled: false } } } }))
    expect(audienceTitles(off)).toEqual(['Egyéni vállalkozók', 'Kis- és középvállalkozások'])
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
    const order = ['fk-page-header', 'fk-list', 'features', 'features', 'fk-list', 'fk-price', 'fk-faq', 'fk-cta', 'fk-services', 'fk-articles', 'fk-map']
    for (const page of servicePages) {
      const ids = types(page)
      let cursor = 0
      for (const type of ids) {
        cursor = order.indexOf(type, cursor)
        expect(cursor, `${page.slug}: ${ids.join(',')}`).toBeGreaterThanOrEqual(0)
        cursor += 1
      }
    }
  })

  it('uses a request CTA (not "start now"), prefilled with the service', () => {
    const page = pageBy(site.pages, 'szolgaltatasok/vegelszamolas')
    const cta = sectionData<{ primary: { text: string; href: string } }>(page, 'fk-cta')
    expect(cta.primary.text).toBe('Egyeztetést kérek végelszámolásról')
    expect(cta.primary.href).toBe('/kapcsolat?szolgaltatas=vegelszamolas#ajanlatkeres')
  })

  it('links the accounting page to the switching page without copying it', () => {
    const page = pageBy(site.pages, 'szolgaltatasok/konyveles')
    const headerData = sectionData<{ secondary?: { href: string } }>(page, 'fk-page-header')
    expect(headerData.secondary?.href).toBe('/konyvelovaltas')
  })

  it('keeps related-service cards compact (no preview panel)', () => {
    const page = pageBy(site.pages, 'szolgaltatasok/konyveles')
    const related = page.sections.find((s) => s.id === 'konyveles-kapcsolodo')!.data as { items: { highlights?: string[] }[] }
    expect(related.items.every((i) => i.highlights === undefined)).toBe(true)
  })

  it('omits every empty optional block', () => {
    const c = withContent((x) => ({ ...x, services: [...x.services, minimalService] }))
    const page = pageBy(buildSiteData(c).pages, 'szolgaltatasok/konyvvizsgalat-elokeszites')
    expect(types(page)).toEqual(['fk-page-header', 'fk-cta', 'fk-map'])
  })

  it('adds a service through content only', () => {
    const c = withContent((x) => ({ ...x, services: [...x.services, minimalService] }))
    const home = pageBy(buildSiteData(c).pages, 'home')
    const cards = sectionData<{ items: { slug: string; number: string }[] }>(home, 'fk-services').items
    expect(cards[cards.length - 1]).toMatchObject({ slug: 'konyvvizsgalat-elokeszites', number: '07' })
    const quote = sectionData<{ services: { value: string }[] }>(home, 'fk-quote')
    expect(quote.services.map((s) => s.value)).toContain('konyvvizsgalat-elokeszites')
  })

  it('hides hidden services everywhere', () => {
    const c = withContent((x) => ({ ...x, services: x.services.map((s) => (s.slug === 'palyazatok' ? { ...s, visible: false } : s)) }))
    expect(buildSiteData(c).pages.map((p) => p.slug)).not.toContain('szolgaltatasok/palyazatok')
  })
})

describe('switching page', () => {
  it('covers process, documents, FAQ and next step', () => {
    const page = pageBy(buildSiteData(content).pages, 'konyvelovaltas')
    expect(types(page)).toEqual(['fk-page-header', 'features', 'fk-list', 'fk-faq', 'fk-cta', 'fk-map'])
  })
})

describe('about page', () => {
  it('complements the homepage with how we work and the team', () => {
    const page = pageBy(buildSiteData(content).pages, 'rolunk')
    expect(types(page)).toEqual(['fk-page-header', 'features', 'fk-team', 'fk-cta', 'fk-map'])
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
  })
})

describe('contact — roles and single source', () => {
  it('routes enquiries to the designated administrator, not to the lead', () => {
    const site = buildSiteData(content)
    const contact = sectionData<{ primaryContact: { name?: string; role: string }; lead: { name?: string } }>(
      pageBy(site.pages, 'kapcsolat'),
      'fk-contact',
    )
    expect(contact.primaryContact.role).toBe('Ügyintéző, kapcsolattartó')
    expect(contact.primaryContact.name).toBe('Posszert Ervin')
    expect(contact.lead.name).toBe('Farkas Klára')
    const quote = sectionData<{ primaryContact: { role: string } }>(pageBy(site.pages, 'home'), 'fk-quote')
    expect(quote.primaryContact.role).toBe('Ügyintéző, kapcsolattartó')
  })

  it('hides a name that is still a placeholder', () => {
    const c = withContent((x) => ({ ...x, people: x.people.map((p) => (p.id === 'ugyintezo' ? { ...p, name: '[ÜGYINTÉZŐ NEVE]' } : p)) }))
    const quote = sectionData<{ primaryContact: { name?: string; role: string } }>(pageBy(buildSiteData(c).pages, 'home'), 'fk-quote')
    expect(quote.primaryContact.name).toBeUndefined()
    expect(quote.primaryContact.role).toBe('Ügyintéző, kapcsolattartó')
  })

  it('rejects zero or several primary contacts / leads', () => {
    const noContact = withContent((x) => ({ ...x, people: x.people.map((p) => ({ ...p, isPrimaryContact: false })) }))
    const twoLeads = withContent((x) => ({ ...x, people: x.people.map((p) => ({ ...p, isLead: true })) }))
    expect(() => buildSiteData(noContact)).toThrow(/isPrimaryContact/)
    expect(() => buildSiteData(twoLeads)).toThrow(/isLead/)
  })

  it('propagates one company value to every contact area', () => {
    const c = withContent((x) => ({ ...x, company: { ...x.company, phone: '+36 76 000 0000' } }))
    const site = buildSiteData(c)
    const contact = sectionData<{ phone?: { href?: string } }>(pageBy(site.pages, 'kapcsolat'), 'fk-contact')
    const quote = sectionData<{ primaryContact: { phone?: { href?: string } } }>(pageBy(site.pages, 'home'), 'fk-quote')
    expect(contact.phone?.href).toBe('tel:+36760000000')
    expect(quote.primaryContact.phone?.href).toBe('tel:+36760000000')
  })

  it('never builds contact values from placeholders', () => {
    expect(phoneLink('[TELEFONSZÁM]')).toBeUndefined()
    expect(emailLink('[E-MAIL]')).toBeUndefined()
    expect(emailLink('iroda@example.hu')?.href).toBe('mailto:iroda@example.hu')
  })

  it('closes every page with the full-width map of the real address', () => {
    const site = buildSiteData(content)
    for (const page of site.pages) {
      const last = page.sections[page.sections.length - 1]!
      expect(last.type, page.slug).toBe('fk-map')
      expect((last.data as { query: string }).query).toBe('6000 Kecskemét, Berzsenyi utca 19.')
    }
    const contact = sectionData<{ address: string }>(pageBy(site.pages, 'kapcsolat'), 'fk-contact')
    expect(contact.address).toBe('6000 Kecskemét, Berzsenyi utca 19.')
  })

  it('shows no map for an incomplete address', () => {
    const site = buildSiteData(withContent(unknownStreet))
    expect(site.pages.flatMap((p) => p.sections).some((s) => s.type === 'fk-map')).toBe(false)
    expect(sectionData<{ address: string }>(pageBy(site.pages, 'kapcsolat'), 'fk-contact').address).toBe('6000 Kecskemét')
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
