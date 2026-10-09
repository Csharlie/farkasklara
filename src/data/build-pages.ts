import type { HeroBlockProps } from '@spektra/components'
import type { Page, PageMeta, Section } from '@spektra/types'
import type { ClientContent } from '../content'
import type { Article, Audience, Cta, Service, Step } from '../content/types'
import type { FkArticlesData } from '../sections/fk-articles'
import type { FkContactData } from '../sections/fk-contact'
import type { FkCtaData } from '../sections/fk-cta'
import type { FkFaqData } from '../sections/fk-faq'
import type { FkListData } from '../sections/fk-list'
import type { FkPageHeaderData } from '../sections/fk-page-header'
import type { FkPriceData } from '../sections/fk-price'
import type { FkProseData } from '../sections/fk-prose'
import type { FkQuoteData } from '../sections/fk-quote'
import type { FkServicesData } from '../sections/fk-services'
import type { FkTeamData, FkTeamMember } from '../sections/fk-team'
import type { FkTrustData } from '../sections/fk-trust'
import type { FkFeaturesData } from '../sections/platform'
import type { LinkCta } from '../sections/shared/types'
import { buildContactView, emailLink, formatAddress, phoneLink, type ContactView } from './contact'
import { visiblePrice } from './price'
import { HOME_SLUG, NOT_FOUND_SLUG, QUOTE_ANCHOR, pageSlugToPath, quoteHref, routes } from './routes'
import { fillTemplate } from './text'

// ── Context ──────────────────────────────────────────────────────────

export interface BuildContext {
  content: ClientContent
  contact: ContactView
  /** Visible services, ordered by `order`. */
  services: Service[]
  /** Visible audiences (enabled + segment switch), content order. */
  audiences: Audience[]
  /** Visible articles. */
  articles: Article[]
}

