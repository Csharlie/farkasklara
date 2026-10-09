import type { Audience } from './types'

/** Order = display order. Visibility: enabled && (segment ? settings.segments[segment].enabled : true). */
export const audiences: Audience[] = [
  {
    id: 'egyeni-vallalkozok',
    label: 'Egyéni vállalkozók',
    description:
      'Átalányadó vagy vállalkozói szja: kiszámoljuk, melyik a kedvezőbb Önnek, és beadjuk a bevallásokat.',
    enabled: true,
  },
  {
    id: 'kkv',
    label: 'Kis- és középvállalkozások',
    description:
      'Kft. és bt. könyvelése, bérszámfejtése és éves beszámolója egy helyen, egy kapcsolattartóval.',
    enabled: true,
  },
  {
    id: 'konyvelovaltas',
    label: 'Könyvelőt váltana',
    description:
      'Átvesszük az iratokat az előző könyvelőtől, és megnézzük, mi maradt rendezetlenül.',
    enabled: true,
  },
  {
    id: 'osszetett',
    label: 'Összetettebb vállalkozások',
    description: '[LEÍRÁS: milyen összetettebb vállalkozásokat vállal az iroda]',
    enabled: true,
    segment: 'complex',
  },
]
