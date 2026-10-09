import type { LinkCta } from '../shared/types'

/** Page header with the page H1 (subpages; the homepage H1 is the hero). */
export interface FkPageHeaderData {
  id: string
  eyebrow?: string
  title: string
  lead?: string
  body?: string[]
  primary?: LinkCta
  secondary?: LinkCta
}