export function createBuildContext(content: ClientContent): BuildContext {
  const { settings } = content
  return {
    content,
    contact: buildContactView(content.company, content.people),
    services: content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order),
    audiences: content.audiences.filter(
      (a) => a.enabled && (a.segment === undefined || settings.segments[a.segment].enabled),
    ),
    articles: content.articles.filter((a) => a.visible),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Typed section factory: the type string must match the registry (src/registry.ts). */
function section<T>(id: string, type: string, data: T): Section<T> {
  return { id, type, data }
}

/** Optional blocks return undefined when empty — they never reach the page. */
function compact(sections: (Section | undefined)[]): Section[] {
  return sections.filter((s): s is Section => s !== undefined)
}

function nonEmpty<T>(items: readonly T[] | undefined): items is readonly T[] {
  return items !== undefined && items.length > 0
}

function pageMeta(ctx: BuildContext, path: string, title: string, description: string): PageMeta {
  const url = ctx.content.company.url?.replace(/\/$/, '')
  return { title, description, canonical: url ? `${url}${path === '/' ? '/' : path}` : undefined }
}

function pageTitle(ctx: BuildContext, template: string): string {
  return fillTemplate(template, { company: ctx.content.company.name })
}

function page(slug: string, title: string, meta: PageMeta, sections: Section[]): Page {
  return { slug, title, meta, sections }
}

function stepsFeatures(id: string, title: string, steps: readonly Step[], tone: FkFeaturesData['tone']) {
  return section<FkFeaturesData>(id, 'features', {
    title,
    features: steps.map((step, index) => ({ title: `${index + 1}. ${step.title}`, description: step.description })),
    columns: steps.length >= 4 ? 4 : steps.length === 2 ? 2 : 3,
    tone,
  })
}

function audiencesFeatures(id: string, title: string, audiences: readonly Audience[], tone: FkFeaturesData['tone']) {
  return section<FkFeaturesData>(id, 'features', {
    title,
    features: audiences.map((a) => ({ title: a.label, description: a.description })),
    columns: audiences.length >= 4 ? 4 : audiences.length === 2 ? 2 : 3,
    tone,
  })
}

/** CTA intent → route. Contact intents fall back to /kapcsolat while the value is a placeholder. */
export function ctaToLink(ctx: BuildContext, cta: Cta, id: string, kind: LinkCta['kind']): LinkCta {
  const { prefillParam } = ctx.content.settings.quote
  switch (cta.intent) {
    case 'quote':
    case 'consult':
      return { id, kind, text: cta.label, href: quoteHref(prefillParam, cta.prefillService) }
    case 'call':
      return ctx.contact.phone.href
        ? { id, kind, text: cta.label, href: ctx.contact.phone.href, action: 'call' }
        : { id, kind, text: cta.label, href: routes.contact }
    case 'email':
      return ctx.contact.email.href
        ? { id, kind, text: cta.label, href: ctx.contact.email.href, action: 'email' }
        : { id, kind, text: cta.label, href: routes.contact }
  }
}

function serviceCta(service: Service): Cta {
  return service.cta ?? { label: `${service.title}: ajánlatkérés`, intent: 'quote', prefillService: service.slug }
}

/** Secondary "call" CTA — only when the phone number is real. */
function callCta(ctx: BuildContext, id: string): LinkCta | undefined {
  const { phone } = ctx.contact
  return phone.href ? { id, kind: 'secondary', text: phone.text, href: phone.href, action: 'call' } : undefined
}

function servicesSection(
  ctx: BuildContext,
  id: string,
  items: readonly Service[],
  options: { title: string; intro?: string; numbered: boolean; highlightFirst: boolean; tone?: 'plain' | 'warm' },
): Section<FkServicesData> | undefined {
  if (items.length === 0) return undefined
  return section<FkServicesData>(id, 'fk-services', {
    id,
    title: options.title,
    intro: options.intro,
    numbered: options.numbered,
    highlightFirst: options.highlightFirst,
    tone: options.tone,
    linkLabel: 'Részletek',
    items: items.map((service, index) => ({
      slug: service.slug,
      number: String(index + 1).padStart(2, '0'),
      title: service.title,
      summary: service.summary,
      href: routes.service(service.slug),
      price: visiblePrice(service, ctx.content.settings),
    })),
  })
}

function teamSection(ctx: BuildContext, id: string, title: string, intro: string | undefined, tone?: 'plain' | 'warm') {
  const { people, copy } = ctx.content
  if (people.length === 0) return undefined
  const members: FkTeamMember[] = people.map((person) => ({
    id: person.id,
    name: person.name,
    role: person.role,
    photo: person.photo,
    bio: person.bio,
    credentials: person.credentials,
    isPrimaryContact: person.isPrimaryContact,
    // Primary contact: own channel or the office channel. Others: own channel only.
    phone: person.isPrimaryContact ? ctx.contact.primaryContact.phone : person.phone ? phoneLink(person.phone) : undefined,
    email: person.isPrimaryContact ? ctx.contact.primaryContact.email : person.email ? emailLink(person.email) : undefined,
  }))
  return section<FkTeamData>(id, 'fk-team', { id, title, intro, members, primaryBadge: copy.team.primaryContactBadge, tone })
}

function quoteSection(ctx: BuildContext, id: string, title: string, intro: string | undefined, tone?: 'plain' | 'warm') {
  const { copy, settings } = ctx.content
  const { success, ...labels } = copy.quoteForm
  return section<FkQuoteData>(id, 'fk-quote', {
    id,
    title,
    intro,
    formId: 'quote',
    services: ctx.services.map((s) => ({ value: s.slug, label: s.title })),
    businessForms: settings.quote.businessForms,
    prefillParam: settings.quote.prefillParam,
    privacyHref: routes.privacy,
    labels,
    success,
    primaryContact: { label: copy.contact.primaryContactLabel, ...ctx.contact.primaryContact },
    tone,
  })
}

function header(id: string, data: Omit<FkPageHeaderData, 'id'>) {
  return section<FkPageHeaderData>(id, 'fk-page-header', { id, ...data })
}

function closingCta(ctx: BuildContext, id: string, data: { title: string; text?: string; primary: LinkCta }) {
  return section<FkCtaData>(id, 'fk-cta', { id, ...data, secondary: callCta(ctx, `${id}-call`) })
}

// ── Pages ────────────────────────────────────────────────────────────

/** Homepage — fixed order: hero, trust, services, audiences, process, team, quote (footer = shell). */
export function buildHomePage(ctx: BuildContext): Page {
  const { copy, company, people } = ctx.content
  const home = copy.home

  const facts = home.trust.map((fact) =>
    'source' in fact
      ? { value: fact.source === 'teamSize' ? String(people.length) : company.city, label: fact.label }
      : fact,
  )

  return page(
    HOME_SLUG,
    company.name,
    pageMeta(ctx, routes.home, pageTitle(ctx, home.meta.title), home.meta.description),
    compact([
      section<HeroBlockProps>('home-hero', 'hero', {
        subtitle: home.hero.eyebrow,
        title: home.hero.title,
        description: home.hero.description,
        primaryCTA: { text: home.hero.primaryCta, href: `#${QUOTE_ANCHOR}` },
        secondaryCTA: { text: home.hero.secondaryCta, href: routes.services },
        backgroundImage: home.hero.image ? { src: home.hero.image, alt: home.hero.imageAlt } : undefined,
        colorScheme: 'dark',
      }),
      facts.length > 0
        ? section<FkTrustData>('home-trust', 'fk-trust', { id: 'home-trust', label: 'Röviden az irodáról', facts })
        : undefined,
      servicesSection(ctx, 'szolgaltatasok', ctx.services, {
        title: home.services.title,
        intro: home.services.intro,
        numbered: true,
        highlightFirst: true,
      }),
      ctx.audiences.length > 0 ? audiencesFeatures('kinek', home.audiences.title, ctx.audiences, 'warm') : undefined,
      nonEmpty(home.process.steps) ? stepsFeatures('hogyan-dolgozunk', home.process.title, home.process.steps, 'plain') : undefined,
      teamSection(ctx, 'rolunk', home.team.title, home.team.intro, 'warm'),
      quoteSection(ctx, QUOTE_ANCHOR, home.quote.title, home.quote.intro),
    ]),
  )
}

export function buildServicesIndexPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.servicesIndex
  return page(
    'szolgaltatasok',
    c.title,
    pageMeta(ctx, routes.services, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('szolgaltatasok-fejlec', { eyebrow: c.eyebrow, title: c.title, lead: c.lead }),
      servicesSection(ctx, 'szolgaltatasok-lista', ctx.services, {
        title: ctx.content.copy.home.services.title,
        numbered: true,
        highlightFirst: true,
      }),
      closingCta(ctx, 'szolgaltatasok-cta', {
        title: ctx.content.copy.home.quote.title,
        text: ctx.content.copy.home.quote.intro,
        primary: { id: 'szolgaltatasok-cta-quote', kind: 'primary', text: ctx.content.copy.nav.quote, href: quoteHref(ctx.content.settings.quote.prefillParam) },
      }),
    ]),
  )
}

