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

  it('lists the visible services under the services nav item (header dropdown)', () => {
    const services = site.navigation.primary[0]!
    expect(services.children?.map((c) => c.href)).toEqual(
      content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order).map((s) => `/szolgaltatasok/${s.slug}`),
    )
    expect(site.navigation.primary.slice(1).every((n) => !n.children)).toBe(true)
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
    expect(types(home)).toEqual(['hero', 'fk-services', 'features', 'fk-team', 'fk-trust', 'fk-quote', 'fk-map'])
  })

  it('keeps the hero message', () => {
    expect(sectionData<{ title: string; titleHighlight?: string }>(home, 'hero')).toMatchObject({
      title: 'Biztos alapok.\nÁtlátható pénzügyek.',
    })
  })

  it('keeps six uniform icon cards linking to their pages', () => {
    const data = sectionData<{ items: { icon?: string; href: string; highlights?: unknown }[]; highlightFirst: boolean; iconCards?: boolean; linkLabel: string }>(home, 'fk-services')
    expect(data.highlightFirst).toBe(false)
    expect(data.iconCards).toBe(true)
    expect(data.linkLabel).toBe('Részletek')
    expect(data.items.map((i) => i.icon)).toEqual(['book', 'lightbulb', 'fileCheck', 'users', 'archive', 'target'])
    expect(data.items.map((i) => i.href)).toEqual([
      '/szolgaltatasok/konyveles',
      '/szolgaltatasok/adotanacsadas',
      '/szolgaltatasok/adobevallas',
      '/szolgaltatasok/berszamfejtes',
      '/szolgaltatasok/vegelszamolas',
      '/szolgaltatasok/palyazatok',
    ])
    expect(data.items.every((i) => i.highlights === undefined)).toBe(true)
  })

  it('presents the professional lead with a substantive, claim-free introduction', () => {
    const team = sectionData<{ lead: { name: string; badge: string; paragraphs: string[]; credentials: string[] }; members: { name: string; role: string }[] }>(home, 'fk-team')
    expect(team.lead.name).toBe('Farkas Klára')
    expect(team.lead.badge).toBe('Szakmai vezető')
    expect(team.lead.paragraphs).toHaveLength(2) // homepage shows the short version
    // Credentials join the role line under the name — no separate list.
    expect(team.lead.credentials).toBeUndefined()
    expect((team.lead as unknown as { role: string }).role).toBe('Tulajdonos, ügyvezető')
    expect(team.lead.paragraphs.join(' ')).not.toMatch(/\d+ év|éve|okleveles|mérlegképes/i)
    expect(team.members.map((m) => [m.name, m.role])).toEqual([
      ['Posszert Ervin', 'Ügyintéző · Mérlegképes könyvelő'],
      ['Halász Réka', 'Mérlegképes könyvelő'],
    ])
  })

  it('shows four data-derived facts directly below the About section', () => {
    const order = types(home)
    expect(order.indexOf('fk-trust')).toBe(order.indexOf('fk-team') + 1)
    const trust = sectionData<{ facts: { value: string; label: string }[] }>(home, 'fk-trust')
    expect(trust.facts.map((f) => f.value)).toEqual(['2', '6', '6', 'Kecskemét'])
  })

  it('shows a verified metric once it is set in content', () => {
    const c = withContent((x) => ({
      ...x,
      copy: {
        ...x.copy,
        home: {
          ...x.copy.home,
          facts: { ...x.copy.home.facts, items: [{ value: '2010', label: 'óta dolgozunk' }, ...x.copy.home.facts.items.slice(1)] },
        },
      },
    }))
    const trust = sectionData<{ facts: { value: string }[] }>(pageBy(buildSiteData(c).pages, 'home'), 'fk-trust')
    expect(trust.facts.map((f) => f.value)).toEqual(['2010', '6', '6', 'Kecskemét'])
  })

  it('places the compact contact panel next to the homepage form', () => {
    const quote = sectionData<{ panel?: { addressLines: string[] } }>(home, 'fk-quote')
    expect(quote.panel?.addressLines).toEqual(['6000 Kecskemét', 'Tatay András utca 10.'])
  })
})

