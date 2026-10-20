/**
 * Farkas Klára content model.
 *
 * Client-side authoring model. It is NOT rendered directly: src/data/*
 * builders turn it into platform SiteData (pages[] → sections[]), which is
 * what @spektra/runtime renders. Unknown facts are written as explicit
 * placeholders in square brackets, e.g. '[TELEFONSZÁM]' (see isPlaceholder).
 */

/** Explicit placeholder for an unknown fact, e.g. '[ÁR]'. */
export type Placeholder = `[${string}]`

// ── CTA ──────────────────────────────────────────────────────────────

export type CtaIntent = 'quote' | 'call' | 'email' | 'consult'

export interface Cta {
  label: string
  intent: CtaIntent
  /** Service slug preselected in the quote form (intent quote/consult). */
  prefillService?: string
}

// ── Price ────────────────────────────────────────────────────────────

export type PriceUnit = 'hó' | 'fő/hó' | 'alkalom' | 'óra'
export type PriceAmount = number | Placeholder

interface PriceBase {
  vatNote?: string
  note?: string
}

export type Price =
  | (PriceBase & { type: 'fixed'; amount: PriceAmount; unit?: PriceUnit })
  | (PriceBase & { type: 'from'; amount: PriceAmount; unit?: PriceUnit })
  | (PriceBase & { type: 'range'; amount: PriceAmount; amountMax: PriceAmount; unit?: PriceUnit })
  | (PriceBase & { type: 'perUnit'; amount: PriceAmount; unit: PriceUnit })
  | (PriceBase & { type: 'onRequest' })

// ── Audience ─────────────────────────────────────────────────────────

/** Configuration-gated audience segments (settings.segments). */
export type SegmentKey = 'complex'

export interface Audience {
  /** ASCII slug — also the future /kinek/<id> route (module disabled). */
  id: string
  label: string
  description: string
  /** Icon key for the features card (see src/sections/shared/icons.tsx). */
  icon?: string
  enabled: boolean
  /** When set, the audience is visible only if settings.segments[segment].enabled. */
  segment?: SegmentKey
}

// ── Shared blocks ────────────────────────────────────────────────────

export interface Step {
  title: string
  description: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface SeoContent {
  /** Overrides the generated title (settings.seo.serviceTitleTemplate). */
  title?: string
  description: string
}

// ── Service ──────────────────────────────────────────────────────────

export interface Service {
  /** ASCII, lowercase, hyphenated — route: /szolgaltatasok/<slug> */
  slug: string
  title: string
  /** Icon key for the service card (see src/sections/shared/icons.tsx). */
  icon?: string
  /** Card + page header text (1–2 sentences). */
  summary: string
  /** Optional longer introduction paragraphs on the service page. */
  body?: string[]
  includes?: string[]
  /** Audience ids (see content/audiences.ts). */
  audiences?: string[]
  process?: Step[]
  requirements?: string[]
  price?: Price
  faq?: FaqItem[]
  /** Contextual closing CTA. Defaults to a quote CTA prefilled with this service. */
  cta?: Cta
  /** Optional secondary link in the page header, e.g. to /konyvelovaltas. */
  headerLink?: { label: string; href: string }
  /** Related service slugs. */
  related?: string[]
  /** Related article slugs. */
  relatedArticles?: string[]
  seo: SeoContent
  order: number
  visible: boolean
}

// ── Person / company ─────────────────────────────────────────────────

export interface Person {
  /** ASCII id, used for stable data-ui-id values. */
  id: string
  /** May be a placeholder ('[MUNKATÁRS NEVE]') — then the name is not shown. */
  name: string
  role: string
  /** Image URL. When absent, a monogram is rendered (only for known names). */
  photo?: string
  /** Short description of the person's actual responsibility (cards). */
  bio?: string
  /** Longer introduction paragraphs — used for the professional lead's block. */
  intro?: string[]
  credentials?: string[]
  phone?: string
  email?: string
  /** Professional lead of the office — shown with emphasis. At most one. */
  isLead?: boolean
  /** Receives general enquiries and quote requests. Exactly one. */
  isPrimaryContact: boolean
}

export interface OpeningHours {
  days: string
  hours: string
}

export interface Address {
  postalCode: string
  city: string
  street: string
}

/** Single source of truth for client-wide contact data. */
export interface Company {
  name: string
  legalName: string
  city: string
  address: Address
  phone: string
  email: string
  openingHours: OpeningHours[]
  /** Public site URL (canonical links). */
  url?: string
}

// ── Articles (Tudástár) ──────────────────────────────────────────────

export interface Article {
  slug: string
  title: string
  summary: string
  body: string[]
  seo: SeoContent
  visible: boolean
}

// ── Settings ─────────────────────────────────────────────────────────

export interface Settings {
  /** Global price visibility. false → no price UI anywhere. */
  showPrices: boolean
  segments: Record<SegmentKey, { enabled: boolean }>
  /** Prepared but disabled modules. Enabling them is not implemented yet. */
  modules: {
    audiencePages: boolean // /kinek/<audience>
    pricingPage: boolean // /dijak
  }
  quote: {
    /** Query parameter that preselects a service: ?szolgaltatas=<slug> */
    prefillParam: string
  }
  seo: {
    /** Tokens: {service}, {city}, {company} */
    serviceTitleTemplate: string
    /** Tokens: {page}, {company} */
    pageTitleTemplate: string
  }
}

// ── Legal pages ──────────────────────────────────────────────────────

/** One chapter of a legal page. Strings may hold {tokens} and [PLACEHOLDERS]. */
export interface LegalChapterInput {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
  fields?: { label: string; value: string }[]
  groups?: { title: string; fields: { label: string; value: string }[] }[]
}
