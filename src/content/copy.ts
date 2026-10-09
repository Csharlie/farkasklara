import type { Step } from './types'

/**
 * Page copy — wording only. Structure (which sections, in which order) lives
 * in src/data/build-pages.ts; contact data lives in company.ts.
 */

export type TrustFactInput =
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
        'Könyvelés, adó és bér egyéni vállalkozóknak és kis cégeknek. Határidő előtt jelzünk, ha teendője van.',
      primaryCta: 'Ajánlatot kérek',
      secondaryCta: 'Szolgáltatások',
      // Office / documents / desk imagery, no faces. Set to an image URL
      // (e.g. '/images/hero.jpg' in public/) when the photo is chosen.
      image: undefined as string | undefined,
      imageAlt: '[HERO KÉP LEÍRÁSA]',
    },
    trust: [
      { value: '[ÉV]', label: 'óta dolgozunk' },
      { value: '[ÜGYFELEK SZÁMA]', label: 'ügyfél' },
      { source: 'teamSize', label: 'fős csapat' },
      { source: 'city', label: 'irodánk helye' },
    ] satisfies TrustFactInput[],
    services: {
      title: 'Szolgáltatások',
      intro: 'Hat terület. Mindegyiknél ugyanaz a kapcsolattartó.',
    },
    audiences: { title: 'Kinek dolgozunk' },
    process: {
      title: 'Hogyan dolgozunk',
      steps: [
        {
          title: 'Első beszélgetés',
          description: 'Átbeszéljük, milyen vállalkozása van, és mit vár a könyvelőjétől.',
        },
        {
          title: 'Ajánlat',
          description: 'Írásban megkapja, mit vállalunk, mennyiért, és mi kell hozzá Öntől.',
        },
        {
          title: 'Átvétel',
          description: 'Átvesszük az iratokat, és megbeszéljük, hogyan küldi a bizonylatokat.',
        },
        {
          title: 'Folyamatos munka',
          description: 'Havonta könyvelünk, és határidő előtt jelzünk, ha teendője van.',
        },
      ] satisfies Step[],
    },
    team: {
      title: 'Rólunk',
      intro:
        'Háromfős iroda Kecskeméten. Minden megkeresés egy emberhez fut be, így nem kell mindent kétszer elmondania.',
    },
    quote: {
      title: 'Ajánlatkérés',
      intro: 'Írja meg, miben segíthetünk. Az ajánlatot írásban küldjük.',
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
    lead: 'Válassza ki a területet. Minden oldalon megtalálja, mit tartalmaz a munka, és mit kérünk Öntől.',
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
      title: 'Kezdjük el',
      text: 'Írja meg, mire van szüksége. A szolgáltatást előre kiválasztottuk az űrlapon.',
    },
  },

  switch: {
    meta: {
      title: 'Könyvelőváltás | {company}',
      description:
        'Könyvelőt váltana? Átvesszük az iratokat az előző könyvelőtől, és megnézzük, mi maradt rendezetlenül.',
    },
    eyebrow: 'Könyvelőváltás',
    title: 'Könyvelőt váltana?',
    lead: 'A váltás nem az Ön dolga. Az iratok átvételét mi egyeztetjük az előző könyvelővel.',
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
    cta: {
      title: 'Beszéljük meg a váltást',
      text: 'Írja meg, mikor váltana. Az iratlistát elküldjük.',
      label: 'Könyvelőváltás egyeztetése',
      prefillService: 'konyveles',
    },
  },

  about: {
    meta: {
      title: 'Rólunk | {company}',
      description: 'Háromfős könyvelőiroda Kecskeméten. Minden megkeresés egy kapcsolattartóhoz fut be.',
    },
    eyebrow: 'Rólunk',
    title: 'Stabil háttér a vállalkozása mögött',
    lead: 'Nem csak adminisztrálunk. Figyeljük a számokat, és szólunk, mielőtt probléma lenne belőlük.',
    body: ['[BEMUTATKOZÁS: az iroda története és munkamódja]'],
    teamTitle: 'A csapat',
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
      description: 'Ajánlatkérés és elérhetőségek: telefon, e-mail, cím és nyitvatartás. Kecskemét.',
    },
    eyebrow: 'Kapcsolat',
    title: 'Kapcsolat',
    lead: 'Minden megkeresés egy kapcsolattartóhoz fut be.',
    detailsTitle: 'Elérhetőségek',
    primaryContactLabel: 'Kapcsolattartó',
  },

  privacy: {
    meta: { title: 'Adatvédelem | {company}', description: 'Adatkezelési tájékoztató.' },
    title: 'Adatkezelési tájékoztató',
    body: ['[ADATKEZELÉSI TÁJÉKOZTATÓ SZÖVEGE: jogi szöveg szükséges]'],
  },

  imprint: {
    meta: { title: 'Impresszum | {company}', description: 'A weboldal üzemeltetőjének adatai.' },
    title: 'Impresszum',
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
    contactHint: 'E-mail-címet vagy telefonszámot adjon meg.',
    businessForm: 'Vállalkozási forma',
    businessFormPlaceholder: 'Válasszon',
    services: 'Melyik szolgáltatás érdekli?',
    message: 'Üzenet (nem kötelező)',
    consentBefore: 'Elolvastam az ',
    consentLink: 'adatkezelési tájékoztatót',
    consentAfter: ', és hozzájárulok az adataim kezeléséhez.',
    submit: 'Ajánlatkérés elküldése',
    sending: 'Küldés…',
    errors: {
      name: 'Adja meg a nevét.',
      contact: 'Adjon meg e-mail-címet vagy telefonszámot.',
      email: 'Az e-mail-cím formátuma nem megfelelő.',
      businessForm: 'Válassza ki a vállalkozási formát.',
      services: 'Válasszon legalább egy szolgáltatást.',
      consent: 'A küldéshez fogadja el az adatkezelési tájékoztatót.',
      general: 'Az üzenetet nem sikerült elküldeni. Próbálja újra, vagy hívjon minket.',
      rateLimited: 'Túl sok próbálkozás. Próbálja újra néhány perc múlva, vagy hívjon minket.',
    },
    success: {
      title: 'Köszönjük, megkaptuk.',
      message: 'Az ajánlatot írásban küldjük. Kapcsolattartója: {primaryContact}.',
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
  },
}

export type Copy = typeof copy
