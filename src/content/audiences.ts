import type { Audience } from './types'

/**
 * Primary client groups. Order = display order.
 * Visibility: enabled && (segment ? settings.segments[segment].enabled : true).
 * Switching accountants is not an audience — it has its own page (/konyvelovaltas).
 */
export const audiences: Audience[] = [
  {
    id: 'egyeni-vallalkozok',
    icon: 'user',
    label: 'Egyéni vállalkozók',
    description:
      'Kevesebb adminisztráció, kiszámítható határidők. A bevallásokat és a havi teendőket mi követjük, Ön előre tudja, mikor mi a dolga.',
    enabled: true,
  },
  {
    id: 'kkv',
    icon: 'users',
    label: 'Kis- és középvállalkozások',
    description:
      'Könyvelés, bérszámfejtés és beszámoló egy helyen. Döntések előtt szakmai háttér, hogy a cég működése rendben maradjon.',
    enabled: true,
  },
  {
    id: 'nagyobb-vallalatok',
    icon: 'building',
    label: 'Vállalatok',
    description:
      'Könyvelés, bérszámfejtés és adótanácsadás előzetes egyeztetés alapján, a cég működési rendjéhez igazítva.',
    enabled: true,
    segment: 'complex',
  },
]
