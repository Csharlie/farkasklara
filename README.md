# sp-farkasklara — Farkas Klára Könyvelőiroda (Spektra kliens)

Kecskeméti könyvelőiroda weboldala a Spektra Platform Core-ra építve.
Platform Core: `sp-platform` (`Csharlie/spektra`), `main` @ `3ab9768` — fogyasztás: `link:../../sp-platform/packages/*`.

## Parancsok

```powershell
cd sp-clients\sp-farkasklara
pnpm install
pnpm dev        # http://localhost:5177
pnpm build      # tsc -b && vite build
pnpm lint
pnpm test       # vitest: tartalom → SiteData, sablon, kapcsolók, renderelés
```

Előfeltétel: a Platform Core buildelve (`cd sp-platform; pnpm build`) — a `data`, `runtime`, `sections`,
`themes` csomagokat a kliens a `dist/`-ből használja.

## Hol mi van

| Mit | Hol |
|---|---|
| Kapcsolati adatok (egyetlen forrás), csapat, `isPrimaryContact` | `src/content/company.ts` |
| Kapcsolók: `showPrices`, `segments.complex.enabled`, letiltott modulok, SEO-minták | `src/content/settings.ts` |
| Szolgáltatások (oldal, kártya, űrlap-opció, ár, GYIK, CTA, SEO) | `src/content/services.ts` |
| Célcsoportok | `src/content/audiences.ts` |
| Tudástár cikkek | `src/content/articles.ts` |
| Oldalszövegek | `src/content/copy.ts` |
| Tartalommodell (típusok) | `src/content/types.ts` |
| Tartalom → platform `SiteData` (oldalak, szolgáltatásoldal-sablon) | `src/data/build-pages.ts`, `build-site.ts` |
| Tartalom-validáció | `src/data/validate-content.ts` |
| Útvonalak | `src/data/routes.ts` |
| Ár-formázás + `showPrices` kapu | `src/data/price.ts` |
| Kliens section-ök (`fk-*`) | `src/sections/` |
| Téma (tokenek) | `src/index.css` (színek), `src/theme/fk-theme.ts` (Tailwind preset), `src/theme/layout.ts` |

## Gyakori teendők — csak tartalom/konfiguráció

- **Új szolgáltatás:** új objektum a `services.ts`-be → létrejön a `/szolgaltatasok/<slug>` oldal, a főoldali kártya, az űrlap-opció, a lábléc-link és a SEO-meta.
- **Árak megjelenítése:** `settings.showPrices = true` (jelenleg `false`, mert az árak `[ÁR]` placeholderek).
- **Összetettebb vállalkozások célcsoport:** `settings.segments.complex.enabled = true`.
- **Elsődleges kapcsolattartó:** a `people` tömbben pontosan egy `isPrimaryContact: true` (más érték build-hibát ad).
- **Hero kép:** `copy.home.hero.image` (pl. `public/images/hero.jpg` → `'/images/hero.jpg'`), alt: `imageAlt`.
- **Cikk:** `articles.ts`, `visible: true`; szolgáltatáshoz kötés: `service.relatedArticles`.

Az üres vagy kikapcsolt blokkok nem renderelődnek (sem cím, sem konténer).

## Placeholderek

Minden ismeretlen tény `[NAGYBETŰS]` formában szerepel, csak a `src/content/` alatt:

```powershell
Select-String -Path src\content\*.ts -Pattern '\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]'
```

