import type { FaqItem, LegalChapterInput, Step } from './types'

/**
 * Page copy — wording only. Structure (which sections, in which order) lives
 * in src/data/build-pages.ts; contact data and roles live in company.ts.
 * Tokens in {braces} are filled by the builders. Placeholder values in
 * [BRACKETS] are never rendered.
 */

export type FactInput =
  | { value: string; label: string }
  /** Derived from content data — always verifiable, never invented. */
  | { source: 'teamSize' | 'certifiedCount' | 'serviceCount' | 'audienceCount' | 'city'; label: string }

/** Photo shown beside a section heading (fk-team split layout); paths are app paths ('/images/…'). */
export type SectionPhoto = { src: string; srcSet?: string; alt: string; width: number; height: number; caption: string }

export const copy = {
  nav: {
    home: 'Főoldal',
    services: 'Szolgáltatások',
    switch: 'Könyvelőváltás',
    about: 'Rólunk',
    knowledge: 'Tudástár',
    contact: 'Kapcsolat',
    privacy: 'Adatvédelem',
    imprint: 'Impresszum',
    quote: 'Ajánlatkérés',
  },

  home: {
    meta: {
      title: 'Könyvelő Kecskemét | {company}',
      description:
        'Könyvelőiroda Kecskeméten: könyvelés, adótanácsadás, adóbevallás és bérszámfejtés vállalkozóknak és cégeknek. Határidő előtt szólunk. Kérjen ajánlatot!',
    },
    hero: {
      eyebrow: 'Könyvelőiroda Kecskeméten',
      // '\n' = line break; titleHighlight is rendered in gold.
      title: 'Könyvelés, amire építhet.\nMegbízhatóság a számok mögött.',
      // Part of the title rendered in gold.
      titleHighlight: 'Megbízhatóság a számok mögött.' as string | undefined,
      description:
        'Könyvelés, adótanácsadás és bérszámfejtés egyéni vállalkozásoknak és cégeknek. Személyre szabott szakmai támogatás a mindennapi működéshez.',
      primaryCta: 'Ajánlatot kérek',
      secondaryCta: 'Szolgáltatások',
      // Office / documents / desk imagery, no faces (public/images/hero.jpg).
      image: '/images/hero.jpg' as string | undefined,
      imageAlt: 'Napfényes irodai íróasztal táblázatos dokumentumokkal, számológéppel, laptoppal és jegyzetfüzettel',
    },
    services: {
      title: 'Szolgáltatások',
      intro: 'Válassza ki a területet; a részleteket a szolgáltatás oldalán találja.',
    },
    audiences: { title: 'Kinek dolgozunk' },
    about: {
      title: 'Rólunk',
      intro:
        'A Farkas Klára Könyvelőiroda Kecskeméten dolgozik egyéni vállalkozóknak, kis- és középvállalkozásoknak, kft.-knek, alapítványoknak, társasházaknak és egyesületeknek. Könyveléssel, adózással, bérszámfejtéssel, végelszámolással és pályázatok előkészítésével foglalkozunk, egy irodában, egy szakmai vezetés alatt.',
      more: 'Bővebben az irodáról',
      // Storefront photo beside the "Rólunk" heading (public/images/iroda*.jpg).
      photo: {
        src: '/images/iroda-bejarat.jpg',
        srcSet: '/images/iroda-bejarat-800.jpg 800w, /images/iroda-bejarat.jpg 1024w',
        alt: 'A Farkas Klára Könyvelőiroda bejárata: világoszöld portál „Könyvelőiroda” felirattal, mérleges logóval. A bal kirakaton a szolgáltatások – könyvelés, bérszámfejtés, visszamenőleg is, adótanácsadás –, a jobbon Farkas Klára Judit tulajdonos, ügyvezető és az ügyfélkapcsolat, Posszert Ervin telefonszáma',
        width: 1024,
        height: 680,
        caption: 'Irodánk bejárata',
      } as SectionPhoto | undefined,
    },
    // Four-item strip directly below the About section. Only verifiable,
    // data-derived facts. Replace with verified business metrics when known
    // (e.g. { value: '2010', label: 'óta dolgozunk' }).
    facts: {
      label: 'Az iroda röviden',
      items: [
        { source: 'certifiedCount', label: 'mérlegképes könyvelő a csapatban' },
        { source: 'serviceCount', label: 'szolgáltatási terület egy irodában' },
        { source: 'audienceCount', label: 'ügyfélkör a vállalkozásoktól a társasházakig' },
        { source: 'city', label: 'helyi iroda' },
      ] satisfies FactInput[] as FactInput[],
    },
    quote: {
      title: 'Ajánlatkérés',
      intro: 'Írja meg, miben segíthetünk, és felvesszük Önnel a kapcsolatot.',
    },
  },

  servicesIndex: {
    meta: {
      title: 'Könyvelési szolgáltatások | {company}',
      description:
        'Könyvelés, adótanácsadás, adóbevallás, bérszámfejtés, végelszámolás és pályázat-előkészítés Kecskeméten. Nézze meg, mit tartalmaz a munka, és kérjen ajánlatot.',
    },
    eyebrow: 'Szolgáltatások',
    title: 'Mivel foglalkozunk',
    lead: 'Válassza ki a területet. Minden szolgáltatás oldalán megtalálja, mit tartalmaz a munka, és mit kérünk Öntől.',
    listTitle: 'Hat terület, egy kapcsolattartó',
  },

  serviceCard: {
    link: 'Részletek',
  },

  servicePage: {
    eyebrow: 'Szolgáltatás · {city}',
    blocks: {
      includes: 'Mit tartalmaz',
      audiences: 'Kinek szól',
      process: 'Hogyan zajlik',
      requirements: 'Mit kérünk Öntől',
      price: 'Díj',
      faq: 'Gyakori kérdések',
      related: 'Kapcsolódó szolgáltatások',
      relatedArticles: 'Kapcsolódó cikkek',
    },
    closing: {
      title: 'Kérjen ajánlatot',
      text: 'Írja meg, mire van szüksége. A szolgáltatást előre kiválasztottuk az űrlapon.',
    },
  },

  switch: {
    meta: {
      title: 'Könyvelőváltás Kecskeméten | {company}',
      description:
        'Könyvelőt váltana Kecskeméten? Az iratok átvételét mi egyeztetjük az előző könyvelővel. Az átállás menete, a szükséges iratok és a gyakori kérdések.',
    },
    eyebrow: 'Könyvelőváltás',
    title: 'Könyvelőt váltana?',
    lead: 'Az iratok átvételét mi egyeztetjük az előző könyvelővel. Önnek a szerződés felmondása és a meghatalmazás marad.',
    steps: {
      title: 'Hogyan zajlik a váltás',
      items: [
        { title: 'Egyeztetés', description: 'Átbeszéljük a vállalkozást és a váltás időpontját.' },
        { title: 'Iratlista', description: 'Összeállítjuk, milyen iratokat kell átadnia az előző könyvelőnek.' },
        { title: 'Átvétel', description: 'Átvesszük az iratokat, és ellenőrizzük a nyitó adatokat.' },
        { title: 'Jelzés', description: 'Ha rendezetlen tételt találunk, megírjuk, mi a teendő.' },
      ] satisfies Step[],
    },
    requirements: {
      title: 'Mit kérünk Öntől',
      items: [
        'Az előző könyvelővel kötött szerződés felmondása',
        'Meghatalmazás az iratok átvételére',
        'Az utolsó lezárt év beszámolója vagy bevallása',
      ],
    },
    faq: {
      title: 'Gyakori kérdések',
      items: [
        {
          question: 'Év közben is lehet könyvelőt váltani?',
          answer:
            'Igen. Az átállás időpontját az előző könyvelővel kötött szerződés felmondási ideje is befolyásolja; ezt az első egyeztetésen átnézzük.',
        },
        {
          question: 'Mit kell nekem intéznem az előző könyvelővel?',
          answer: 'A szerződés felmondását. Az átadandó iratok listáját mi állítjuk össze.',
        },
      ] satisfies FaqItem[],
    },
    cta: {
      title: 'Beszéljük meg a váltást',
      text: 'Írja meg, mikor váltana, és egyeztetjük a következő lépést.',
      label: 'Egyeztetést kérek a váltásról',
      prefillService: 'konyveles',
    },
  },

  about: {
    meta: {
      title: 'Rólunk – könyvelők Kecskeméten | {company}',
      description:
        'Kecskeméti könyvelőiroda Farkas Klára tulajdonos-ügyvezető vezetésével, mérlegképes könyvelőkkel. Ügyintézőnk, {primaryContact} fogadja a megkereséseket.',
    },
    eyebrow: 'Rólunk',
    title: 'Stabil háttér a vállalkozása mögött',
    lead: 'Nem csupán adminisztrálunk: folyamatosan figyeljük vállalkozása számait, és időben jelezzük, ha egy határidő, jogszabályváltozás vagy pénzügyi kockázat teendőt jelent Önnek vagy vállalkozásának.',
    body: ['[BEMUTATKOZÁS: az iroda története és munkamódja]'],
    process: {
      title: 'Hogyan dolgozunk',
      steps: [
        {
          title: 'Első beszélgetés',
          description: 'Átbeszéljük, milyen vállalkozása van, és mit vár a könyvelőjétől.',
        },
        {
          title: 'Ajánlat',
          description: 'Megkapja, mit vállalunk, és mi kell hozzá Öntől.',
        },
        {
          title: 'Átvétel',
          description: 'Átvesszük az iratokat, és megbeszéljük, hogyan küldi a bizonylatokat.',
        },
        {
          title: 'Folyamatos munka',
          description: 'Könyvelünk, és határidő előtt jelzünk, ha teendője van.',
        },
      ] satisfies Step[],
    },
    teamTitle: 'Irodánk és munkatársaink',
    // Office interior beside the team heading (public/images/iroda-belso*.jpg); undefined → no photo.
    teamPhoto: {
      src: '/images/iroda-belso.jpg',
      srcSet: '/images/iroda-belso-800.jpg 800w, /images/iroda-belso.jpg 1365w',
      alt: 'A Farkas Klára Könyvelőiroda belső tere: két munkaállomás monitorokkal, iratrendezők, a falon keretezett oklevelek és tanúsítványok',
      width: 1365,
      height: 768,
      caption: 'Irodánk belülről',
    } as SectionPhoto | undefined,
    // Second office photo at the bottom of the team block, mirrored (left half);
    // public/images/iroda-galeria*.jpg. undefined → no photo.
    teamClosingPhoto: {
      src: '/images/iroda-galeria.jpg',
      srcSet: '/images/iroda-galeria-800.jpg 800w, /images/iroda-galeria.jpg 1365w',
      alt: 'A Farkas Klára Könyvelőiroda munkaterei: monitoros munkaállomások, a galéria alatti sarokban asztali lámpás íróasztal, festmények a falon és fa lépcső',
      width: 1365,
      height: 768,
      caption: 'Munkatereink',
    } as SectionPhoto | undefined,
    teamIntro: 'Az irodát {lead} tulajdonos-ügyvezető vezeti, munkatársai mérlegképes könyvelők.',
  },

  knowledge: {
    meta: {
      title: 'Tudástár | {company}',
      description: 'Rövid, gyakorlati írások adózásról és könyvelésről vállalkozóknak.',
    },
    eyebrow: 'Tudástár',
    title: 'Tudástár',
    lead: 'Rövid, gyakorlati írások adózásról és könyvelésről.',
    listTitle: 'Cikkek',
    empty: 'Jelenleg nincs megjelent cikk.',
  },

  contact: {
    meta: {
      title: 'Kapcsolat és ajánlatkérés | {company}',
      description:
        'Hívja ügyintézőnket, {primaryContact} kollégánkat ({phone}), vagy kérjen ajánlatot online. Iroda: {address}.',
    },
    eyebrow: 'Kapcsolat',
    title: 'Kapcsolat',
    lead: 'Keressen minket telefonon vagy e-mailben, illetve kérjen ajánlatot az alábbi űrlapon. Személyes találkozóra előre egyeztetett időpontban várjuk.',
    detailsTitle: 'Elérhetőségek',
    directions: 'Útvonaltervezés',
    mapTitle: 'Az iroda helye a térképen',
    primaryContactLabel: 'Kapcsolattartó',
    leadLabel: 'Az iroda vezetője',
  },

  /**
   * Legal pages. Tokens: {controller} (legal name, or the brand while unknown),
   * {legalName}, {company}, {address}, {email}, {phone}. Any line still holding
   * a [PLACEHOLDER] is omitted — fill the facts before go-live and have the
   * text reviewed by a lawyer / data-protection adviser.
   */
  privacy: {
    meta: {
      title: 'Adatkezelési tájékoztató | {company}',
      description:
        'Hogyan kezeli a {company} a weboldalon, telefonon és e-mailben megadott személyes adatokat, és milyen jogai vannak Önnek.',
    },
    eyebrow: 'Jogi információk',
    title: 'Adatkezelési tájékoztató',
    lead: 'Közérthetően leírjuk, milyen személyes adatokat kezelünk, milyen célból és mennyi ideig, és hogyan gyakorolhatja a jogait.',
    // Shown only while no chapter has known content.
    pending: 'Az adatkezelési tájékoztató szövege előkészítés alatt áll.',
    updated: 'Hatályos: 2026. október 21-től',
    tocTitle: 'Tartalom',
    chapters: [
      {
        id: 'adatkezelo',
        title: 'Az adatkezelő',
        paragraphs: ['A weboldal és az azon keresztül történő adatkezelés felelőse (a továbbiakban: Adatkezelő):'],
        fields: [
          { label: 'Név', value: '{controller}' },
          { label: 'Székhely', value: '{address}' },
          { label: 'Cégjegyzékszám / nyilvántartási szám', value: '[CÉGJEGYZÉKSZÁM]' },
          { label: 'Adószám', value: '[ADÓSZÁM]' },
          { label: 'E-mail', value: '{email}' },
          { label: 'Telefon', value: '{phone}' },
        ],
      },
      {
        id: 'jogszabalyok',
        title: 'Jogszabályi háttér',
        paragraphs: ['Adatkezelésünk során különösen az alábbi jogszabályok szerint járunk el:'],
        items: [
          'az Európai Parlament és a Tanács (EU) 2016/679 rendelete (általános adatvédelmi rendelet, GDPR);',
          'az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Infotv.);',
          'az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény (Eker. tv.);',
          'a számvitelről szóló 2000. évi C. törvény (Szt.), az ügyfélkapcsolat során keletkező bizonylatok tekintetében.',
        ],
      },
      {
        id: 'adatkezelesek',
        title: 'Milyen adatokat, milyen célból kezelünk',
        paragraphs: [
          'Csak azokat az adatokat kezeljük, amelyekre a megkeresés megválaszolásához vagy a jogszabályi kötelezettségeink teljesítéséhez szükség van. Az adatokat nem használjuk hírlevélküldésre vagy profilalkotásra, és nem adjuk át harmadik félnek értékesítési céllal.',
        ],
        groups: [
          {
            title: 'Ajánlatkérés az online űrlapon',
            fields: [
              { label: 'Kezelt adatok', value: 'név, e-mail-cím és/vagy telefonszám, a választott szolgáltatás, az üzenet szövege' },
              { label: 'Cél', value: 'az ajánlatkérés megválaszolása, kapcsolatfelvétel, ajánlat készítése' },
              { label: 'Jogalap', value: 'a szerződés megkötését megelőzően, az Ön kérésére tett lépések – GDPR 6. cikk (1) bekezdés b) pont' },
              { label: 'Megőrzés', value: 'ha nem jön létre megbízás, a megkeresés lezárását követő 1 évig; megbízás esetén a szerződéses adatkezelés szabályai szerint' },
            ],
          },
          {
            title: 'Megkeresés telefonon vagy e-mailben',
            fields: [
              { label: 'Kezelt adatok', value: 'név, telefonszám, e-mail-cím, valamint a megkeresésben Ön által megadott információk' },
              { label: 'Cél', value: 'kérdések megválaszolása, időpont-egyeztetés, ajánlatadás' },
              { label: 'Jogalap', value: 'a szerződés megkötését megelőző lépések – GDPR 6. cikk (1) bekezdés b) pont; egyéb megkeresésnél az Adatkezelő válaszadáshoz fűződő jogos érdeke – GDPR 6. cikk (1) bekezdés f) pont' },
              { label: 'Megőrzés', value: 'a megkeresés lezárását követő 1 évig' },
            ],
          },
          {
            title: 'Ügyfelek adatai megbízás esetén',
            fields: [
              { label: 'Kezelt adatok', value: 'a megbízási szerződésben és a könyvelési szolgáltatás teljesítéséhez átadott adatok' },
              { label: 'Cél', value: 'a megbízási szerződés teljesítése, valamint számviteli, adózási és pénzmosás elleni kötelezettségek teljesítése' },
              { label: 'Jogalap', value: 'szerződés teljesítése – GDPR 6. cikk (1) bekezdés b) pont; jogi kötelezettség – GDPR 6. cikk (1) bekezdés c) pont' },
              { label: 'Megőrzés', value: 'a vonatkozó jogszabályokban előírt ideig (számviteli bizonylatoknál az Szt. 169. §-a szerint legalább 8 évig)' },
            ],
          },
          {
            title: 'A weboldal technikai naplói',
            fields: [
              { label: 'Kezelt adatok', value: 'IP-cím, a látogatás időpontja, a megtekintett oldal címe, a böngésző és az operációs rendszer típusa' },
              { label: 'Cél', value: 'a weboldal biztonságos és zavartalan működtetése, hibák és visszaélések felderítése' },
              { label: 'Jogalap', value: 'az Adatkezelő jogos érdeke – GDPR 6. cikk (1) bekezdés f) pont' },
              { label: 'Megőrzés', value: 'a tárhelyszolgáltató naplózási beállításai szerint, legfeljebb 30 napig' },
            ],
          },
        ],
      },
      {
        id: 'sutik',
        title: 'Sütik és külső szolgáltatások',
        paragraphs: [
          'A weboldal nem használ analitikai, reklám- vagy közösségimédia-sütiket, és nem követi a látogatók viselkedését. Az első látogatáskor a lap alján megjelenő sávban dönthet arról, hogy hozzájárul-e a külső tartalmak (térkép) betöltéséhez.',
        ],
        items: [
          'Süti-döntés (szükséges): a süti-beállításait böngészője helyi tárolójában („spektra-consent”) legfeljebb 12 hónapig megjegyezzük, hogy ne kelljen újra kérdeznünk. Ez a weboldal működéséhez szükséges, ezért hozzájárulást nem igényel; személyes adatot nem tartalmaz.',
          'Google Maps térkép – külső tartalom (Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Írország): csak akkor töltődik be, ha Ön a süti-sávban az „Elfogadom” gombra, vagy a térkép helyén a „Térkép megjelenítése” gombra kattint. Ekkor a Google megkapja az Ön IP-címét, és saját sütiket helyezhet el, amelyekre a Google adatvédelmi tájékoztatója vonatkozik (policies.google.com/privacy). Jogalap: az Ön hozzájárulása – GDPR 6. cikk (1) bekezdés a) pont. Hozzájárulás nélkül a Google-hoz a térkép miatt semmilyen adat nem jut.',
          'Google Fonts betűtípusok (Google Ireland Ltd.): az oldal betűtípusainak megjelenítésére; betöltésükkor a Google megkapja az Ön IP-címét. Sütit nem helyeznek el.',
          'Hozzájárulását bármikor, indoklás nélkül visszavonhatja a lap alján található „Süti-beállítások” linken; a visszavonás a korábbi adatkezelés jogszerűségét nem érinti. A Google által már elhelyezett sütiket böngészője beállításaiban törölheti.',
        ],
      },
      {
        id: 'cimzettek',
        title: 'Kik férhetnek hozzá az adatokhoz',
        paragraphs: [
          'Az adatokhoz kizárólag az Adatkezelő munkatársai férnek hozzá, abban a körben, amelyre a feladatuk ellátásához szükségük van; munkatársainkat titoktartási kötelezettség terheli. Az adatkezelés technikai hátterét az alábbi adatfeldolgozók biztosítják:',
        ],
        items: [
          'Tárhelyszolgáltató: [TÁRHELYSZOLGÁLTATÓ NEVE ÉS CÍME]',
          'E-mail-szolgáltató: [E-MAIL-SZOLGÁLTATÓ NEVE ÉS CÍME]',
          'Google Ireland Ltd. – térkép és betűtípusok (lásd: Sütik és külső szolgáltatások)',
        ],
      },
      {
        id: 'harmadik-orszag',
        title: 'Adattovábbítás az Európai Unión kívülre',
        paragraphs: [
          'A Google szolgáltatásainál nem zárható ki, hogy adatok az Amerikai Egyesült Államokba kerülnek. A Google LLC részt vesz az EU–USA adatvédelmi keretrendszerben (EU–U.S. Data Privacy Framework), amely az Európai Bizottság megfelelőségi határozata alapján biztosítja a megfelelő védelmi szintet. Ezen kívül harmadik országba nem továbbítunk adatot.',
        ],
      },
      {
        id: 'biztonsag',
        title: 'Adatbiztonság',
        paragraphs: [
          'Megfelelő technikai és szervezési intézkedésekkel védjük az adatokat a jogosulatlan hozzáférés, megváltoztatás, továbbítás, nyilvánosságra hozatal, törlés vagy megsemmisülés ellen. A weboldal titkosított (HTTPS) kapcsolaton érhető el, az adatokhoz csak jelszóval védett rendszerekben, jogosultsággal rendelkező munkatársaink férnek hozzá. Könyvelőirodaként az ügyféladatok bizalmas kezelése szakmai kötelezettségünk is.',
        ],
      },
      {
        id: 'jogok',
        title: 'Az Ön jogai',
        paragraphs: ['Az adatkezeléssel kapcsolatban Önt az alábbi jogok illetik meg:'],
        items: [
          'Hozzáférés: tájékoztatást kérhet arról, hogy kezelünk-e Önről adatot, és ha igen, melyeket (GDPR 15. cikk).',
          'Helyesbítés: kérheti a pontatlan adatok javítását, a hiányosak kiegészítését (GDPR 16. cikk).',
          'Törlés: kérheti adatai törlését, ha az adatkezelésnek nincs további jogalapja (GDPR 17. cikk).',
          'Korlátozás: kérheti az adatkezelés korlátozását, például ha vitatja az adatok pontosságát (GDPR 18. cikk).',
          'Adathordozhatóság: kérheti, hogy az Ön által megadott adatokat tagolt, géppel olvasható formában kiadjuk (GDPR 20. cikk).',
          'Tiltakozás: a jogos érdeken alapuló adatkezelés ellen tiltakozhat (GDPR 21. cikk).',
        ],
      },
      {
        id: 'joggyakorlas',
        title: 'Hogyan gyakorolhatja a jogait',
        paragraphs: [
          'Kérelmét e-mailben ({email}), telefonon ({phone}) vagy a székhelyünkre ({address}) küldött levélben juttathatja el hozzánk. Indokolatlan késedelem nélkül, legfeljebb egy hónapon belül válaszolunk; ez a határidő indokolt esetben további két hónappal meghosszabbítható, amiről tájékoztatjuk. A tájékoztatás és az intézkedés díjmentes.',
        ],
      },
      {
        id: 'jogorvoslat',
        title: 'Jogorvoslat',
        paragraphs: [
          'Ha úgy érzi, hogy személyes adatai kezelése nem felel meg a jogszabályoknak, kérjük, először keressen meg minket – igyekszünk a kérdést gyorsan rendezni. Emellett jogosult panaszt tenni a felügyeleti hatóságnál, vagy bírósághoz fordulni; a per – választása szerint – a lakóhelye vagy tartózkodási helye szerint illetékes törvényszék előtt is megindítható.',
        ],
        fields: [
          { label: 'Felügyeleti hatóság', value: 'Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)' },
          { label: 'Cím', value: '1055 Budapest, Falk Miksa utca 9–11.' },
          { label: 'Postacím', value: '1363 Budapest, Pf. 9.' },
          { label: 'Telefon', value: '+36 1 391 1400' },
          { label: 'E-mail', value: 'ugyfelszolgalat@naih.hu' },
          { label: 'Weboldal', value: 'www.naih.hu' },
        ],
      },
      {
        id: 'modositas',
        title: 'A tájékoztató módosítása',
        paragraphs: [
          'Jelen tájékoztatót a jogszabályi változásoknak vagy az adatkezelés módosulásának megfelelően frissítjük. A mindenkor hatályos változat ezen az oldalon érhető el.',
        ],
      },
    ] satisfies LegalChapterInput[] as LegalChapterInput[],
  },

  imprint: {
    meta: {
      title: 'Impresszum | {company}',
      description: 'A {company} weboldalának üzemeltetői adatai: cégadatok, nyilvántartási számok, elérhetőség és tárhelyszolgáltató.',
    },
    eyebrow: 'Jogi információk',
    title: 'Impresszum',
    lead: 'A weboldal üzemeltetőjének adatai az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény 4. §-a alapján.',
    // Shown only while no chapter has known content.
    pending: 'Az üzemeltető adatai előkészítés alatt állnak.',
    chapters: [
      {
        id: 'uzemelteto',
        title: 'Üzemeltető',
        fields: [
          { label: 'Cégnév', value: '{legalName}' },
          { label: 'Márkanév', value: '{company}' },
          { label: 'Székhely', value: '{address}' },
          { label: 'Képviselő', value: '[KÉPVISELŐ NEVE ÉS TISZTSÉGE]' },
          { label: 'Telefon', value: '{phone}' },
          { label: 'E-mail', value: '{email}' },
        ],
      },
      {
        id: 'nyilvantartas',
        title: 'Nyilvántartási adatok',
        fields: [
          { label: 'Cégjegyzékszám / nyilvántartási szám', value: '[CÉGJEGYZÉKSZÁM]' },
          { label: 'Nyilvántartó hatóság', value: '[NYILVÁNTARTÓ CÉGBÍRÓSÁG / HATÓSÁG]' },
          { label: 'Adószám', value: '[ADÓSZÁM]' },
          { label: 'Könyvviteli szolgáltatás nyilvántartási száma', value: '[NYILVÁNTARTÁSI SZÁM]' },
          { label: 'Adótanácsadói nyilvántartási szám', value: '[ADÓTANÁCSADÓI NYILVÁNTARTÁSI SZÁM]' },
        ],
      },
      {
        id: 'tarhely',
        title: 'Tárhelyszolgáltató',
        fields: [
          { label: 'Név', value: '[TÁRHELYSZOLGÁLTATÓ]' },
          { label: 'Cím', value: '[TÁRHELYSZOLGÁLTATÓ CÍME]' },
          { label: 'E-mail', value: '[TÁRHELYSZOLGÁLTATÓ E-MAIL]' },
        ],
      },
      {
        id: 'panaszkezeles',
        title: 'Panaszkezelés',
        paragraphs: [
          'Szolgáltatásunkkal kapcsolatos panaszát telefonon ({phone}), e-mailben ({email}) vagy személyesen, előzetes időpont-egyeztetéssel a székhelyünkön teheti meg. Fogyasztónak minősülő ügyfeleink panaszuk elutasítása esetén a lakóhelyük szerint illetékes békéltető testülethez is fordulhatnak.',
        ],
      },
      {
        id: 'szerzoi-jog',
        title: 'Szerzői jogok',
        paragraphs: [
          'A weboldal szövegei, arculati elemei és szerkezete szerzői jogi védelem alatt állnak. Tartalmuk az üzemeltető előzetes írásbeli engedélye nélkül nem másolható és nem terjeszthető; a forrás megjelölésével történő rövid idézés megengedett.',
          'A weboldalon közölt szakmai tartalmak általános tájékoztatásul szolgálnak, és nem helyettesítik az egyedi tanácsadást.',
        ],
      },
    ] satisfies LegalChapterInput[] as LegalChapterInput[],
  },

  notFound: {
    meta: { title: 'Az oldal nem található | {company}', description: 'Az oldal nem található.' },
    title: 'Az oldal nem található',
    lead: 'A keresett cím nem létezik vagy megváltozott.',
    cta: 'Vissza a főoldalra',
  },

  quoteForm: {
    name: 'Név',
    email: 'E-mail-cím',
    phone: 'Telefonszám',
    contactHint: 'Elég az egyiket megadnia: e-mail-cím vagy telefonszám.',
    services: 'Melyik szolgáltatás érdekli?',
    servicePlaceholder: 'Válasszon szolgáltatást',
    message: 'Üzenet (nem kötelező)',
    consentBefore: 'Megismertem az ',
    consentLink: 'adatkezelési tájékoztatót',
    consentAfter: '.',
    submit: 'Ajánlatkérés elküldése',
    sending: 'Küldés…',
    errors: {
      name: 'Adja meg a nevét.',
      contact: 'Adjon meg e-mail-címet vagy telefonszámot.',
      email: 'Az e-mail-cím formátuma nem megfelelő (például: nev@example.hu).',
      services: 'Válassza ki, melyik szolgáltatás érdekli.',
      consent: 'A küldéshez jelölje be, hogy megismerte az adatkezelési tájékoztatót.',
      general: 'Az üzenetet nem sikerült elküldeni. Próbálja újra később.',
      rateLimited: 'Túl sok próbálkozás. Próbálja újra néhány perc múlva.',
    },
    success: {
      title: 'Köszönjük, megkaptuk.',
      message: '{primaryContact} hamarosan felveszi Önnel a kapcsolatot.',
      reset: 'Új ajánlatkérés',
    },
  },

  quotePanel: {
    title: 'Elérhetőségeink',
    contact: 'Kapcsolattartó',
    address: 'Iroda',
    phone: 'Telefon',
    email: 'E-mail',
    hours: 'Ügyfélfogadás',
    directions: 'Útvonaltervezés',
    notes: {
      phone: 'Időpont-egyeztetés és gyors kérdések',
      email: 'Írásos kérdésekhez és ajánlatkéréshez',
      hours: 'Kizárólag előzetes időpont-egyeztetéssel',
    },
  },

  footer: {
    contactTitle: 'Elérhetőség',
    hoursTitle: 'Ügyfélfogadás',
    // Shown under the reception hours everywhere (footer, contact page).
    appointmentNote: 'Előzetes időpont-egyeztetéssel',
    servicesTitle: 'Szolgáltatások',
    pagesTitle: 'Oldalak',
    rights: 'Minden jog fenntartva.',
    legalNavLabel: 'Jogi információk',
    // Site credit — bottom bar, deliberately understated.
    credit: { name: 'PSPro', href: 'https://pspro.hu/' },
  },

  team: {
    leadBadge: 'Szakmai vezető',
  },
}

export type Copy = typeof copy
