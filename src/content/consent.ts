import type { ConsentConfig } from '@spektra/types'
import type { OptionalConsentCategory } from '@spektra/data'
import { company } from './company'

/**
 * Consent configuration — every storage use and third-party service of the
 * site, disclosed. Only categories with a service here are ever asked. The
 * map (external media) is asked in the bottom banner; after "Elfogadom" it
 * appears everywhere without another click. Until then the map area shows a
 * placeholder with the address (and a one-off "show map" button).
 *
 * Bump `version` whenever a service or purpose changes: stored decisions
 * are then discarded and asked again. Keep the privacy notice ("Sütik és
 * külső szolgáltatások", copy.privacy) in sync.
 */
export const consentConfig: ConsentConfig = {
  version: '2026-10-21',
  maxAgeDays: 365,
  services: [
    {
      id: 'consent-record',
      category: 'necessary',
      name: 'Süti-döntés',
      provider: company.name,
      purpose: 'Az Ön süti-beállításainak megjegyzése',
      storage: ['spektra-consent (localStorage)'],
    },
    {
      id: 'google-maps',
      category: 'external-media',
      name: 'Google Maps',
      provider: 'Google Ireland Ltd.',
      purpose: 'Az iroda helyének megjelenítése térképen',
      privacyUrl: 'https://policies.google.com/privacy',
    },
  ],
}

/** Consent wording (banner / settings dialog / map placeholder / footer link). */
export const consentCopy = {
  footerLink: 'Süti-beállítások',
  // Platform ConsentBanner label overrides.
  banner: {
    title: 'Sütik és adatvédelem',
    text: 'A weboldal működéséhez szükséges tárolást mindig használjuk. Az iroda helyét mutató Google térképet csak az Ön hozzájárulásával töltjük be. Döntését bármikor módosíthatja a lap alján, a Süti-beállításokban.',
    acceptAll: 'Elfogadom',
    rejectAll: 'Csak a szükségesek',
    settings: 'Beállítások',
  },
  categories: {
    'external-media': {
      label: 'Külső tartalmak',
      description: 'Beágyazott térkép. Betöltéskor a szolgáltató megkapja az Ön IP-címét, és sütiket helyezhet el.',
    },
    analytics: {
      label: 'Statisztika',
      description: 'Névtelen látogatottsági adatok a weboldal fejlesztéséhez.',
    },
    marketing: {
      label: 'Marketing',
      description: 'Hirdetések mérése és személyre szabása.',
    },
  } satisfies Record<OptionalConsentCategory, { label: string; description: string }>,
  map: {
    title: 'Térkép',
    description:
      'A térkép a sütik elfogadása után jelenik meg. A térképet a Google Maps jeleníti meg; betöltéskor a Google megkapja az Ön IP-címét, és sütiket helyezhet el.',
    action: 'Térkép megjelenítése',
    directions: 'Útvonaltervezés a Google Maps-ben',
  },
}
