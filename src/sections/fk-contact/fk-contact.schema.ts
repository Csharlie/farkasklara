import type { ContactLink } from '../shared/types'

export interface FkContactData {
  id: string
  title: string
  companyName: string
  address: string
  phone: ContactLink
  email: ContactLink
  hoursTitle: string
  hours: { days: string; hours: string }[]
  primaryContact: {
    label: string
    name: string
    role: string
    phone: ContactLink
    email: ContactLink
  }
}