/**
 * Service page template — FIXED block order, every block optional:
 *  1 header · 2 includes · 3 audiences · 4 process · 5 requirements · 6 price
 *  7 faq · 8 closing CTA · 9 related services · 10 related articles
 */
export function buildServicePage(ctx: BuildContext, service: Service): Page {
  const { company, settings, copy } = ctx.content
  const blocks = copy.servicePage.blocks
  const path = routes.service(service.slug)
  const id = (block: string) => `${service.slug}-${block}`
  const cta = serviceCta(service)

  const audiences = ctx.audiences.filter((a) => service.audiences?.includes(a.id))
  const related = ctx.services.filter((s) => s.slug !== service.slug && service.related?.includes(s.slug))
  const relatedArticles = ctx.articles.filter((a) => service.relatedArticles?.includes(a.slug))
  const price = visiblePrice(service, settings)
  const faq = service.faq?.filter((f) => f.question.trim() && f.answer.trim()) ?? []

  const title =
    service.seo.title ??
    fillTemplate(settings.seo.serviceTitleTemplate, { service: service.title, city: company.city, company: company.name })

  return page(
    path.slice(1),
    service.title,
    pageMeta(ctx, path, title, service.seo.description),
    compact([
      header(id('fejlec'), {
        eyebrow: fillTemplate(copy.servicePage.eyebrow, { city: company.city }),
        title: service.title,
        lead: service.summary,
        body: service.body,
        primary: ctaToLink(ctx, cta, id('fejlec-cta'), 'primary'),
      }),
      nonEmpty(service.includes)
        ? section<FkListData>(id('tartalom'), 'fk-list', { id: id('tartalom'), title: blocks.includes, items: [...service.includes] })
        : undefined,
      audiences.length > 0 ? audiencesFeatures(id('kinek'), blocks.audiences, audiences, 'warm') : undefined,
      nonEmpty(service.process) ? stepsFeatures(id('folyamat'), blocks.process, service.process, 'plain') : undefined,
      nonEmpty(service.requirements)
        ? section<FkListData>(id('amit-kerunk'), 'fk-list', {
            id: id('amit-kerunk'),
            title: blocks.requirements,
            items: [...service.requirements],
            tone: 'warm',
          })
        : undefined,
      price ? section<FkPriceData>(id('dij'), 'fk-price', { id: id('dij'), title: blocks.price, price }) : undefined,
      faq.length > 0 ? section<FkFaqData>(id('gyik'), 'fk-faq', { id: id('gyik'), title: blocks.faq, items: faq, tone: 'warm' }) : undefined,
      closingCta(ctx, id('cta'), {
        title: copy.servicePage.closing.title,
        text: copy.servicePage.closing.text,
        primary: ctaToLink(ctx, cta, id('cta-primary'), 'primary'),
      }),
      servicesSection(ctx, id('kapcsolodo'), related, { title: blocks.related, numbered: false, highlightFirst: false, tone: 'warm' }),
      relatedArticles.length > 0
        ? section<FkArticlesData>(id('cikkek'), 'fk-articles', {
            id: id('cikkek'),
            title: blocks.relatedArticles,
            items: relatedArticles.map((a) => ({ slug: a.slug, title: a.title, summary: a.summary, href: routes.article(a.slug) })),
          })
        : undefined,
    ]),
  )
}

