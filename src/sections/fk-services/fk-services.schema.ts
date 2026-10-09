import type { FormattedPrice } from '../shared/types'

export interface FkServiceCard {
  slug: string
  /** Display number, e.g. '01'. */
  number: string
  title: string
  summary: string
  /** Canonical service route, e.g. /szolgaltatasok/konyveles */
  href: string
  /** Short, structured preview shown in the expandable panel (optional). */
  highlights?: string[]
  /** Present only when settings.showPrices is true (see data/price.ts). */
  price?: FormattedPrice
}

export interface FkServicesData {
  id: string
  title: string
  intro?: string
  items: FkServiceCard[]
  /** Numbered cards (homepage / index) vs. plain list (related services). */
  numbered: boolean
  /** Visually highlight the first card. */
  highlightFirst: boolean
  /** Label of the in-place expand control, e.g. 'Mit tartalmaz?' */
  detailsLabel: string
  /** Label of the always-visible link to the full service page. */
  linkLabel: string
  tone?: 'plain' | 'warm'
}
