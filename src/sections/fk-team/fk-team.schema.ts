import type { ContactLink, LinkCta } from '../shared/types'

export interface FkTeamMember {
  id: string
  /** Absent while the name is not known — the role is shown instead. */
  name?: string
  role: string
  /** Image URL; when absent a monogram is rendered for known names. */
  photo?: string
  bio?: string
  credentials?: string[]
  phone?: ContactLink
  email?: ContactLink
  isPrimaryContact: boolean
}

export interface FkTeamData {
  id: string
  title: string
  intro?: string
  /** Professional lead — the larger, emphasized block with introduction paragraphs. */
  lead?: FkTeamMember & { badge: string; paragraphs: string[] }
  /** Other team members — smaller, compact blocks. */
  members: FkTeamMember[]
  more?: LinkCta
  /** Office photo filling the right half of the viewport beside the heading (stacked on mobile). */
  image?: {
    src: string
    /** Responsive candidates, e.g. '/images/iroda-800.jpg 800w, /images/iroda.jpg 1375w'. */
    srcSet?: string
    alt: string
    width: number
    height: number
    caption?: string
  }
  /** Followed directly by the facts strip — tighter bottom spacing. */
  joinedWithNext?: boolean
  tone?: 'plain' | 'warm'
}
