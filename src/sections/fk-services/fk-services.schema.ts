import type { FormattedPrice } from '../shared/types'

export interface FkServiceCard {
  slug: string
  /** Display number, e.g. '01'. */
  number: string
  title: string
  summary: string
  /** Canonical service route, e.g. /szolgaltatasok/konyveles */
  href: string
  /** Icon key (iconCards variant). */
  icon?: string
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
  /**
   * Homepage variant: uniform white cards, large corner icon (bc-services
   * pattern), whole card clickable, dark color scheme on hover.
   */
  iconCards?: boolean
  /** Label of the explicit link to the service page, e.g. 'Részletek'. */
  linkLabel: string
  tone?: 'plain' | 'warm'
}
