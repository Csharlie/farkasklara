import type { ContactLink } from '../shared/types'

export interface FkTeamMember {
  id: string
  name: string
  role: string
  /** Image URL; when absent a monogram is rendered. */
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
  members: FkTeamMember[]
  primaryBadge: string
  tone?: 'plain' | 'warm'
}
