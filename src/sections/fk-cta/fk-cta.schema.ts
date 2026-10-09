import type { LinkCta } from '../shared/types'

/** Closing CTA band on the configurable dark surface. */
export interface FkCtaData {
  id: string
  title: string
  text?: string
  primary: LinkCta
  secondary?: LinkCta
}