export function buildSwitchPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.switch
  const cta: Cta = { label: c.cta.label, intent: 'quote', prefillService: c.cta.prefillService }
  return page(
    'konyvelovaltas',
    c.title,
    pageMeta(ctx, routes.switch, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('konyvelovaltas-fejlec', {
        eyebrow: c.eyebrow,
        title: c.title,
        lead: c.lead,
        primary: ctaToLink(ctx, cta, 'konyvelovaltas-fejlec-cta', 'primary'),
      }),
      nonEmpty(c.steps.items) ? stepsFeatures('konyvelovaltas-folyamat', c.steps.title, c.steps.items, 'plain') : undefined,
      nonEmpty(c.requirements.items)
        ? section<FkListData>('konyvelovaltas-amit-kerunk', 'fk-list', {
            id: 'konyvelovaltas-amit-kerunk',
            title: c.requirements.title,
            items: [...c.requirements.items],
            tone: 'warm',
          })
        : undefined,
      closingCta(ctx, 'konyvelovaltas-cta', {
        title: c.cta.title,
        text: c.cta.text,
        primary: ctaToLink(ctx, cta, 'konyvelovaltas-cta-primary', 'primary'),
      }),
    ]),
  )
}

export function buildAboutPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.about
  return page(
    'rolunk',
    c.title,
    pageMeta(ctx, routes.about, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('rolunk-fejlec', { eyebrow: c.eyebrow, title: c.title, lead: c.lead }),
      section<FkProseData>('rolunk-bemutatkozas', 'fk-prose', { id: 'rolunk-bemutatkozas', paragraphs: c.body }),
      teamSection(ctx, 'rolunk-csapat', c.teamTitle, undefined, 'warm'),
      closingCta(ctx, 'rolunk-cta', {
        title: ctx.content.copy.home.quote.title,
        text: ctx.content.copy.home.quote.intro,
        primary: { id: 'rolunk-cta-quote', kind: 'primary', text: ctx.content.copy.nav.quote, href: quoteHref(ctx.content.settings.quote.prefillParam) },
      }),
    ]),
  )
}

