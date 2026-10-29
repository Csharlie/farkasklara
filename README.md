# sp-farkasklara — Farkas Klára Könyvelőiroda (Spektra kliens)

Kecskeméti könyvelőiroda weboldala a Spektra Platform Core-ra építve.
Platform Core: `sp-platform` (`Csharlie/spektra`), `main` @ `dfce46c` (consent: `@spektra/runtime` ConsentProvider, `@spektra/components` ConsentBanner) — fogyasztás: `link:../../sp-platform/packages/*`.

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
| Kapcsolati adatok (egyetlen forrás), csapat, `isLead` (szakmai vezető), `isPrimaryContact` (ügyintéző) | `src/content/company.ts` |
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
- **Nagyobb vállalatok célcsoport:** `settings.segments.complex.enabled` (alapból `true`; `false`-ra állítva eltűnik).
- **Elérhetőségek → kapcsolattartó:** a márka a Farkas Klára Könyvelőiroda, de minden csatorna (telefon, e-mail, ajánlatkérő űrlap) az ügyintézőhöz, Posszert Ervinhez fut be. A `company.phone` / `company.email` az ő csatornája. Név szerint jelenik meg: Kapcsolat oldal (kapcsolattartó-kártya a telefonnal/e-maillel, az irodavezető kártyája alatt), ajánlatkérő panel utolsó kártyája, Rólunk csapatkártya (telefon/e-mail a kártyán), fejléc-telefon aria/title, űrlap sikerüzenet, Kapcsolat/Rólunk meta description. Az e-mail szerepkör-postafiók (`iroda@farkasklara.hu`, Ervin kezeli) — a végleges domainen élesítés előtt létre kell hozni. Személyes ügyfélfogadás csak előzetes időpont-egyeztetéssel (`copy.footer.appointmentNote`, `copy.quotePanel.notes.hours`). Az űrlap-driver címzettje (`VITE_FORM_MAILTO_TARGET`, illetve a CF7 címzett) is ez a cím legyen.
- **Szerepkörök:** a `people` tömbben pontosan egy `isLead: true` (szakmai vezető, kiemelt blokk) és pontosan egy `isPrimaryContact: true` (ügyintéző — hozzá fut be minden érdeklődés); más érték build-hibát ad.
- **Térkép:** teljes szélességű `fk-map` section minden oldal végén, a footer előtt (a `bc-map` / `lc-map` mintája). Automatikusan megjelenik, ha `company.address` minden része valós. A Google Maps csak a süti-sávban adott hozzájárulás után töltődik be (platform `ConsentGate`); addig helyőrző látszik a címmel és útvonaltervező linkkel.
- **Sütik / hozzájárulás:** platform consent (`sp-platform/docs/consent.md`). Konfiguráció és szövegek: `src/content/consent.ts`; UI-bekötés: `src/shell/ConsentUi.tsx`; lábléc: „Süti-beállítások”. Alul süti-sáv (Elfogadom / Csak a szükségesek / Beállítások); elfogadás után a térkép mindenhol automatikusan megjelenik, addig helyőrző (cím + útvonaltervezés + egyszeri „Térkép megjelenítése”). Új szolgáltatás (pl. analitika) felvételekor a `consentConfig.version`-t és az adatkezelési tájékoztató Sütik fejezetét is frissíteni kell.
- **Hero kép:** `public/images/hero.jpg` (1672×941, JPEG), hivatkozás és alt-szöveg: `copy.home.hero.image` / `imageAlt`.
- **Cikk:** `articles.ts`, `visible: true`; szolgáltatáshoz kötés: `service.relatedArticles`.

Az üres vagy kikapcsolt blokkok nem renderelődnek (sem cím, sem konténer).

**Placeholderek nem jelennek meg:** a `[NAGYBETŰS]` értékek a tartalomban maradnak, de a builder (`known()` a `src/data/text.ts`-ben) nem adja tovább őket — az érintett elem (telefon, e-mail, nyitvatartás, név, tény, GYIK-elem stb.) rejtve marad, amíg valós érték nem kerül a helyére.

## Placeholderek

Minden ismeretlen tény `[NAGYBETŰS]` formában szerepel, csak a `src/content/` alatt:

```powershell
Select-String -Path src\content\*.ts -Pattern '\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]'
```

Nyitott: `[NAPOK]`/`[NYITVATARTÁS]`, `[CÉGNÉV]`,
`[CÉGJEGYZÉKSZÁM]`, `[ADÓSZÁM]`, `[NYILVÁNTARTÁSI SZÁM]`, `[TÁRHELYSZOLGÁLTATÓ]`, `[ÉV]`, `[ÜGYFELEK SZÁMA]`,
`[ÁR]` ×6, `[BEMUTATKOZÁS: …]`, `url` (`[WEBCÍM]`),
jogi oldalak: `[KÉPVISELŐ NEVE ÉS TISZTSÉGE]`, `[NYILVÁNTARTÓ CÉGBÍRÓSÁG / HATÓSÁG]`, `[ADÓTANÁCSADÓI NYILVÁNTARTÁSI SZÁM]`,
`[TÁRHELYSZOLGÁLTATÓ CÍME]`, `[TÁRHELYSZOLGÁLTATÓ E-MAIL]`, `[TÁRHELYSZOLGÁLTATÓ NEVE ÉS CÍME]`, `[E-MAIL-SZOLGÁLTATÓ NEVE ÉS CÍME]`.

