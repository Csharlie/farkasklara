import type { Page, PageMeta, Section } from '@spektra/types'
import type { ClientContent } from '../content'
import type { FactInput, SectionPhoto } from '../content/copy'
import type { Article, Audience, Cta, FaqItem, LegalChapterInput, Person, Service, Step } from '../content/types'
import type { FkArticlesData } from '../sections/fk-articles'
import type { FkContactData } from '../sections/fk-contact'
import type { FkCtaData } from '../sections/fk-cta'
import type { FkFaqData } from '../sections/fk-faq'
import type { FkLegalChapter, FkLegalData } from '../sections/fk-legal'
import type { FkListData } from '../sections/fk-list'
import type { FkPageHeaderData } from '../sections/fk-page-header'
import type { FkPriceData } from '../sections/fk-price'
import type { FkProseData } from '../sections/fk-prose'
import type { FkQuoteData } from '../sections/fk-quote'
import type { FkServicesData } from '../sections/fk-services'
import type { FkTeamData, FkTeamMember } from '../sections/fk-team'
import type { FkTrustData } from '../sections/fk-trust'
import type { FkFeaturesData, FkHeroData } from '../sections/platform'
import type { LinkCta } from '../sections/shared/types'
import { buildContactView, emailLink, formatAddress, isCompleteAddress, phoneLink, roleLine, type ContactLink, type ContactView } from './contact'
import { visiblePrice } from './price'
import { HOME_SLUG, NOT_FOUND_SLUG, QUOTE_ANCHOR, pageSlugToPath, pathToPageSlug, quoteHref, routes, withBase, withBaseSrcSet } from './routes'
import { fillTemplate, known, knownItems } from './text'

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
      (a) => a.enabled && known(a.description) && (a.segment === undefined || settings.segments[a.segment].enabled),
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

/** Steps / FAQ items whose text still contains a placeholder are not rendered. */
function knownSteps(steps: readonly Step[] | undefined): Step[] {
  return (steps ?? []).filter((s) => known(s.title) && known(s.description))
}

