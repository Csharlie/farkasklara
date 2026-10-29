import type { Audience } from './types'

/**
 * Primary client groups. Order = display order; `enabled: false` hides one.
 * Six groups fill two full rows of three on the homepage.
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
    id: 'kft',
    icon: 'building',
    label: 'Kft.-k',
    description:
      'Éves beszámoló, társasági adó és a tagokat érintő kifizetések, például az osztalék rendezése, egy kézben.',
    enabled: true,
  },
  {
    id: 'alapitvanyok',
    icon: 'heart',
    label: 'Alapítványok',
    description:
      'Könyvelés és éves beszámoló a nonprofit szervezetekre vonatkozó szabályok szerint, közhasznú alapítványoknál a közhasznúsági melléklettel együtt.',
    enabled: true,
  },
  {
    id: 'tarsashazak',
    icon: 'home',
    label: 'Társasházak',
    description:
      'Könyvelés és éves beszámoló a közös képviselővel együttműködve, hogy a közgyűlés elé rendezett számok kerüljenek.',
    enabled: true,
  },
  {
    // Sixth group: completes the second row of three (client list had five).
    id: 'egyesuletek',
    icon: 'handshake',
    label: 'Egyesületek',
    description:
      'Könyvelés és éves beszámoló, a tagdíjak és a támogatások átlátható nyilvántartásával.',
    enabled: true,
  },
]