export function buildKnowledgePage(ctx: BuildContext): Page {
  const c = ctx.content.copy.knowledge
  return page(
    'tudastar',
    c.title,
    pageMeta(ctx, routes.knowledge, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('tudastar-fejlec', { eyebrow: c.eyebrow, title: c.title, lead: c.lead }),
      section<FkArticlesData>('tudastar-cikkek', 'fk-articles', {
        id: 'tudastar-cikkek',
        title: c.listTitle,
        items: ctx.articles.map((a) => ({ slug: a.slug, title: a.title, summary: a.summary, href: routes.article(a.slug) })),
        emptyText: c.empty,
      }),
    ]),
  )
}

export function buildArticlePage(ctx: BuildContext, article: Article): Page {
  const path = routes.article(article.slug)
  return page(
    path.slice(1),
    article.title,
    pageMeta(
      ctx,
      path,
      article.seo.title ?? fillTemplate(ctx.content.settings.seo.pageTitleTemplate, { page: article.title, company: ctx.content.company.name }),
      article.seo.description,
    ),
    compact([
      header(`${article.slug}-fejlec`, { eyebrow: ctx.content.copy.knowledge.title, title: article.title, lead: article.summary }),
      section<FkProseData>(`${article.slug}-szoveg`, 'fk-prose', { id: `${article.slug}-szoveg`, paragraphs: article.body }),
      closingCta(ctx, `${article.slug}-cta`, {
        title: ctx.content.copy.home.quote.title,
        text: ctx.content.copy.home.quote.intro,
        primary: { id: `${article.slug}-cta-quote`, kind: 'primary', text: ctx.content.copy.nav.quote, href: quoteHref(ctx.content.settings.quote.prefillParam) },
      }),
    ]),
  )
}

export function buildContactPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.contact
  const contact = ctx.contact
  return page(
    'kapcsolat',
    c.title,
    pageMeta(ctx, routes.contact, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('kapcsolat-fejlec', { eyebrow: c.eyebrow, title: c.title, lead: c.lead }),
      section<FkContactData>('kapcsolat-adatok', 'fk-contact', {
        id: 'kapcsolat-adatok',
        title: c.detailsTitle,
        companyName: contact.companyName,
        address: contact.address,
        phone: contact.phone,
        email: contact.email,
        hoursTitle: ctx.content.copy.footer.hoursTitle,
        hours: contact.hours,
        primaryContact: { label: c.primaryContactLabel, ...contact.primaryContact },
      }),
      quoteSection(ctx, QUOTE_ANCHOR, ctx.content.copy.home.quote.title, ctx.content.copy.home.quote.intro, 'warm'),
    ]),
  )
}

export function buildPrivacyPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.privacy
  return page(
    'adatvedelem',
    c.title,
    pageMeta(ctx, routes.privacy, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('adatvedelem-fejlec', { title: c.title }),
      section<FkProseData>('adatvedelem-szoveg', 'fk-prose', { id: 'adatvedelem-szoveg', paragraphs: c.body }),
    ]),
  )
}

export function buildImprintPage(ctx: BuildContext): Page {
  const { company, copy } = ctx.content
  const c = copy.imprint
  const values = {
    legalName: company.legalName,
    address: formatAddress(company.address),
    phone: company.phone,
    email: company.email,
  }
  return page(
    'impresszum',
    c.title,
    pageMeta(ctx, routes.imprint, pageTitle(ctx, c.meta.title), c.meta.description),
    compact([
      header('impresszum-fejlec', { title: c.title }),
      section<FkProseData>('impresszum-adatok', 'fk-prose', {
        id: 'impresszum-adatok',
        fields: c.fields.map((f) => ({ label: f.label, value: fillTemplate(f.value, values) })),
      }),
    ]),
  )
}

export function buildNotFoundPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.notFound
  return page(
    NOT_FOUND_SLUG,
    c.title,
    pageMeta(ctx, pageSlugToPath(NOT_FOUND_SLUG), pageTitle(ctx, c.meta.title), c.meta.description),
    [
      header('nem-talalhato-fejlec', {
        title: c.title,
        lead: c.lead,
        primary: { id: 'nem-talalhato-home', kind: 'primary', text: c.cta, href: routes.home },
      }),
    ],
  )
}
