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
    // Firm-focused introduction — no unverified biography, qualifications or
    // years of experience. Add verified credentials to `credentials` later.
    intro: [
      'Farkas Klára az iroda szakmai vezetője. Ő felel azért, hogy a könyvelés, a bevallások és az adózási tanácsadás szakmailag rendben legyen, és hogy minden ügyben megszülessen a szükséges szakmai döntés.',
      'A könyvelést és az adózási feladatokat felelősségnek tekintjük, nem puszta adminisztrációnak. Egy havi zárás vagy egy bevallás mögött a vállalkozás döntései állnak, ezért a számok mellett azt is nézzük, mit jelentenek az Ön számára.',
      'Ügyfeleinkkel érthetően beszélünk: szakkifejezések helyett azt mondjuk el, mi a teendő, mikorra és miért. Figyelünk a határidőkre és azokra a változásokra, amelyek a vállalkozását érintik.',
      'Célunk, hogy a vállalkozása mögött rendezett, kiszámítható könyvelési háttér álljon, amelyre döntéskor támaszkodhat.',
    ],
    isLead: true,
    isPrimaryContact: false,
  },
  {
    id: 'ugyintezo',
    name: 'Posszert Ervin',
    role: 'Ügyintéző, kapcsolattartó',
    bio: 'Fogadja az érdeklődéseket és az ajánlatkéréseket, egyezteti az időpontokat, és összefogja az ügyfelekkel folytatott kommunikációt és az ügyintézést.',
    isPrimaryContact: true,
  },
  {
    // Name as provided for the project; no qualification is stated until verified.
    id: 'konyvelo',
    name: 'Halász Réka',
    role: 'Könyvelő',
    bio: 'Az ügyfelek könyvelési feladatain dolgozik: a bizonylatok feldolgozásán, a havi zárásokon és a bevallások előkészítésén, a szakmai vezető irányításával.',
    isPrimaryContact: false,
  },
]
