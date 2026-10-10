import type { ContactLink } from '../shared/types'

export interface FkQuoteLabels {
  name: string
  email: string
  phone: string
  contactHint: string
  businessForm: string
  businessFormPlaceholder: string
  services: string
  message: string
  consentBefore: string
  consentLink: string
  consentAfter: string
  submit: string
  sending: string
  errors: {
    name: string
    contact: string
    email: string
    businessForm: string
    services: string
    consent: string
    general: string
    rateLimited: string
  }
}

export interface FkQuoteData {
  /** Section anchor — also the target of quote links (#ajanlatkeres). */
  id: string
  title: string
  intro?: string
  /** Logical FormHandler form id. */
  formId: string
  services: { value: string; label: string }[]
  businessForms: string[]
  /** Query parameter that preselects a service, e.g. 'szolgaltatas'. */
  prefillParam: string
  privacyHref: string
  labels: FkQuoteLabels
  success: { title: string; message: string; reset: string }
  /**
   * Compact contact panel next to the form (luxcover lc-contact layout
   * pattern). Omitted where a full contact section precedes the form.
   */
  panel?: {
    title: string
    labels: { address: string; phone: string; email: string }
    addressLines: string[]
    phone?: ContactLink
    email?: ContactLink
  }
  /** Receives the enquiry. name/phone/email are absent while unknown. */
  primaryContact: {
    label: string
    name?: string
    role: string
    phone?: ContactLink
    email?: ContactLink
  }
  tone?: 'plain' | 'warm'
}
