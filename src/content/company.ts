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
    street: 'Tatay András utca 10.',
  },
  // Every enquiry channel (header, footer, CTAs, contact page, impressum, quote
  // form) belongs to the primary contact, Posszert Ervin.
  phone: '+36 70 231 2517',
  // Role mailbox (handled by the primary contact) — must exist on the final
  // domain (farkasklara.hu) before go-live.
  email: 'iroda@farkasklara.hu',
  // Client reception hours — in-person visits by appointment only (copy.appointment).
  // FIKTÍV — élesítés előtt ellenőrizendő.
  openingHours: [
    { days: 'Hétfő–csütörtök', hours: '9:00–16:00' },
  ],
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
    role: 'Tulajdonos, ügyvezető',
    // Firm-focused introduction — no unverified biography or years of
    // experience. Qualifications go to `credentials` (provided 2026-10-21).
    intro: [
      'Farkas Klára az iroda tulajdonosa és ügyvezetője. Ő felel azért, hogy a könyvelés, a bevallások és az adózási tanácsadás szakmailag rendben legyen, és hogy minden ügyben megszülessen a szükséges szakmai döntés.',
      'A könyvelést és az adózási feladatokat felelősségnek tekintjük, nem puszta adminisztrációnak. Egy havi zárás vagy egy bevallás mögött a vállalkozás döntései állnak, ezért a számok mellett azt is nézzük, mit jelentenek az Ön számára.',
      'Ügyfeleinkkel érthetően beszélünk: szakkifejezések helyett azt mondjuk el, mi a teendő, mikorra és miért. Figyelünk a határidőkre és azokra a változásokra, amelyek a vállalkozását érintik.',
      'Célunk, hogy a vállalkozása mögött rendezett, kiszámítható könyvelési háttér álljon, amelyre döntéskor támaszkodhat.',
    ],
    // Short role summary — contact page card (the long `intro` is for the team block).
    bio: 'Az iroda tulajdonosa és ügyvezetője. Ő felel a könyvelés, a bevallások és az adózási tanácsadás szakmai minőségéért.',
    credentials: ['Mérlegképes könyvelő'],
    isLead: true,
    isPrimaryContact: false,
  },
  {
    id: 'ugyintezo',
    name: 'Posszert Ervin',
    role: 'Ügyintéző',
    bio: 'Hozzá futnak be az érdeklődések, az ajánlatkérések és az ügyfelek napi kérdései. Egyezteti az időpontokat, intézi az ügyek adminisztrációját, és gondoskodik róla, hogy minden kérdés gyorsan a megfelelő kollégához kerüljön.',
    credentials: ['Mérlegképes könyvelő'],
    isPrimaryContact: true,
  },
  {
    // Name as provided for the project; no qualification is stated until verified.
    id: 'konyvelo',
    name: 'Halász Réka',
    role: 'Könyvelő',
    credentials: ['Mérlegképes könyvelő'],
    bio: 'Az ügyfelek könyvelési feladatain dolgozik: a bizonylatok feldolgozásán, a havi zárásokon és a bevallások előkészítésén, az ügyvezető irányításával.',
    isPrimaryContact: false,
  },
]
