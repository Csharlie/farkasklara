import type { Service } from './types'

/**
 * Services. Adding a service = adding an object here; the route
 * /szolgaltatasok/<slug>, the homepage card, the quote-form option, the
 * footer link and the SEO metadata are generated from it.
 *
 * Every block on the service page is optional: leave a field out (or empty)
 * and the block is not rendered.
 */
export const services: Service[] = [
  {
    slug: 'konyveles',
    icon: 'book',
    title: 'Könyvelés',
    summary: 'Bizonylatok feldolgozása, főkönyvi könyvelés, áfa-nyilvántartás és havi zárás.',
    body: [
      'A könyvelés nálunk nem áll meg a rögzítésnél. Ha egy tétel szokatlan, vagy egy határidő közeledik, a zárás előtt szólunk.',
    ],
    includes: [
      'Bejövő és kimenő számlák, bankkivonatok feldolgozása',
      'Főkönyvi könyvelés és áfa-analitika',
      'Áfabevallás a vállalkozás bevallási gyakorisága szerint',
      'Éves beszámolók elkészítése',
      'Kapcsolattartás a NAV-val és az önkormányzatokkal az Ön meghatalmazása alapján',
    ],
    audiences: ['egyeni-vallalkozok', 'kkv', 'kft', 'alapitvanyok', 'tarsashazak', 'egyesuletek'],
    process: [
      {
        title: 'Bizonylatok',
        description: 'Az egyeztetett határnapig elküldi a bizonylatokat.',
      },
      {
        title: 'Feldolgozás',
        description: 'Lekönyveljük a tételeket, és egyeztetjük a bankszámlával.',
      },
      {
        title: 'Bevallások',
        description: 'Elkészítjük és beküldjük a havi vagy negyedéves bevallásokat.',
      },
      {
        title: 'Jelzés',
        description: 'Ha valami eltér a megszokottól, a zárás előtt felhívjuk.',
      },
    ],
    requirements: [
      'Cégkivonat vagy egyéni vállalkozói nyilvántartási szám',
      'Bankkivonatok',
      'Kimenő és bejövő számlák',
      'Az előző év beszámolója vagy bevallása, ha volt',
    ],
    price: { type: 'from', amount: '[ÁR]', unit: 'hó' },
    faq: [
      {
        question: 'Válthatok könyvelőt év közben?',
        answer:
          'Igen. Az átállás menetét és a szükséges iratokat a Könyvelőváltás oldalon foglaltuk össze.',
      },
    ],
    cta: { label: 'Ajánlatot kérek könyvelésre', intent: 'quote', prefillService: 'konyveles' },
    headerLink: { label: 'Könyvelőt váltana?', href: '/konyvelovaltas' },
    related: ['adobevallas', 'berszamfejtes'],
    seo: {
      description:
        'Könyvelés egyéni vállalkozóknak és kis cégeknek Kecskeméten: bizonylatfeldolgozás, áfa, havi zárás, éves beszámoló.',
    },
    order: 1,
    visible: true,
  },
  {
    slug: 'adotanacsadas',
    icon: 'lightbulb',
    title: 'Adótanácsadás',
    summary: 'Adózási forma, nagyobb kiadások, kifizetések: előre kiszámoljuk, mennyi adóval jár egy döntés.',
    includes: [
      'Adózási formák összehasonlítása',
      'Beruházások, nagyobb kiadások adóhatásának kiszámítása',
      'Munkabér, osztalék, tagi kölcsön: melyik mivel jár',
      'Felkészülés esetleges NAV-ellenőrzésre',
    ],
    audiences: ['egyeni-vallalkozok', 'kkv', 'kft'],
    process: [
      { title: 'Kérdés', description: 'Leírja, milyen döntés előtt áll.' },
      { title: 'Számítás', description: 'A vállalkozás adataiból kiszámoljuk a lehetőségeket.' },
      { title: 'Összefoglaló', description: 'Írásban megkapja a változatokat és a különbségeket.' },
    ],
    requirements: [
      'A döntés rövid leírása',
      'Az utolsó lezárt év adatai vagy bevallása',
    ],
    price: { type: 'perUnit', amount: '[ÁR]', unit: 'óra' },
    cta: { label: 'Tanácsadást kérek', intent: 'consult', prefillService: 'adotanacsadas' },
    related: ['konyveles', 'adobevallas'],
    seo: {
      description:
        'Adótanácsadás Kecskeméten: adózási forma választása, beruházások és kifizetések adóhatása, felkészülés NAV-ellenőrzésre.',
    },
    order: 2,
    visible: true,
  },
  {
    slug: 'adobevallas',
    icon: 'fileCheck',
    title: 'Adóbevallás',
    summary: 'Szja-, társaságiadó-, iparűzésiadó- és áfabevallás elkészítése és beküldése.',
    includes: [
      'Személyi jövedelemadó-bevallás',
      'Társasági adó és iparűzési adó bevallása',
      'Áfabevallás és összesítő nyilatkozatok',
      'Elektronikus beküldés az Ön meghatalmazásával',
    ],
    audiences: ['egyeni-vallalkozok', 'kkv', 'kft'],
    process: [
      { title: 'Adatok', description: 'Összegyűjtjük az adóév bevételeit és kiadásait.' },
      { title: 'Elkészítés', description: 'Elkészítjük a bevallást.' },
      { title: 'Egyeztetés', description: 'Beküldés előtt átnézzük Önnel a fizetendő összeget.' },
      { title: 'Beküldés', description: 'Beküldjük, és elküldjük Önnek az igazolást.' },
    ],
    requirements: [
      'Az adóév bevételeinek és kiadásainak bizonylatai',
      'Meghatalmazás az elektronikus beküldéshez',
    ],
    price: { type: 'from', amount: '[ÁR]', unit: 'alkalom' },
    cta: { label: 'Ajánlatot kérek bevallásra', intent: 'quote', prefillService: 'adobevallas' },
    related: ['konyveles', 'adotanacsadas'],
    seo: {
      description:
        'Adóbevallás Kecskeméten: szja, társasági adó, iparűzési adó és áfa bevallásának elkészítése és beküldése.',
    },
    order: 3,
    visible: true,
  },
  {
    slug: 'berszamfejtes',
    icon: 'users',
    title: 'Bérszámfejtés',
    summary: 'Havi bérszámfejtés, járulékbevallás, munkavállalók be- és kijelentése.',
    includes: [
      'Havi bérjegyzék és utalási lista',
      'Havi járulékbevallás',
      'Munkavállalók be- és kijelentése',
      'Egyszerűsített foglalkoztatás (alkalmi és idénymunka) bejelentése',
      'Kilépéskor kiadandó igazolások',
      'Éves igazolások a munkavállalóknak',
    ],
    audiences: ['kkv', 'kft'],
    process: [
      {
        title: 'Jelenléti adatok',
        description: 'Az egyeztetett határnapig elküldi a jelenléti és távolléti adatokat.',
      },
      { title: 'Számfejtés', description: 'Kiszámoljuk a béreket és a járulékokat.' },
      { title: 'Utalási lista', description: 'Megkapja a bérjegyzékeket és az utalandó összegeket.' },
      { title: 'Bevallás', description: 'Beküldjük a járulékbevallást.' },
    ],
    requirements: [
      'Munkaszerződések',
      'Jelenléti ív, szabadság- és betegszabadság-nyilvántartás',
      'Munkavállalói adatlapok: adóazonosító jel, TAJ-szám, bankszámlaszám',
    ],
    price: { type: 'perUnit', amount: '[ÁR]', unit: 'fő/hó' },
    cta: { label: 'Ajánlatot kérek bérszámfejtésre', intent: 'quote', prefillService: 'berszamfejtes' },
    related: ['konyveles'],
    seo: {
      description:
        'Bérszámfejtés Kecskeméten: havi bérjegyzék, járulékbevallás, munkavállalók be- és kijelentése, egyszerűsített foglalkoztatás bejelentése, éves igazolások.',
    },
    order: 4,
    visible: true,
  },
  {
    slug: 'vegelszamolas',
    icon: 'archive',
    title: 'Végelszámolás',
    summary: 'Cég megszüntetése végelszámolással, a kezdő beszámolótól a záró beszámolóig.',
    body: [
      'A végelszámolás határidőkhöz kötött eljárás. Az elején ütemtervet készítünk, hogy lássa, mikor mi következik.',
    ],
    audiences: ['kkv', 'kft'],
    process: [
      { title: 'Döntés', description: 'Átnézzük a cég helyzetét és a nyitott tételeket.' },
      { title: 'Kezdő beszámoló', description: 'Elkészítjük a végelszámolást kezdő beszámolót.' },
      { title: 'Lezárás', description: 'Rendezzük a követeléseket és a tartozásokat.' },
      { title: 'Záró beszámoló', description: 'Elkészítjük a záró beszámolót és a vagyonfelosztási javaslatot.' },
    ],
    requirements: [
      'A legutolsó elfogadott beszámoló',
      'A tagok határozata a végelszámolásról',
      'Szerződések és nyitott tételek listája',
    ],
    price: { type: 'onRequest', note: 'A díj a cég méretétől és a nyitott tételektől függ.' },
    faq: [
      {
        question: 'Mennyi ideig tart egy végelszámolás?',
        answer: 'A nyitott tételek számától függ. Az ütemtervet az első egyeztetés után megkapja.',
      },
    ],
    cta: { label: 'Egyeztetést kérek végelszámolásról', intent: 'quote', prefillService: 'vegelszamolas' },
    related: ['konyveles', 'adotanacsadas'],
    seo: {
      description:
        'Végelszámolás Kecskeméten: kezdő és záró beszámoló, hitelezői igények, adóhatósági bejelentések, ütemterv.',
    },
    order: 5,
    visible: true,
  },
  {
    slug: 'palyazatok',
    icon: 'target',
    title: 'Pályázat-előkészítés',
    summary: 'Megnézzük, megfelel-e a vállalkozás a pályázati kiírás feltételeinek.',
    includes: [
      'A jogosultsági feltételek ellenőrzése a vállalkozás pénzügyi adatai alapján',
    ],
    audiences: ['egyeni-vallalkozok', 'kkv', 'kft'],
    audiencesLast: true,
    process: [
      { title: 'Kiírás', description: 'Elküldi a kiírást és a tervezett fejlesztés leírását.' },
      { title: 'Ellenőrzés', description: 'A pénzügyi adatok alapján átnézzük a feltételeket.' },
      { title: 'Visszajelzés', description: 'Megtudja, mely feltételek teljesülnek, és hol van hiány.' },
    ],
    requirements: [
      'A tervezett fejlesztés leírása',
      'A lezárt üzleti évek beszámolói',
    ],
    price: { type: 'onRequest' },
    cta: { label: 'Egyeztetést kérek pályázatról', intent: 'consult', prefillService: 'palyazatok' },
    related: ['konyveles', 'adotanacsadas'],
    seo: {
      description:
        'Pályázat-előkészítés Kecskeméten: a pályázati jogosultság ellenőrzése a vállalkozás pénzügyi adatai alapján.',
    },
    order: 6,
    visible: true,
  },
]
