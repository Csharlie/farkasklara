import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createFormHandler, createMemoryConsentStorage } from '@spektra/data'
import { ConsentProvider, FormHandlerProvider, SectionRenderer } from '@spektra/runtime'
import type { Page } from '@spektra/types'
import { content, type ClientContent } from './content'
import { consentConfig } from './content/consent'
import { buildSiteData } from './data/build-site'
import { registry } from './registry'

/**
 * Renders page sections through the platform SectionRenderer + client
 * registry (test-only static render; the app itself is client-rendered).
 */
function render(page: Page): string {
  return renderToStaticMarkup(
    <ConsentProvider config={consentConfig} storage={createMemoryConsentStorage()}>
      <FormHandlerProvider handler={createFormHandler({ driver: 'noop', logToConsole: false })}>
        <SectionRenderer sections={page.sections} registry={registry} fallback={(type) => `UNRESOLVED:${type}`} />
      </FormHandlerProvider>
    </ConsentProvider>,
  )
}

const site = buildSiteData(content)

describe('rendering', () => {
  it('resolves every section type of every page', () => {
    for (const page of site.pages) {
      expect(render(page), page.slug).not.toContain('UNRESOLVED:')
    }
  })

  it('renders exactly one H1 per page', () => {
    for (const page of site.pages) {
      const h1Count = render(page).match(/<h1[\s>]/g)?.length ?? 0
      expect(h1Count, page.slug).toBe(1)
    }
  })

  it('renders the full service content (not only a card)', () => {
    const html = render(site.pages.find((p) => p.slug === 'szolgaltatasok/vegelszamolas')!)
    expect(html).toContain('Végelszámolás')
    expect(html).toContain('Végelszámolást kezdő beszámoló')
    expect(html).toContain('Mennyi ideig tart egy végelszámolás?')
    expect(html).toContain('href="/kapcsolat?szolgaltatas=vegelszamolas#ajanlatkeres"')
  })

  it('renders no empty containers for a minimal service', () => {
    const c: ClientContent = {
      ...content,
      services: [
        ...content.services,
        { slug: 'minimal', title: 'Minimál', summary: 'Rövid leírás.', seo: { description: 'x' }, order: 9, visible: true },
      ],
    }
    const page = buildSiteData(c).pages.find((p) => p.slug === 'szolgaltatasok/minimal')!
    const html = render(page)
    expect(html.match(/<section/g)).toHaveLength(3) // header, closing CTA, map
    expect(html).not.toMatch(/<(ul|ol|dl)[^>]*><\/\1>/)
    for (const label of Object.values(content.copy.servicePage.blocks)) {
      expect(html).not.toContain(`>${label}<`)
    }
  })

  it('shows roles and a decorative corner name instead of a photo', () => {
    const html = render(site.pages.find((p) => p.slug === 'rolunk')!)
    expect(html).toMatch(/aria-hidden="true"[^>]*>Farkas Klára</)
    expect(html).toContain('Ügyfélkapcsolati vezető')
  })

  it('tracks call/email/form via the platform data-ui standard', () => {
    const c: ClientContent = { ...content, company: { ...content.company, phone: '+36 76 000 0000', email: 'iroda@example.hu' } }
    const html = render(buildSiteData(c).pages.find((p) => p.slug === 'kapcsolat')!)
    expect(html).toMatch(/href="tel:\+36760000000"[^>]*data-ui-action="call"/)
    expect(html).toMatch(/href="mailto:iroda@example.hu"[^>]*data-ui-action="email"/)
    expect(html).toContain('data-ui-action="submit-form"')
  })

  it('renders no [PLACEHOLDER] text on any page', () => {
    for (const page of site.pages) {
      const text = render(page).replace(/<[^>]+>/g, ' ')
      expect(text, page.slug).not.toMatch(/\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]/)
    }
  })

  it('renders static service cards with a working detail link', () => {
    const html = render(site.pages.find((p) => p.slug === 'home')!)
    const services = html.slice(html.indexOf('data-ui-component="fk-services"'), html.indexOf('data-ui-component="features-block"'))
    expect(services).not.toContain('<details')
    // The whole card is one link (stretched title link).
    expect(services).toMatch(/href="\/szolgaltatasok\/konyveles"[^>]*>Könyvelés</)
  })

  it('renders the team without portraits', () => {
    const html = render(site.pages.find((p) => p.slug === 'home')!)
    const team = html.slice(html.indexOf('data-ui-component="fk-team"'), html.indexOf('data-ui-component="fk-trust"'))
    // The only image is the office storefront photo beside the heading — no portraits on the cards.
    expect(team.match(/<img/g)).toHaveLength(1)
    expect(team).toMatch(/<figure[^>]*data-ui-id="rolunk-photo"[\s\S]*src="\/images\/iroda\.jpg"/)
    expect(team).toContain('>Irodánk bejárata</figcaption>')
    const cards = team.slice(team.indexOf('data-ui-id="team-lead-'))
    expect(cards).not.toContain('<img')
    expect(team).toContain('Posszert Ervin')
  })

  it('never puts white text on the accent color', () => {
    for (const page of site.pages) {
      expect(render(page)).not.toMatch(/bg-accent[^"]*text-white|text-white[^"]*bg-accent/)
    }
  })

  it('never embeds Google Maps before consent — the placeholder keeps the address and directions', () => {
    for (const page of site.pages) {
      const html = render(page)
      expect(html, page.slug).not.toContain('google.com/maps/embed')
      expect(html, page.slug).toContain('data-ui-id="map-consent"')
    }
    const html = render(site.pages.find((p) => p.slug === 'kapcsolat')!)
    expect(html).toContain('6000 Kecskemét, Tatay András utca 10.')
    expect(html).toMatch(/data-ui-id="map-directions"/)
  })

  it('puts the office lead first on the contact page, with her title, above the contact person', () => {
    const html = render(site.pages.find((p) => p.slug === 'kapcsolat')!)
    const lead = html.indexOf('data-ui-id="kapcsolat-adatok-lead"')
    const primary = html.indexOf('data-ui-id="kapcsolat-adatok-primary"')
    expect(lead).toBeGreaterThan(-1)
    expect(lead).toBeLessThan(primary)
    expect(html.slice(lead, primary)).toContain('Tulajdonos, ügyvezető · Mérlegképes könyvelő')
  })

  it('drops the office photo with settings.showOfficePhoto = false', () => {
    const c: ClientContent = { ...content, settings: { ...content.settings, showOfficePhoto: false } }
    const html = render(buildSiteData(c).pages.find((p) => p.slug === 'home')!)
    expect(html).not.toContain('data-ui-id="rolunk-photo"')
    expect(html).not.toContain('/images/iroda.jpg')
  })
})
