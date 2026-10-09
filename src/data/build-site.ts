import type { NavItem, SiteData } from '@spektra/types'
import type { ClientContent } from '../content'
import {
  buildAboutPage,
  buildArticlePage,
  buildContactPage,
  buildHomePage,
  buildImprintPage,
  buildKnowledgePage,
  buildNotFoundPage,
  buildPrivacyPage,
  buildServicePage,
  buildServicesIndexPage,
  buildSwitchPage,
  createBuildContext,
} from './build-pages'
import { routes } from './routes'
import { validateContent } from './validate-content'

/**
 * Client content → platform SiteData. Every route is a Page; the services and
 * articles pages are generated from data, so adding one needs content only.
 */
export function buildSiteData(content: ClientContent): SiteData {
  const errors = validateContent(content)
  if (errors.length > 0) {
    throw new Error(`Invalid client content:\n- ${errors.join('\n- ')}`)
  }

  const ctx = createBuildContext(content)
  const { copy, company } = content

  const primary: NavItem[] = [
    { label: copy.nav.services, href: routes.services },
    { label: copy.nav.switch, href: routes.switch },
    { label: copy.nav.about, href: routes.about },
    { label: copy.nav.knowledge, href: routes.knowledge },
    { label: copy.nav.contact, href: routes.contact },
  ]
  const footer: NavItem[] = [
    { label: copy.nav.privacy, href: routes.privacy },
    { label: copy.nav.imprint, href: routes.imprint },
  ]

  return {
    site: {
      name: company.name,
      description: copy.home.meta.description,
      url: company.url,
      locale: 'hu',
    },
    navigation: { primary, footer },
    pages: [
      buildHomePage(ctx),
      buildServicesIndexPage(ctx),
      ...ctx.services.map((service) => buildServicePage(ctx, service)),
      buildSwitchPage(ctx),
      buildAboutPage(ctx),
      buildKnowledgePage(ctx),
      ...ctx.articles.map((article) => buildArticlePage(ctx, article)),
      buildContactPage(ctx),
      buildPrivacyPage(ctx),
      buildImprintPage(ctx),
      buildNotFoundPage(ctx),
    ],
  }
}
