import type { Company, Person } from './types'

/**
 * Single source of truth for client-wide contact data.
 * Used by: header, footer, contact page, primary-contact card, CTAs,
 * quote form. Replace the [PLACEHOLDER] values; do not copy them elsewhere.
 */
export const company: Company = {
  name: 'Farkas Klára Könyvelőiroda',
  legalName: '[CÉGNÉV]',
  city: 'Kecskemét',
  address: {
    postalCode: '[IRÁNYÍTÓSZÁM]',
    city: 'Kecskemét',
    street: '[UTCA, HÁZSZÁM]',
  },
  phone: '[TELEFONSZÁM]',
  email: '[E-MAIL]',
  openingHours: [{ days: '[NAPOK]', hours: '[NYITVATARTÁS]' }],
  // url: '[WEBCÍM]' — set the public URL to enable canonical links.
}

/**
 * Team. Exactly one person must have isPrimaryContact: true — every enquiry
 * is routed to that person (validated in src/data/contact.ts).
 */
export const people: Person[] = [
  {
    id: 'farkas-klara',
    name: 'Farkas Klára',
    role: 'Szakmai vezető',
    credentials: ['[KÉPESÍTÉS]'],
    bio: 'Minden megkeresést ő fogad, és ő dönti el, ki viszi tovább az ügyet.',
    isPrimaryContact: true,
  },
  {
    id: 'munkatars-1',
    name: '[MUNKATÁRS NEVE]',
    role: '[MUNKAKÖR]',
    isPrimaryContact: false,
  },
  {
    id: 'munkatars-2',
    name: '[MUNKATÁRS NEVE]',
    role: '[MUNKAKÖR]',
    isPrimaryContact: false,
  },
]
