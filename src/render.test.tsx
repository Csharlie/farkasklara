import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createFormHandler } from '@spektra/data'
import { FormHandlerProvider, SectionRenderer } from '@spektra/runtime'
import type { Page } from '@spektra/types'
import { content, type ClientContent } from './content'
import { buildSiteData } from './data/build-site'
import { registry } from './registry'

/**
 * Renders page sections through the platform SectionRenderer + client
 * registry (test-only static render; the app itself is client-rendered).
 */
function render(page: Page): string {
  return renderToStaticMarkup(
    <FormHandlerProvider handler={createFormHandler({ driver: 'noop', logToConsole: false })}>
      <SectionRenderer sections={page.sections} registry={registry} fallback={(type) => `UNRESOLVED:${type}`} />
    </FormHandlerProvider>,
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
    expect(html).toContain('Könyvelő, ügyintéző')
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
    expect(team).not.toContain('<img')
    expect(team).toContain('Posszert Ervin')
  })

  it('never puts white text on the accent color', () => {
    for (const page of site.pages) {
      expect(render(page)).not.toMatch(/bg-accent[^"]*text-white|text-white[^"]*bg-accent/)
    }
  })
})