function knownFaq(items: readonly FaqItem[] | undefined): FaqItem[] {
  return (items ?? []).filter((f) => known(f.question) && known(f.answer))
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

/**
 * {primaryContact} / {phone} / {address} tokens → the designated contact's
 * name (role while unknown), the enquiry phone and the office address.
 */
function withContact(ctx: BuildContext, template: string): string {
  const { primaryContact, address } = ctx.contact
  return fillTemplate(template, {
    // Unknown name → the plain role (without the credential part) reads naturally in a sentence.
    primaryContact: primaryContact.name ?? primaryContact.role.split(' · ')[0]!.toLowerCase(),
    phone: primaryContact.phone?.text ?? '',
    address,
  })
}

/** Section photo with URLs under the deploy base. */
function sectionPhoto(photo: SectionPhoto | undefined): FkTeamData['image'] {
  if (!photo) return undefined
  return { ...photo, src: withBase(photo.src), srcSet: photo.srcSet ? withBaseSrcSet(photo.srcSet) : undefined }
}

/** Office storefront photo beside the homepage "Rólunk" heading (settings.showOfficePhoto). */
function officePhoto(ctx: BuildContext): FkTeamData['image'] {
  return ctx.content.settings.showOfficePhoto ? sectionPhoto(ctx.content.copy.home.about.photo) : undefined
}

/** {lead} token → the lead's name, or "a szakmai vezető" while unknown. */
function withLead(ctx: BuildContext, template: string): string {
  return fillTemplate(template, { lead: ctx.contact.lead.name ?? 'a szakmai vezető' })
}

function stepsFeatures(id: string, title: string, steps: readonly Step[], tone: FkFeaturesData['tone']) {
  const visible = knownSteps(steps)
  if (visible.length === 0) return undefined
  return section<FkFeaturesData>(id, 'features', {
    title,
    features: visible.map((step, index) => ({ title: `${index + 1}. ${step.title}`, description: step.description })),
    columns: visible.length >= 4 ? 4 : visible.length === 2 ? 2 : 3,
    tone,
  })
}

function audiencesFeatures(id: string, title: string, audiences: readonly Audience[], tone: FkFeaturesData['tone']) {
  if (audiences.length === 0) return undefined
  return section<FkFeaturesData>(id, 'features', {
    title,
    features: audiences.map((a) => ({ title: a.label, description: a.description, iconName: a.icon })),
    columns: audiences.length >= 4 ? 4 : audiences.length === 2 ? 2 : 3,
    tone,
  })
}

function listSection(id: string, title: string, items: readonly string[] | undefined, tone?: 'plain' | 'warm') {
  const visible = knownItems(items)
  if (visible.length === 0) return undefined
  return section<FkListData>(id, 'fk-list', { id, title, items: visible, tone })
}

function faqSection(id: string, title: string, items: readonly FaqItem[] | undefined, tone?: 'plain' | 'warm') {
  const visible = knownFaq(items)
  if (visible.length === 0) return undefined
  return section<FkFaqData>(id, 'fk-faq', { id, title, items: visible, tone })
}

/** CTA intent → route. Contact intents fall back to /kapcsolat while the value is unknown. */
export function ctaToLink(ctx: BuildContext, cta: Cta, id: string, kind: LinkCta['kind']): LinkCta {
  const { prefillParam } = ctx.content.settings.quote
  switch (cta.intent) {
    case 'quote':
    case 'consult':
      return { id, kind, text: cta.label, href: quoteHref(prefillParam, cta.prefillService) }
    case 'call':
      return ctx.contact.phone?.href
        ? { id, kind, text: cta.label, href: ctx.contact.phone.href, action: 'call' }
        : { id, kind, text: cta.label, href: routes.contact }
    case 'email':
      return ctx.contact.email?.href
        ? { id, kind, text: cta.label, href: ctx.contact.email.href, action: 'email' }
        : { id, kind, text: cta.label, href: routes.contact }
  }
}

function serviceCta(service: Service): Cta {
  return service.cta ?? { label: `Ajánlatot kérek: ${service.title}`, intent: 'quote', prefillService: service.slug }
}

/** Secondary "call" CTA — only when the phone number is real. */
function callCta(ctx: BuildContext, id: string): LinkCta | undefined {
  const { phone } = ctx.contact
  return phone?.href ? { id, kind: 'secondary', text: phone.text, href: phone.href, action: 'call' } : undefined
}

function servicesSection(
  ctx: BuildContext,
  id: string,
  items: readonly Service[],
  options: {
    title: string
    intro?: string
    numbered: boolean
    highlightFirst: boolean
    iconCards?: boolean
    tone?: 'plain' | 'warm'
  },
): Section<FkServicesData> | undefined {
  if (items.length === 0) return undefined
  const labels = ctx.content.copy.serviceCard
  return section<FkServicesData>(id, 'fk-services', {
    id,
    title: options.title,
    intro: options.intro,
    numbered: options.numbered,
    highlightFirst: options.highlightFirst,
    iconCards: options.iconCards,
    tone: options.tone,
    linkLabel: labels.link,
    items: items.map((service, index) => ({
      slug: service.slug,
      number: String(index + 1).padStart(2, '0'),
      title: service.title,
      summary: service.summary,
      href: routes.service(service.slug),
      icon: service.icon,
      price: visiblePrice(service, ctx.content.settings),
    })),
  })
}

function teamMember(person: Person): FkTeamMember {
  return {
    id: person.id,
    name: known(person.name),
    role: roleLine(person.role, knownItems(person.credentials)),
    photo: person.photo,
    bio: known(person.bio),
    // Shown in the role line, not as a separate list.
    isPrimaryContact: person.isPrimaryContact,
    // Team cards show no office channels (the firm's contact details live in
    // the contact cards/footer); only a person's own, known channel appears.
    phone: phoneLink(person.phone),
    email: emailLink(person.email),
  }
}

/** Verified facts only: placeholder values are dropped, derived values are computed. */
function knownFacts(ctx: BuildContext, facts: readonly FactInput[]): { value: string; label: string }[] {
  const { people, company } = ctx.content
  const derived = {
    teamSize: String(people.length),
    // Counted from the people's credentials — only verified qualifications.
    certifiedCount: String(people.filter((p) => knownItems(p.credentials).includes('Mérlegképes könyvelő')).length),
    serviceCount: String(ctx.services.length),
    audienceCount: String(ctx.audiences.length),
    city: company.city,
  }
  return facts
    .map((fact) => ('source' in fact ? { value: derived[fact.source], label: fact.label } : fact))
    .filter((fact) => known(fact.value) !== undefined)
}

function teamSection(
  ctx: BuildContext,
  id: string,
  options: {
    title: string
    intro?: string
    more?: LinkCta
    joinedWithNext?: boolean
    image?: FkTeamData['image']
    /** Limit the lead's introduction (homepage shows a shorter version). */
    leadParagraphs?: number
    tone?: 'plain' | 'warm'
  },
) {
  const { people, copy } = ctx.content
  const leadPerson = people.find((p) => p.isLead)
  // Members without a known name AND without a role description would be empty cards.
  const others = people
    .filter((p) => !p.isLead)
    .map((p) =>
      p.isPrimaryContact
        ? {
            ...teamMember(p),
            phone: ctx.contact.primaryContact.phone,
            email: ctx.contact.primaryContact.email,
          }
        : teamMember(p),
    )
    .filter((m) => m.name || m.bio)
  if (!leadPerson && others.length === 0) return undefined
  return section<FkTeamData>(id, 'fk-team', {
    id,
    title: options.title,
    intro: options.intro,
    lead: leadPerson
      ? {
          ...teamMember(leadPerson),
          badge: copy.team.leadBadge,
          // Lead block: introduction paragraphs (fallback: the short bio).
          paragraphs: (knownItems(leadPerson.intro).length > 0 ? knownItems(leadPerson.intro) : knownItems([leadPerson.bio ?? ''])).slice(
            0,
            options.leadParagraphs,
          ),
        }
      : undefined,
    members: others,
    more: options.more,
    image: options.image,
    joinedWithNext: options.joinedWithNext,
    tone: options.tone,
  })
}

function quoteSection(
  ctx: BuildContext,
  id: string,
  title: string,
  intro: string | undefined,
  options: { panel: boolean; tone?: 'plain' | 'warm' },
) {
  const { copy, settings } = ctx.content
  const { success, ...labels } = copy.quoteForm
  const contact = ctx.contact.primaryContact
  return section<FkQuoteData>(id, 'fk-quote', {
    id,
    title,
    intro,
    formId: 'quote',
    services: ctx.services.map((s) => ({ value: s.slug, label: s.title })),
    prefillParam: settings.quote.prefillParam,
    privacyHref: routes.privacy,
    labels,
    success,
    // Firm's official contact details (the enquiry itself goes to the designated contact).
    panel: options.panel
      ? {
          title: copy.quotePanel.title,
          labels: {
            address: copy.quotePanel.address,
            phone: copy.quotePanel.phone,
            email: copy.quotePanel.email,
            hours: copy.quotePanel.hours,
          },
          notes: copy.quotePanel.notes,
          contactPerson: contact.name
            ? { label: copy.quotePanel.contact, name: contact.name, role: contact.role }
            : undefined,
          addressLines: ctx.contact.addressLines,
          directions: ctx.contact.directionsHref
            ? { href: ctx.contact.directionsHref, label: copy.quotePanel.directions }
            : undefined,
          phone: ctx.contact.phone,
          email: ctx.contact.email,
          hours: ctx.contact.hours,
        }
      : undefined,
    primaryContact: {
      label: copy.contact.primaryContactLabel,
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
    },
    tone: options.tone,
  })
}

function header(id: string, data: Omit<FkPageHeaderData, 'id'>) {
  return section<FkPageHeaderData>(id, 'fk-page-header', { id, ...data })
}

function closingCta(ctx: BuildContext, id: string, data: { title: string; text?: string; primary: LinkCta }) {
  return section<FkCtaData>(id, 'fk-cta', { id, ...data, secondary: callCta(ctx, `${id}-call`) })
}

function generalQuoteCta(ctx: BuildContext, id: string) {
  const { copy, settings } = ctx.content
  return closingCta(ctx, id, {
    title: copy.home.quote.title,
    text: copy.home.quote.intro,
    primary: { id: `${id}-quote`, kind: 'primary', text: copy.home.hero.primaryCta, href: quoteHref(settings.quote.prefillParam) },
  })
}

// ── Pages ────────────────────────────────────────────────────────────

/** Homepage — fixed order: hero, services, audiences, about (lead + team), quote (footer = shell). */
export function buildHomePage(ctx: BuildContext): Page {
  const { copy, company } = ctx.content
  const home = copy.home

  return page(
    HOME_SLUG,
    company.name,
    pageMeta(ctx, routes.home, pageTitle(ctx, home.meta.title), home.meta.description),
    compact([
      section<FkHeroData>('home-hero', 'hero', {
        subtitle: home.hero.eyebrow,
        title: home.hero.title,
        titleHighlight: home.hero.titleHighlight,
        description: home.hero.description,
        primaryCTA: { text: home.hero.primaryCta, href: `#${QUOTE_ANCHOR}` },
        // Services follow right below the hero — scroll instead of a page load.
        secondaryCTA: { text: home.hero.secondaryCta, href: '#szolgaltatasok' },
        backgroundImage: home.hero.image
          ? { src: withBase(home.hero.image), alt: known(home.hero.imageAlt) ?? '' }
          : undefined,
        colorScheme: 'dark',
      }),
      servicesSection(ctx, 'szolgaltatasok', ctx.services, {
        title: home.services.title,
        intro: home.services.intro,
        numbered: false,
        highlightFirst: false,
        iconCards: true,
      }),
      audiencesFeatures('kinek', home.audiences.title, ctx.audiences, 'warm'),
      teamSection(ctx, 'rolunk', {
        title: home.about.title,
        intro: withLead(ctx, home.about.intro),
        more: { id: 'rolunk-tovabb', kind: 'secondary', text: home.about.more, href: routes.about },
        image: officePhoto(ctx),
        joinedWithNext: true,
        leadParagraphs: 2,
      }),
      // Four-item facts strip directly below the About section.
      (() => {
        const facts = knownFacts(ctx, home.facts.items)
        return facts.length > 0
          ? section<FkTrustData>('rolunk-tenyek', 'fk-trust', { id: 'rolunk-tenyek', label: home.facts.label, facts })
          : undefined
      })(),
      quoteSection(ctx, QUOTE_ANCHOR, home.quote.title, home.quote.intro, { panel: true, tone: 'warm' }),
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
      // Same card design as the homepage (icon cards).
      servicesSection(ctx, 'szolgaltatasok-lista', ctx.services, {
        title: c.listTitle,
        numbered: false,
        highlightFirst: false,
        iconCards: true,
      }),
      generalQuoteCta(ctx, 'szolgaltatasok-cta'),
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

  const title =
    service.seo.title ??
    fillTemplate(settings.seo.serviceTitleTemplate, { service: service.title, city: company.city, company: company.name })

  return page(
    pathToPageSlug(path),
    service.title,
    pageMeta(ctx, path, title, service.seo.description),
    compact([
      header(id('fejlec'), {
        eyebrow: fillTemplate(copy.servicePage.eyebrow, { city: company.city }),
        title: service.title,
        lead: service.summary,
        body: knownItems(service.body),
        primary: ctaToLink(ctx, cta, id('fejlec-cta'), 'primary'),
        secondary: service.headerLink
          ? { id: id('fejlec-link'), kind: 'secondary', text: service.headerLink.label, href: service.headerLink.href }
          : undefined,
      }),
      listSection(id('tartalom'), blocks.includes, service.includes),
      audiencesFeatures(id('kinek'), blocks.audiences, audiences, 'warm'),
      stepsFeatures(id('folyamat'), blocks.process, service.process ?? [], 'plain'),
      listSection(id('amit-kerunk'), blocks.requirements, service.requirements, 'warm'),
      price ? section<FkPriceData>(id('dij'), 'fk-price', { id: id('dij'), title: blocks.price, price }) : undefined,
      faqSection(id('gyik'), blocks.faq, service.faq, 'warm'),
      closingCta(ctx, id('cta'), {
        title: copy.servicePage.closing.title,
        text: copy.servicePage.closing.text,
        primary: ctaToLink(ctx, cta, id('cta-primary'), 'primary'),
      }),
      servicesSection(ctx, id('kapcsolodo'), related, {
        title: blocks.related,
        numbered: false,
        highlightFirst: false,
        tone: 'warm',
      }),
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
      stepsFeatures('konyvelovaltas-folyamat', c.steps.title, c.steps.items, 'plain'),
      listSection('konyvelovaltas-amit-kerunk', c.requirements.title, c.requirements.items, 'warm'),
      faqSection('konyvelovaltas-gyik', c.faq.title, c.faq.items),
      closingCta(ctx, 'konyvelovaltas-cta', {
        title: c.cta.title,
        text: c.cta.text,
        primary: ctaToLink(ctx, cta, 'konyvelovaltas-cta-primary', 'primary'),
      }),
    ]),
  )
}

/** About — complements the homepage: approach + how we work + roles. */
export function buildAboutPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.about
  return page(
    'rolunk',
    c.title,
    pageMeta(ctx, routes.about, pageTitle(ctx, c.meta.title), withContact(ctx, c.meta.description)),
    compact([
      header('rolunk-fejlec', { eyebrow: c.eyebrow, title: c.title, lead: c.lead }),
      knownItems(c.body).length > 0
        ? section<FkProseData>('rolunk-bemutatkozas', 'fk-prose', { id: 'rolunk-bemutatkozas', paragraphs: knownItems(c.body) })
        : undefined,
      stepsFeatures('rolunk-hogyan-dolgozunk', c.process.title, c.process.steps, 'plain'),
      teamSection(ctx, 'rolunk-csapat', {
        title: c.teamTitle,
        intro: withLead(ctx, c.teamIntro),
        image: sectionPhoto(c.teamPhoto),
        tone: 'warm',
      }),
      generalQuoteCta(ctx, 'rolunk-cta'),
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
    pathToPageSlug(path),
    article.title,
    pageMeta(
      ctx,
      path,
      article.seo.title ?? fillTemplate(ctx.content.settings.seo.pageTitleTemplate, { page: article.title, company: ctx.content.company.name }),
      article.seo.description,
    ),
    compact([
      header(`${article.slug}-fejlec`, { eyebrow: ctx.content.copy.knowledge.title, title: article.title, lead: article.summary }),
      section<FkProseData>(`${article.slug}-szoveg`, 'fk-prose', { id: `${article.slug}-szoveg`, paragraphs: knownItems(article.body) }),
      generalQuoteCta(ctx, `${article.slug}-cta`),
    ]),
  )
}

export function buildContactPage(ctx: BuildContext): Page {
  const c = ctx.content.copy.contact
  const contact = ctx.contact
  return page(
    'kapcsolat',
    c.title,
    pageMeta(ctx, routes.contact, pageTitle(ctx, c.meta.title), withContact(ctx, c.meta.description)),
    compact([
      header('kapcsolat-fejlec', { eyebrow: c.eyebrow, title: c.title, lead: withContact(ctx, c.lead) }),
      section<FkContactData>('kapcsolat-adatok', 'fk-contact', {
        id: 'kapcsolat-adatok',
        title: c.detailsTitle,
        companyName: contact.companyName,
        address: contact.address,
        directions: contact.directionsHref ? { href: contact.directionsHref, label: c.directions } : undefined,
        // The enquiry channels are the contact person's — shown once, on their card.
        phone: sameLink(contact.phone, contact.primaryContact.phone) ? undefined : contact.phone,
        email: sameLink(contact.email, contact.primaryContact.email) ? undefined : contact.email,
        hoursTitle: ctx.content.copy.footer.hoursTitle,
        hoursNote: ctx.content.copy.footer.appointmentNote,
        hours: contact.hours,
        primaryContact: {
          label: c.primaryContactLabel,
          name: contact.primaryContact.name,
          role: contact.primaryContact.role,
          description: contact.primaryContact.description,
          phone: contact.primaryContact.phone,
          email: contact.primaryContact.email,
        },
        lead: { label: c.leadLabel, name: contact.lead.name, role: contact.lead.role, description: contact.lead.description },
      }),
      // The contact details are shown right above — no duplicate panel here.
      quoteSection(ctx, QUOTE_ANCHOR, ctx.content.copy.home.quote.title, ctx.content.copy.home.quote.intro, { panel: false, tone: 'warm' }),
    ]),
  )
}

function sameLink(a: ContactLink | undefined, b: ContactLink | undefined): boolean {
  return a !== undefined && a.href === b?.href
}

/** Token values for the legal pages — every value comes from the single company source. */
function legalValues(ctx: BuildContext): Record<string, string> {
  const { company } = ctx.content
  return {
    company: company.name,
    legalName: company.legalName,
    // The privacy notice must always name a controller: the brand stands in until the legal name is known.
    controller: known(company.legalName) ?? company.name,
    // A partial address is not a legal entry: keep it as a placeholder (hidden).
    address: isCompleteAddress(company.address) ? formatAddress(company.address) : '[SZÉKHELY]',
    phone: company.phone,
    email: company.email,
  }
}

/** Fills tokens and drops every line that still holds a placeholder; empty chapters disappear. */
function legalChapters(chapters: readonly LegalChapterInput[], values: Record<string, string>): FkLegalChapter[] {
  const fill = (text: string) => fillTemplate(text, values)
  const fields = (rows: readonly { label: string; value: string }[] | undefined) =>
    (rows ?? []).map((f) => ({ label: f.label, value: fill(f.value) })).filter((f) => known(f.value) !== undefined)
  return chapters
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      paragraphs: knownItems(chapter.paragraphs?.map(fill)),
      items: knownItems(chapter.items?.map(fill)),
      fields: fields(chapter.fields),
      groups: (chapter.groups ?? [])
        .map((group) => ({ title: group.title, fields: fields(group.fields) }))
        .filter((group) => group.fields.length > 0),
    }))
    // Keep chapters with real content; a lone intro line ending in ':' (its list gone) does not count.
    .filter((c) => c.items.length + c.fields.length + c.groups.length > 0 || c.paragraphs.some((p) => !p.trim().endsWith(':')))
}

function legalPage(
  ctx: BuildContext,
  slug: string,
  path: string,
  c: {
    meta: { title: string; description: string }
    eyebrow: string
    title: string
    lead: string
    pending: string
    updated?: string
    tocTitle?: string
    chapters: readonly LegalChapterInput[]
  },
): Page {
  const values = legalValues(ctx)
  const chapters = legalChapters(c.chapters, values)
  return page(
    slug,
    c.title,
    pageMeta(ctx, path, pageTitle(ctx, c.meta.title), fillTemplate(c.meta.description, values)),
    compact([
      header(`${slug}-fejlec`, { eyebrow: c.eyebrow, title: c.title, lead: chapters.length > 0 ? c.lead : c.pending }),
      chapters.length > 0
        ? section<FkLegalData>(`${slug}-szoveg`, 'fk-legal', {
            id: `${slug}-szoveg`,
            updated: c.updated,
            tocTitle: c.tocTitle,
            chapters,
          })
        : undefined,
    ]),
  )
}

export function buildPrivacyPage(ctx: BuildContext): Page {
  return legalPage(ctx, 'adatvedelem', routes.privacy, ctx.content.copy.privacy)
}

export function buildImprintPage(ctx: BuildContext): Page {
  return legalPage(ctx, 'impresszum', routes.imprint, ctx.content.copy.imprint)
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
        primary: { id: 'nem-talalhato-home', kind: 'secondary', text: c.cta, href: routes.home },
      }),
    ],
  )
}
