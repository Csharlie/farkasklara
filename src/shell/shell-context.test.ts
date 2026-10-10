import { describe, expect, it } from 'vitest'
import { content } from '../content'
import { buildSiteData } from '../data/build-site'
import { contextualQuoteHref } from './shell-context'

const pages = buildSiteData(content).pages

describe('header quote CTA (contextual)', () => {
  it('scrolls to the form on pages that contain it', () => {
    expect(contextualQuoteHref('/', pages)).toBe('#ajanlatkeres')
    expect(contextualQuoteHref('/kapcsolat', pages)).toBe('#ajanlatkeres')
  })

  it('preselects the service on a service page', () => {
    expect(contextualQuoteHref('/szolgaltatasok/berszamfejtes', pages)).toBe(
      '/kapcsolat?szolgaltatas=berszamfejtes#ajanlatkeres',
    )
  })

  it('links to the contact form elsewhere', () => {
    expect(contextualQuoteHref('/rolunk', pages)).toBe('/kapcsolat#ajanlatkeres')
    expect(contextualQuoteHref('/nincs-ilyen', pages)).toBe('/kapcsolat#ajanlatkeres')
  })
})
