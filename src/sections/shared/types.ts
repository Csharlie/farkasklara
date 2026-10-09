import type { CtaKind } from '../../theme/layout'

export type { ContactLink } from '../../data/contact'
export type { FormattedPrice } from '../../data/price'

/** Serializable link-CTA descriptor used inside section data. */
export interface LinkCta {
  /** Stable data-ui-id (slug-based, data-ui standard §6). */
  id: string
  text: string
  href: string
  kind: CtaKind
  /** data-ui-action: navigate (default) | call | email */
  action?: 'navigate' | 'call' | 'email'
}
