import type { ContactLink } from '../shared/types'

interface PersonBlock {
  label: string
  /** Absent while the name is not known — the role is shown instead. */
  name?: string
  role: string
  description?: string
}

export interface FkContactData {
  id: string
  title: string
  companyName: string
  address: string
  phone?: ContactLink
  email?: ContactLink
  hoursTitle: string
  hours: { days: string; hours: string }[]
  primaryContact: PersonBlock & { phone?: ContactLink; email?: ContactLink }
  lead?: PersonBlock
}