**Jogi oldalak** (`copy.privacy` / `copy.imprint`, `fk-legal` section): a GDPR / Infotv. / Eker. tv. szerinti szerkezet kész; a hiányzó tények sorai rejtve maradnak.
Élesítés előtt: jogász / adatvédelmi szakértő ellenőrizze; a hatálybalépés dátumát (`privacy.updated`) frissíteni kell; ha az űrlap-driver, analitika vagy süti-banner változik, a Sütik fejezetet is.
A szolgáltatások leírásait (mit tartalmaz, mit kérünk) az ügyféllel szakmailag jóvá kell hagyatni.

**Valós elérhetőség:** telefon (+36 70 231 2517) és e-mail (iroda@farkasklara.hu, a postafiók még létrehozandó). **FIKTÍV, élesítés előtt ellenőrizendő:** nyitvatartás a `src/content/company.ts`-ben; a kapcsolati kártyák rövid megjegyzései a `copy.quotePanel.notes`-ban. Ezek a fejlécben, a láblécben, a Kapcsolat oldalon és az ajánlatkérő kártyákon is megjelennek.

**Csapat-adatok:** Farkas Klára bemutatkozása irodaközpontú, nem tartalmaz ellenőrizetlen életrajzi adatot, képesítést vagy szakmai évszámot. Halász Réka neve a projekt során megadott (korábban fiktívként bevezetett) adat — élesítés előtt ellenőrizendő. Képesítések csak ellenőrzött adat alapján kerülhetnek a `credentials` mezőkbe — megadva (2026-10-21): mindhárom munkatárs mérlegképes könyvelő.

**Tény-sáv (Rólunk alatt):** csak tartalomból levezetett értékek (csapatlétszám, szolgáltatási területek, ügyfélcsoportok, Kecskemét). Ellenőrzött üzleti mutató (pl. alapítás éve, ügyfélszám) a `copy.home.facts.items` listában cserélhető be.

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

Form driver: `VITE_FORM_HANDLER` = `noop` (alap) | `cf7` | `mailto` — a production driver még nincs eldöntve. A címzett az ügyintéző (`company.email`).
A `noop` csak fejlesztésben színlel sikert; production buildben az űrlap őszinte hibaüzenetet ad, amíg nincs valódi driver beállítva.

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

## Előnézet a pspro.hu-n (`pnpm deploy:pspro`)

Ügyfél-előnézet: **https://pspro.hu/farkasklara/**, jelszavas belépőkapu mögött (a LuxCover mintájára).

1. Egyszer: `deploy/pspro/.env.deploy.example` → `.env.deploy.local` (gitignore-olt): FTP host/user/jelszó/mappa + az előnézet felhasználóneve és jelszava.
2. `pnpm deploy:pspro --dry-run` — build + csomag összeállítása, feltöltés nélkül (fájllista).
3. `pnpm deploy:pspro` — build (`--mode pspro`, `DEPLOY_BASE=/farkasklara/` a `.env.pspro`-ból) → csomag → FTP-feltöltés (TLS kötelező; `FTP_TLS=optional` csak ha a tárhely nem tud FTPS-t).

Hogyan működik:
- **Alap-útvonal:** minden belső link és kép a `withBase()`-en át épül (`src/data/routes.ts`); helyben és a végleges domainen `/`, az előnézeten `/farkasklara/`.
- **Belépőkapu** (`deploy/pspro/`): `auth-check.php` csak bejelentkezett látogatónak adja ki az `index.html`-t, minden más útvonal (`/farkasklara/kapcsolat` stb.) is ide fut; `login.php` márkaszínű belépőoldal. A jelszó csak PBKDF2-hashként kerül a szerverre (`auth-config.php`, minden deploynál generálva, új aláíró titokkal → mindenki újra belép). A süti aláírt és lejár (14 nap). `noindex` + `X-Robots-Tag`.
- **Űrlap:** az előnézeten `noop` driver → production buildben őszinte hibaüzenet („nem érhető el”), amíg nincs valódi driver.
- Régi, már nem használt `assets/*` fájlokat a szkript nem töröl a szerverről (ártalmatlanok).

## Deploy-megjegyzés

Útvonal-alapú SPA: a tárhelyen minden ismeretlen útvonalat az `index.html`-re kell irányítani
(pl. Apache rewrite). A nem létező útvonal a 404-oldalt rendereli, de HTTP-szinten 200-at ad.
Az `index.html` `noindex` metát tartalmaz — élesítés előtt törölni kell.