describe('audiences', () => {
  const audienceTitles = (c: ClientContent) => {
    const home = pageBy(buildSiteData(c).pages, 'home')
    const features = home.sections.find((s) => s.id === 'kinek')!.data as { features: { title: string }[] }
    return features.features.map((f) => f.title)
  }

  it('shows the six client groups in two full rows of three; switching is not an audience', () => {
    expect(audienceTitles(content)).toEqual([
      'Egyéni vállalkozók',
      'Kis- és középvállalkozások',
      'Kft.-k',
      'Alapítványok',
      'Társasházak',
      'Egyesületek',
    ])
    const home = pageBy(buildSiteData(content).pages, 'home')
    expect((home.sections.find((s) => s.id === 'kinek')!.data as { columns: number }).columns).toBe(3)
  })

  it('hides a client group with enabled: false (content only)', () => {
    const off = withContent((c) => ({ ...c, audiences: c.audiences.map((a) => (a.id === 'egyesuletek' ? { ...a, enabled: false } : a)) }))
    expect(audienceTitles(off)).not.toContain('Egyesületek')
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
    const audiencesLast = new Set(content.services.filter((s) => s.audiencesLast).map((s) => `szolgaltatasok/${s.slug}`))
    for (const page of servicePages.filter((p) => !audiencesLast.has(p.slug))) {
      const ids = types(page)
      let cursor = 0
      for (const type of ids) {
        cursor = order.indexOf(type, cursor)
        expect(cursor, `${page.slug}: ${ids.join(',')}`).toBeGreaterThanOrEqual(0)
        cursor += 1
      }
    }
  })

  it('moves audiences below process and requirements with service.audiencesLast', () => {
    const ids = pageBy(site.pages, 'szolgaltatasok/palyazatok').sections.map((s) => s.id)
    expect(ids.indexOf('palyazatok-kinek')).toBeGreaterThan(ids.indexOf('palyazatok-folyamat'))
    expect(ids.indexOf('palyazatok-kinek')).toBeGreaterThan(ids.indexOf('palyazatok-amit-kerunk'))
    expect(ids.indexOf('palyazatok-folyamat')).toBeGreaterThan(ids.indexOf('palyazatok-tartalom'))
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

  it('lists related services as plain, unnumbered cards', () => {
    const page = pageBy(site.pages, 'szolgaltatasok/konyveles')
    const related = page.sections.find((s) => s.id === 'konyveles-kapcsolodo')!.data as { numbered: boolean; items: { slug: string }[] }
    expect(related.numbered).toBe(false)
    expect(related.items.map((i) => i.slug)).toEqual(['adobevallas', 'berszamfejtes'])
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
    const contact = sectionData<{ primaryContact?: { name?: string }; lead: { name?: string } }>(
      pageBy(site.pages, 'kapcsolat'),
      'fk-contact',
    )
    // The contact page names the contact person; the lead stays the brand.
    expect(contact.primaryContact?.name).toBe('Posszert Ervin')
    expect(contact.lead.name).toBe('Farkas Klára')
    const quote = sectionData<{ primaryContact: { role: string } }>(pageBy(site.pages, 'home'), 'fk-quote')
    expect(quote.primaryContact.role).toBe('Ügyintéző · Mérlegképes könyvelő')
  })

  it('hides a name that is still a placeholder', () => {
    const c = withContent((x) => ({ ...x, people: x.people.map((p) => (p.id === 'ugyintezo' ? { ...p, name: '[ÜGYINTÉZŐ NEVE]' } : p)) }))
    const quote = sectionData<{ primaryContact: { name?: string; role: string } }>(pageBy(buildSiteData(c).pages, 'home'), 'fk-quote')
    expect(quote.primaryContact.name).toBeUndefined()
    expect(quote.primaryContact.role).toBe('Ügyintéző · Mérlegképes könyvelő')
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
    const contact = sectionData<{ phone?: { href?: string }; primaryContact?: { phone?: { href?: string } } }>(
      pageBy(site.pages, 'kapcsolat'),
      'fk-contact',
    )
    const quote = sectionData<{ primaryContact: { phone?: { href?: string } } }>(pageBy(site.pages, 'home'), 'fk-quote')
    // Shown once: on the contact person's card, not repeated in the office block.
    expect(contact.phone).toBeUndefined()
    expect(contact.primaryContact?.phone?.href).toBe('tel:+36760000000')
    expect(quote.primaryContact.phone?.href).toBe('tel:+36760000000')
  })

  it('builds the legal pages from the company source without placeholders', () => {
    const site = buildSiteData(content)
    for (const slug of ['adatvedelem', 'impresszum']) {
      const legal = sectionData<{ chapters: { id: string }[] }>(pageBy(site.pages, slug), 'fk-legal')
      expect(legal.chapters.length, slug).toBeGreaterThan(0)
      expect(JSON.stringify(legal), slug).not.toMatch(/\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]|\{\w+\}/)
    }
    const privacy = sectionData<{ chapters: { id: string; fields: { label: string; value: string }[] }[] }>(
      pageBy(site.pages, 'adatvedelem'),
      'fk-legal',
    )
    const controller = privacy.chapters.find((c) => c.id === 'adatkezelo')!
    // The brand names the controller until the legal name is known.
    expect(controller.fields.find((f) => f.label === 'Név')?.value).toBe('Farkas Klára Könyvelőiroda')
    expect(controller.fields.find((f) => f.label === 'E-mail')?.value).toBe(content.company.email)
    // The hosting chapter of the imprint stays hidden while every value is a placeholder.
    const imprint = sectionData<{ chapters: { id: string }[] }>(pageBy(site.pages, 'impresszum'), 'fk-legal')
    expect(imprint.chapters.map((c) => c.id)).not.toContain('tarhely')
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
      expect((last.data as { query: string }).query).toBe('6000 Kecskemét, Tatay András utca 10.')
    }
    const contact = sectionData<{ address: string; directions?: { href: string } }>(pageBy(site.pages, 'kapcsolat'), 'fk-contact')
    expect(contact.address).toBe('6000 Kecskemét, Tatay András utca 10.')
    expect(contact.directions?.href).toBe(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('6000 Kecskemét, Tatay András utca 10.')}`,
    )
    // The contact page shows the details above the form — no duplicate panel.
    expect(sectionData<{ panel?: unknown }>(pageBy(site.pages, 'kapcsolat'), 'fk-quote').panel).toBeUndefined()
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