Nyitott: `[TELEFONSZÁM]`, `[E-MAIL]`, `[IRÁNYÍTÓSZÁM]`, `[UTCA, HÁZSZÁM]`, `[NAPOK]`/`[NYITVATARTÁS]`, `[CÉGNÉV]`,
`[CÉGJEGYZÉKSZÁM]`, `[ADÓSZÁM]`, `[NYILVÁNTARTÁSI SZÁM]`, `[TÁRHELYSZOLGÁLTATÓ]`, `[ÉV]`, `[ÜGYFELEK SZÁMA]`,
`[KÉPESÍTÉS]`, `[MUNKATÁRS NEVE]`, `[MUNKAKÖR]`, `[ÁR]` ×6, `[NAP]` ×2, `[VÁLASZ: …]`, `[LEÍRÁS: …]`,
`[BEMUTATKOZÁS: …]`, `[ADATKEZELÉSI TÁJÉKOZTATÓ SZÖVEGE: …]`, `[HERO KÉP LEÍRÁSA]`, `url` (`[WEBCÍM]`).
A placeholder telefonszám/e-mail nem kap `tel:`/`mailto:` linket; valós értéknél automatikusan link lesz.
A szolgáltatások leírásait (mit tartalmaz, mit kérünk) az ügyféllel szakmailag jóvá kell hagyatni.

## Platform-képességek használata

| Igény | Megoldás |
|---|---|
| Hero | platform `heroDefinition` / `HeroBlock` (`colorScheme: 'dark'`) |
| Célcsoportok, folyamatlépések | platform `featuresDefinition` / `FeaturesBlock` (kliens ritmus-wrapperrel) |
| Oldalak, SEO-meta | `SiteData.pages[]`, `PageMeta`, `useDocumentHead` (a `LandingTemplate` hívja) |
| Útvonal → oldal | `LandingTemplate pageSlug` + `resolvePageSlug` (ismeretlen út → 404-oldal) |
| Űrlap | `FormHandler` (`@spektra/data`) + `useFormHandler` (`@spektra/runtime`) |
| Analytics | `data-ui-action="call"`, `"email"`, `"submit-form"` (platform data-ui standard) |
| Téma | `basePreset` + szemantikus CSS-változók + `[data-color-scheme='dark']` |

Form driver: `VITE_FORM_HANDLER` = `noop` (alap) | `cf7` | `mailto` — a production driver még nincs eldöntve.

## Platform Extension Required (nem implementálva a kliensben)

| Hiányzó képesség | Miért platform-szintű | Javasolt kiterjesztési pont |
|---|---|---|
| Prerender / SSG | Minden kliens SEO-ját érinti; kliensben külön renderelő architektúra lenne | `sp-platform` build-eszköz (pl. `tools/prerender`) a `SiteData.pages[]` alapján |
| Structured data (JSON-LD: `AccountingService`, `Service`, `FAQPage`) | A `useDocumentHead` nem kezel JSON-LD-t; kliensben saját head-kezelés duplikálná | `PageMeta.structuredData` + `useDocumentHead` `<script type="application/ld+json">` |
| Path-alapú routing, valódi 404 | A `LandingTemplate` ismeretlen slugnál csendben az első oldalra esik vissza | `@spektra/layouts`: route-feloldás + not-found |
| Avatar / monogram primitív | Generikus UI-elem | `@spektra/components` `Avatar` |
| `faq`, `cta` platform-szekció | A `PlatformSectionType` tartalmazza, implementáció nincs | `@spektra/sections` |
| Analytics esemény-API | Ma csak DOM-attribútumok vannak; dispatch/adapter nincs | `@spektra/runtime` event hook |
| `NavigationBar`: link-CTA + telefon-slot | A CTA `onClick` `<button>`, nincs telefon-hely → kliens-header készült | `@spektra/components` `NavigationBar` |
| Gomb-radius token | A `HeroBlock` CTA `rounded-xl` (kártya-radius) → nem pill alakú | CTA/button radius token a témában |

Addig a kliens kliensoldalon renderel: a szolgáltatások teljes tartalma a JS lefutása után kerül a DOM-ba,
a generált HTML-ben nincs benne.

## Deploy-megjegyzés

Útvonal-alapú SPA: a tárhelyen minden ismeretlen útvonalat az `index.html`-re kell irányítani
(pl. Apache rewrite). A nem létező útvonal a 404-oldalt rendereli, de HTTP-szinten 200-at ad.
Az `index.html` `noindex` metát tartalmaz — élesítés előtt törölni kell.
