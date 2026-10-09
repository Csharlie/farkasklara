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
  /** Professional lead — rendered as the larger, emphasized block. */
  lead?: FkTeamMember & { badge: string }
  /** Verified facts shown with the lead (placeholders already removed). */
  facts?: { value: string; label: string }[]
  /** Other team members — smaller blocks. */
  members: FkTeamMember[]
  primaryBadge: string
  more?: LinkCta
  tone?: 'plain' | 'warm'
}
