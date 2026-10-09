import type { FaqItem, Step } from './types'

/**
 * Page copy — wording only. Structure (which sections, in which order) lives
 * in src/data/build-pages.ts; contact data and roles live in company.ts.
 * Tokens in {braces} are filled by the builders. Placeholder values in
 * [BRACKETS] are never rendered.
 */

export type FactInput =
  | { value: string; label: string }
  /** Derived from content: team size (people.length) or company.city. */
  | { source: 'teamSize' | 'city'; label: string }

export const copy = {
  nav: {
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
      title: 'Könyvelőiroda Kecskemét | {company}',
      description:
        'Könyvelés, adótanácsadás, adóbevallás, bérszámfejtés, végelszámolás és pályázatok Kecskeméten. Határidő előtt szólunk, ha teendője van.',
    },
    hero: {
      eyebrow: 'Könyvelőiroda Kecskeméten',
      title: 'Rendben tartjuk a számait. Szólunk, mielőtt baj lenne.',
      description:
        'Könyvelés, adó és bér egyéni vállalkozóknak és cégeknek. Határidő előtt jelzünk, ha teendője van.',
      primaryCta: 'Ajánlatot kérek',
      secondaryCta: 'Szolgáltatások',
      // Office / documents / desk imagery, no faces (public/images/hero.jpg).
      image: '/images/hero.jpg' as string | undefined,
      imageAlt: 'Napfényes irodai íróasztal táblázatos dokumentumokkal, számológéppel, laptoppal és jegyzetfüzettel',
    },
    services: {
      title: 'Szolgáltatások',
      intro: 'Hat terület, egy kapcsolattartó. Nyissa le a kártyát a rövid összefoglalóért.',
    },
    audiences: { title: 'Kinek dolgozunk' },
    about: {
      title: 'Rólunk',
      intro:
        'Kecskeméti könyvelőiroda. A szakmai munkát {lead} irányítja, az érdeklődéseket és az ajánlatkéréseket az iroda ügyintézője fogadja.',
      // Facts shown with the professional lead. Placeholder values are hidden.
      facts: [
        { value: '[ÉV]', label: 'óta dolgozunk' },
        { value: '[ÜGYFELEK SZÁMA]', label: 'ügyfél' },
        { source: 'teamSize', label: 'fős csapat' },
        { source: 'city', label: 'irodánk helye' },
      ] satisfies FactInput[],
      more: 'Bővebben az irodáról',
    },
    quote: {
      title: 'Ajánlatkérés',
      intro: 'Írja meg, miben segíthetünk. Az ajánlatkéréseket az iroda ügyintézője fogadja.',
    },
  },

  servicesIndex: {
    meta: {
      title: 'Szolgáltatások | {company}',
      description:
        'Könyvelés, adótanácsadás, adóbevallás, bérszámfejtés, végelszámolás és pályázatok Kecskeméten.',
    },
    eyebrow: 'Szolgáltatások',
    title: 'Mivel foglalkozunk',
    lead: 'Válassza ki a területet. Minden szolgáltatás oldalán megtalálja, mit tartalmaz a munka, és mit kérünk Öntől.',
    listTitle: 'Hat terület, egy kapcsolattartó',
  },

  serviceCard: {
    details: 'Mit tartalmaz?',
    fullPage: 'Teljes leírás',
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
      text: 'Írja meg, mire van szüksége. A szolgáltatást előre kiválasztottuk az űrlapon; az ajánlatkérést az iroda ügyintézője fogadja.',
    },
  },

  switch: {
    meta: {
      title: 'Könyvelőváltás | {company}',
      description:
        'Könyvelőt váltana? Az átállás menete, a szükséges iratok és a gyakori kérdések egy helyen.',
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
      text: 'Írja meg, mikor váltana. Az ügyintéző egyezteti Önnel a következő lépést.',
      label: 'Egyeztetést kérek a váltásról',
      prefillService: 'konyveles',
    },
  },

  about: {
    meta: {
      title: 'Rólunk | {company}',
      description:
        'Kecskeméti könyvelőiroda: szakmai vezető, ügyintéző és könyvelő. Hogyan dolgozunk, és kihez fordulhat.',
    },
    eyebrow: 'Rólunk',
    title: 'Stabil háttér a vállalkozása mögött',
    lead: 'Nem csak adminisztrálunk. Figyeljük a számokat, és szólunk, mielőtt probléma lenne belőlük.',
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
    teamTitle: 'A csapat',
    teamIntro: 'A szakmai munkát {lead} irányítja. Az érdeklődéseket az iroda ügyintézője fogadja.',
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
      title: 'Kapcsolat | {company}',
      description: 'Ajánlatkérés és elérhetőségek: cím, telefon, e-mail és nyitvatartás. Kecskemét.',
    },
    eyebrow: 'Kapcsolat',
    title: 'Kapcsolat',
    lead: 'Az érdeklődéseket és az ajánlatkéréseket az iroda ügyintézője fogadja.',
    detailsTitle: 'Elérhetőségek',
    mapTitle: 'Az iroda helye a térképen',
    primaryContactLabel: 'Kapcsolattartó',
    leadLabel: 'Szakmai vezető',
  },

  privacy: {
    meta: { title: 'Adatvédelem | {company}', description: 'Adatkezelési tájékoztató.' },
    title: 'Adatkezelési tájékoztató',
    // Shown only while the legal text below is still a placeholder.
    pending: 'Az adatkezelési tájékoztató szövege előkészítés alatt áll.',
    body: ['[ADATKEZELÉSI TÁJÉKOZTATÓ SZÖVEGE: jogi szöveg szükséges]'],
  },

  imprint: {
    meta: { title: 'Impresszum | {company}', description: 'A weboldal üzemeltetőjének adatai.' },
    title: 'Impresszum',
    // Shown only while every field below is still a placeholder.
    pending: 'Az üzemeltető adatai előkészítés alatt állnak.',
    fields: [
      { label: 'Cégnév', value: '{legalName}' },
      { label: 'Székhely', value: '{address}' },
      { label: 'Cégjegyzékszám / nyilvántartási szám', value: '[CÉGJEGYZÉKSZÁM]' },
      { label: 'Adószám', value: '[ADÓSZÁM]' },
      { label: 'Könyvviteli szolgáltatás nyilvántartási száma', value: '[NYILVÁNTARTÁSI SZÁM]' },
      { label: 'Telefon', value: '{phone}' },
      { label: 'E-mail', value: '{email}' },
      { label: 'Tárhelyszolgáltató', value: '[TÁRHELYSZOLGÁLTATÓ]' },
    ],
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
    businessForm: 'Vállalkozási forma',
    businessFormPlaceholder: 'Válasszon',
    services: 'Melyik szolgáltatás érdekli?',
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
      businessForm: 'Válassza ki a vállalkozási formát.',
      services: 'Válasszon legalább egy szolgáltatást.',
      consent: 'A küldéshez jelölje be, hogy megismerte az adatkezelési tájékoztatót.',
      general: 'Az üzenetet nem sikerült elküldeni. Próbálja újra később.',
      rateLimited: 'Túl sok próbálkozás. Próbálja újra néhány perc múlva.',
    },
    success: {
      title: 'Köszönjük, megkaptuk.',
      message: 'Az ajánlatkérést az iroda ügyintézője kapja meg, és felveszi Önnel a kapcsolatot.',
      reset: 'Új ajánlatkérés',
    },
  },

  footer: {
    contactTitle: 'Elérhetőség',
    hoursTitle: 'Nyitvatartás',
    servicesTitle: 'Szolgáltatások',
    pagesTitle: 'Oldalak',
  },

  team: {
    primaryContactBadge: 'Kapcsolattartó',
    leadBadge: 'Szakmai vezető',
  },
}

export type Copy = typeof copy
