import type { Company, Person } from './types'

/**
 * Single source of truth for client-wide contact data.
 * Used by: header, footer, contact page, contact-person card, CTAs,
 * quote form, map. Replace the [PLACEHOLDER] values; do not copy them
 * elsewhere. Placeholder values are never rendered — the related UI element
 * stays hidden until a real value is set (see src/data/text.ts).
 */
export const company: Company = {
  name: 'Farkas Klára Könyvelőiroda',
  legalName: '[CÉGNÉV]',
  city: 'Kecskemét',
  address: {
    postalCode: '6000',
    city: 'Kecskemét',
    street: 'Berzsenyi utca 19.',
  },
  phone: '[TELEFONSZÁM]',
  email: '[E-MAIL]',
  openingHours: [{ days: '[NAPOK]', hours: '[NYITVATARTÁS]' }],
  // url: '[WEBCÍM]' — set the public URL to enable canonical links.
}

/**
 * Team and roles.
 * - isLead: the professional lead (exactly one, emphasized).
 * - isPrimaryContact: receives general enquiries and quote requests
 *   (exactly one; validated in src/data/contact.ts).
 */
export const people: Person[] = [
  {
    id: 'farkas-klara',
    name: 'Farkas Klára',
    role: 'Szakmai vezető',
    // FIKTÍV — élesítés előtt valós adatra cserélendő.
    credentials: ['Mérlegképes könyvelő (vállalkozási)', 'Okleveles adótanácsadó'],
    // FIKTÍV — élesítés előtt valós adatra cserélendő.
    bio: 'Az iroda szakmai vezetője. Több mint 15 éve könyvel kis- és középvállalkozásoknak; ő felel a könyvelés, az adózás és a tanácsadás szakmai irányáért.',
    isLead: true,
    isPrimaryContact: false,
  },
  {
    id: 'ugyintezo',
    name: 'Posszert Ervin',
    role: 'Ügyintéző, kapcsolattartó',
    bio: 'Hozzá futnak be az általános kérdések és az ajánlatkérések, és ő egyezteti a következő lépést.',
    isPrimaryContact: true,
  },
  {
    // FIKTÍV — név, képesítés és leírás élesítés előtt valós adatra cserélendő.
    id: 'konyvelo',
    name: 'Halász Réka',
    role: 'Könyvelő',
    credentials: ['Mérlegképes könyvelő'],
    bio: 'Egyéni vállalkozók és kisebb cégek havi könyvelését és bevallásait viszi, a szakmai vezető irányításával.',
    isPrimaryContact: false,
  },
]
