import type { ClientContent } from '../content'
import { resolveLead, resolvePrimaryContact } from './contact'
import { SLUG_PATTERN } from './routes'

/**
 * Client content validation — runs before SiteData is built. Complements the
 * platform validateSiteData() (outer SiteData shape, run by the adapter).
 * Returns human-readable errors; buildSiteData() throws when any is found.
 */
export function validateContent(content: ClientContent): string[] {
  const errors: string[] = []
  const { services, audiences, articles, people, settings } = content

  const checkSlugs = (kind: string, slugs: string[]) => {
    const seen = new Set<string>()
    for (const slug of slugs) {
      if (!SLUG_PATTERN.test(slug)) errors.push(`${kind} slug "${slug}" must be lowercase ASCII, hyphen-separated`)
      if (seen.has(slug)) errors.push(`${kind} slug "${slug}" is duplicated`)
      seen.add(slug)
    }
  }
  checkSlugs('service', services.map((s) => s.slug))
  checkSlugs('audience', audiences.map((a) => a.id))
  checkSlugs('article', articles.map((a) => a.slug))
  checkSlugs('person', people.map((p) => p.id))

  const serviceSlugs = new Set(services.map((s) => s.slug))
  const audienceIds = new Set(audiences.map((a) => a.id))
  const articleSlugs = new Set(articles.map((a) => a.slug))

  for (const service of services) {
    for (const slug of service.related ?? []) {
      if (!serviceSlugs.has(slug)) errors.push(`service "${service.slug}": unknown related service "${slug}"`)
    }
    for (const id of service.audiences ?? []) {
      if (!audienceIds.has(id)) errors.push(`service "${service.slug}": unknown audience "${id}"`)
    }
    for (const slug of service.relatedArticles ?? []) {
      if (!articleSlugs.has(slug)) errors.push(`service "${service.slug}": unknown related article "${slug}"`)
    }
    const prefill = service.cta?.prefillService
    if (prefill && !serviceSlugs.has(prefill)) {
      errors.push(`service "${service.slug}": cta.prefillService "${prefill}" is not a service`)
    }
    if (!service.seo.description.trim()) errors.push(`service "${service.slug}": seo.description is required`)
  }

  for (const resolve of [resolvePrimaryContact, resolveLead]) {
    try {
      resolve(people)
    } catch (error) {
      errors.push((error as Error).message)
    }
  }

  if (settings.modules.audiencePages) {
    errors.push('settings.modules.audiencePages (/kinek/...) is prepared but not implemented')
  }
  if (settings.modules.pricingPage) {
    errors.push('settings.modules.pricingPage (/dijak) is prepared but not implemented')
  }

  return errors
}
