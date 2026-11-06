# sp-farkasklara — Farkas Klára Könyvelőiroda (Spektra kliens)

Kecskeméti könyvelőiroda weboldala a Spektra Platform Core-ra építve.
Platform Core: `sp-platform` (`Csharlie/spektra`), `main` @ `dfce46c` (consent: `@spektra/runtime` ConsentProvider, `@spektra/components` ConsentBanner) — fogyasztás: `link:../../sp-platform/packages/*`.

## Parancsok

```powershell
cd sp-clients\sp-farkasklara
pnpm install
pnpm dev        # http://localhost:5177
pnpm build      # tsc -b && vite build — éles (production) build a dist/-be
pnpm lint
pnpm test       # vitest: tartalom → SiteData, sablon, kapcsolók, renderelés, SEO, űrlap (gyors)
pnpm test:build # lassú: valódi production + staging build, a kimeneti fájlok ellenőrzése
```

Előfeltétel: a Platform Core buildelve (`cd sp-platform; pnpm build`) — a `data`, `runtime`, `sections`,
`themes` csomagokat a kliens a `dist/`-ből használja.

## Hol mi van

| Mit | Hol |
|---|---|
| Kapcsolati adatok (egyetlen forrás), csapat, `isLead` (szakmai vezető), `isPrimaryContact` (ügyintéző) | `src/content/company.ts` |
| Kapcsolók: `showPrices`, letiltott modulok, SEO-minták | `src/content/settings.ts` |
| Szolgáltatások (oldal, kártya, űrlap-opció, ár, GYIK, CTA, SEO) | `src/content/services.ts` |
| Célcsoportok | `src/content/audiences.ts` |
| Tudástár cikkek | `src/content/articles.ts` |
| Oldalszövegek | `src/content/copy.ts` |
| Tartalommodell (típusok) | `src/content/types.ts` |
| Tartalom → platform `SiteData` (oldalak, szolgáltatásoldal-sablon) | `src/data/build-pages.ts`, `build-site.ts` |
| Tartalom-validáció | `src/data/validate-content.ts` |
| Útvonalak | `src/data/routes.ts` |
| Ár-formázás + `showPrices` kapu | `src/data/price.ts` |
| SEO build-lépés: útvonalankénti HTML, JSON-LD, sitemap, robots, `noindex` | `src/seo/` (Vite-plugin: `src/seo/vite-plugin.ts`) |
| Ajánlatkérő űrlap: kliens-driver, PHP-végpont, generált konfig | `src/data/php-form-handler.ts`, `deploy/production/ajanlatkeres.php`, `src/data/quote-form-config.ts` |
| Favicon, OG-kép, WebP hero (generált) | `scripts/make-images.mjs` → `public/` |
| Kliens section-ök (`fk-*`) | `src/sections/` |
| Téma (tokenek) | `src/index.css` (színek), `src/theme/fk-theme.ts` (Tailwind preset), `src/theme/layout.ts` |

## Gyakori teendők — csak tartalom/konfiguráció

- **Új szolgáltatás:** új objektum a `services.ts`-be → létrejön a `/szolgaltatasok/<slug>` oldal, a főoldali kártya, az űrlap-opció, a lábléc-link és a SEO-meta.
- **Árak megjelenítése:** `settings.showPrices = true` (jelenleg `false`, mert az árak `[ÁR]` placeholderek).
- **Célcsoportok:** `src/content/audiences.ts` — hat csoport (főoldalon két teljes, hármas sor). Egy csoport elrejtése: `enabled: false`; szolgáltatáshoz kötés: `service.audiences`.
- **Elérhetőségek → kapcsolattartó:** a márka a Farkas Klára Könyvelőiroda, de minden csatorna (telefon, e-mail, ajánlatkérő űrlap) az ügyintézőhöz, Posszert Ervinhez fut be. A `company.phone` / `company.email` az ő csatornája. Név szerint jelenik meg: Kapcsolat oldal (kapcsolattartó-kártya a telefonnal/e-maillel, az irodavezető kártyája alatt), ajánlatkérő panel utolsó kártyája, Rólunk csapatkártya (telefon/e-mail a kártyán), fejléc-telefon aria/title, űrlap sikerüzenet, Kapcsolat/Rólunk meta description. Az e-mail szerepkör-postafiók (`kapcsolat@farkaskonyveles.hu`, Ervin kezeli) — a végleges domainen élesítés előtt létre kell hozni. Személyes ügyfélfogadás csak előzetes időpont-egyeztetéssel (`copy.footer.appointmentNote`, `copy.quotePanel.notes.hours`). Az éles űrlap (`php` driver) címzettje automatikusan ez a cím (a buildből generált `ajanlatkeres-config.php`); más driver esetén (`VITE_FORM_MAILTO_TARGET`, CF7) is ez legyen.
- **Szerepkörök:** a `people` tömbben pontosan egy `isLead: true` (szakmai vezető, kiemelt blokk) és pontosan egy `isPrimaryContact: true` (ügyintéző — hozzá fut be minden érdeklődés); más érték build-hibát ad.
- **Térkép:** teljes szélességű `fk-map` section minden oldal végén, a footer előtt (a `bc-map` / `lc-map` mintája). Automatikusan megjelenik, ha `company.address` minden része valós. A Google Maps csak a süti-sávban adott hozzájárulás után töltődik be (platform `ConsentGate`); addig helyőrző látszik a címmel és útvonaltervező linkkel.
- **Sütik / hozzájárulás:** platform consent (`sp-platform/docs/consent.md`). Konfiguráció és szövegek: `src/content/consent.ts`; UI-bekötés: `src/shell/ConsentUi.tsx`; lábléc: „Süti-beállítások”. Alul süti-sáv (Elfogadom / Csak a szükségesek / Beállítások); elfogadás után a térkép mindenhol automatikusan megjelenik, addig helyőrző (cím + útvonaltervezés + egyszeri „Térkép megjelenítése”). Új szolgáltatás (pl. analitika) felvételekor a `consentConfig.version`-t és az adatkezelési tájékoztató Sütik fejezetét is frissíteni kell.
- **Hero kép:** forrás `public/images/hero.jpg` (1672×941, JPEG); az oldal a WebP-változatot használja (`public/images/hero.webp`), hivatkozás és alt-szöveg: `copy.home.hero.image` / `imageAlt`. Az éles HTML a főoldalon előtölti (`preload`, `fetchpriority="high"`), mert a platform `HeroBlock` CSS-háttérként rajzolja ki.
- **Favicon, megosztási kép (OG):** a `node scripts/make-images.mjs` generálja (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.jpg` 1200×630 a hero-képből, `images/hero.webp`); a kimenet commitolva van. Ideiglenes „FK” monogram, amíg nincs logó — logó esetén a szkriptet kell átírni (vagy a fájlokat lecserélni), a fájlnevek maradhatnak. Az OG-kép alt-szövege és mérete: `settings.seo.ogImage`.
- **Nyitvatartás a Google felé:** a `company.openingHours` a weboldalon megjelenik, de a strukturált adatba (JSON-LD) csak akkor kerül, ha `company.openingHoursConfirmed: true`. Ez a kapcsoló azért kell, mert a JSON-LD-t a Google ellenőrzött üzleti adatként kezeli; nem megerősített nyitvatartás ne jusson oda. Jelenleg `true`: a Hétfő–csütörtök 9:00–16:00 nyitvatartást az ügyfél megerősítette (2026-11-06). Bekapcsolva a formátum „Hétfő–csütörtök” / „9:00–16:00” legyen, különben a build hibát ad.
- **Google Cégprofil, Facebook:** a profil-URL-eket a `company.sameAs` tömbbe kell írni — innen a JSON-LD `sameAs` mezőjébe kerülnek, így a Google össze tudja kötni a weboldalt a profilokkal.
- **Cikk:** `articles.ts`, `visible: true`; szolgáltatáshoz kötés: `service.relatedArticles`.

Az üres vagy kikapcsolt blokkok nem renderelődnek (sem cím, sem konténer).

**Placeholderek nem jelennek meg:** a `[NAGYBETŰS]` értékek a tartalomban maradnak, de a builder (`known()` a `src/data/text.ts`-ben) nem adja tovább őket — az érintett elem (telefon, e-mail, nyitvatartás, név, tény, GYIK-elem stb.) rejtve marad, amíg valós érték nem kerül a helyére.

## Placeholderek

Minden ismeretlen tény `[NAGYBETŰS]` formában szerepel, csak a `src/content/` alatt:

```powershell
Select-String -Path src\content\*.ts -Pattern '\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]'
```

Nyitott: `[CÉGNÉV]`,
`[CÉGJEGYZÉKSZÁM]`, `[ADÓSZÁM]`, `[NYILVÁNTARTÁSI SZÁM]`, `[ÉV]`, `[ÜGYFELEK SZÁMA]`,
`[ÁR]` ×6, `[BEMUTATKOZÁS: …]`, Tudástár mintacikk (`[CIKK …]`, rejtett),
jogi oldalak: `[KÉPVISELŐ NEVE ÉS TISZTSÉGE]`, `[NYILVÁNTARTÓ CÉGBÍRÓSÁG / HATÓSÁG]`, `[ADÓTANÁCSADÓI NYILVÁNTARTÁSI SZÁM]`.
A tárhelyszolgáltató (RackForest Zrt.) adatai már a tájékoztatóban és az impresszumban is szerepelnek (lásd lent).

A kiszolgált dokumentumokban (minden `.html`, `sitemap.xml`, `robots.txt`, generált PHP-konfig, JSON-LD) placeholder nincs — ezt a `pnpm test` és a `pnpm test:build` ellenőrzi.
**Nyitott pont:** a JS-bundle a nyers tartalmat tartalmazza (`src/data/site.ts`, `src/shell/shell-context.ts` futásidőben importálja a `content`-et), így a placeholderek a forráskódban olvashatók, bár a felületen nem jelennek meg. Javítás: a SiteData és a shell-adatok build-időben, szerializálva kerüljenek a bundle-be.

**Jogi oldalak** (`copy.privacy` / `copy.imprint`, `fk-legal` section): a GDPR / Infotv. / Eker. tv. szerinti szerkezet kész; a hiányzó tények sorai rejtve maradnak.
Élesítés előtt: jogász / adatvédelmi szakértő a teljes szöveget ellenőrizze. A hatálybalépés dátuma (`privacy.updated`): 2026. november 6. Ha az űrlap-driver, analitika vagy süti-banner változik, a Sütik fejezetet is frissíteni kell.
**A tájékoztatóban már frissítve (a szöveg struktúráját nem változtattuk):**
- Google Fonts kikerült (a saját tárhelyes betűtípusok miatt): Sütik fejezet, Címzettek (már csak „Google Ireland Ltd. – térkép”), Harmadik ország (a mondat most a térkép betöltésére utal).
- Ajánlatkérő űrlap feldolgozása leírva: HTTPS-en érkezik, a tárhely levelezőszerverén át jut el a `kapcsolat@` postafiókba, külön adatbázis nincs (az „Ajánlatkérés az online űrlapon” csoport „Az adatok útja” mezője); saját csoport a visszaélés-szűrésről (sózott, titkos kulcsú IP-hash, legfeljebb 10 percig).
- Címzettek / Tárhelyszolgáltató: RackForest Informatikai Kereskedelmi Szolgáltató és Tanácsadó Zrt. (1132 Budapest, Victor Hugo utca 11.; info@rackforest.hu) — a `rackforest.com/kapcsolat` irodacíme; a hivatalos székhelyet céginformációból még ellenőrizni kell.
**Ellenőrizendő élesítés előtt:**
- A technikai naplók megőrzési ideje (jelenleg „a tárhelyszolgáltató naplózási beállításai szerint” — a cPanelen látható pontos időtartammal kiegészítendő).
- A teljes szöveg jogi/adatvédelmi átnézése.
A szolgáltatások leírásait (mit tartalmaz, mit kérünk) az ügyféllel szakmailag jóvá kell hagyatni.

**Valós elérhetőség:** telefon (+36 70 231 2517) és e-mail (kapcsolat@farkaskonyveles.hu, a postafiók még létrehozandó). **Megerősítve (2026-11-06):** nyitvatartás (Hétfő–csütörtök 9:00–16:00, `src/content/company.ts`) — a JSON-LD-ben is szerepel —, valamint a kapcsolati kártyák rövid megjegyzései (`copy.quotePanel.notes`). Ezek a fejlécben, a láblécben, a Kapcsolat oldalon és az ajánlatkérő kártyákon is megjelennek.

**Csapat-adatok:** Farkas Klára bemutatkozása irodaközpontú, nem tartalmaz ellenőrizetlen életrajzi adatot, képesítést vagy szakmai évszámot. Gelencsérné Csipkereki Edina neve az ügyfél által megadott adat (2026-11-06). Képesítések csak ellenőrzött adat alapján kerülhetnek a `credentials` mezőkbe — megadva (2026-10-21): mindhárom munkatárs mérlegképes könyvelő.

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

Form driver: `VITE_FORM_HANDLER` = `noop` (fejlesztés, előnézetek) | `php` (éles, `.env.production`) | `cf7` | `mailto`. A címzett az ügyintéző (`company.email`).
A `noop` csak fejlesztésben színlel sikert; production buildben (így a pspro/staging előnézeten is) az űrlap őszinte hibaüzenetet ad.

**`php` driver (éles):** az űrlap a saját domainen lévő `/ajanlatkeres.php`-nak küld (`VITE_FORM_ENDPOINT`). Azonos origin, ezért CORS-beállítás nem kell.
- Mezők: `name`, `email`, `phone`, `services[]` (a szolgáltatás **címkéje**, pl. „Könyvelés”), `message`, `consent=yes`, `website` (honeypot), `elapsed`, `formId`. A tömbök `kulcs[]` néven mennek, hogy a PHP tömbként olvassa őket.
- A végpont (`deploy/production/ajanlatkeres.php`, PHP 7) csak POST-ot fogad, és csak akkor, ha az `Origin` vagy a `Referer` a saját domain; ha mindkettő hiányzik, 403-at ad.
- Spam ellen: rejtett honeypot mező, a 3 másodpercen belüli beküldés csendben eldobva, IP-nként 10 percenként legfeljebb 5 kérés (429). A limithez az IP-címet nem tárolja nyersen: HMAC-SHA256-tal (titkos, csak a szerveren élő, buildenként új kulccsal) képzett lenyomatot ment egy fájlba, legfeljebb 10 percre — ehhez kell a lenti cron-feladat (`ajanlatkeres-cleanup.php`), különben csendes napokon a fájl tovább megmaradhatna, mint amit a tájékoztató ígér.
- Ellenőrzés: név, e-mail vagy telefon, 1…N ismert szolgáltatás, hozzájárulás.
- Levél a `company.email`-re. A `From` és a borítékfeladó (`-f`) ugyanez a saját domaines cím, így a tárhely SPF/DKIM-je érvényes. A `Reply-To` a látogató címe, tehát a válasz gomb neki ír.
- A címzett, a domain, a szolgáltatáslista és a hibaüzenetek nem a kérésből jönnek: a build a tartalomból generálja őket (`ajanlatkeres-config.php`), és a `.htaccess` tiltja a közvetlen elérésüket.
- A szerveren kell az `mbstring` PHP-bővítmény (cPanel → Select PHP Version → Extensions). Nélküle is működik, de egyszerűbb fejléc-kódolással.
- **Cron-feladat (`deploy/production/ajanlatkeres-cleanup.php`):** a 10 percnél régebbi vagy üres visszaélés-szűrő fájlokat törli — a végpont maga is söpör minden kéréskor, de alacsony forgalomnál ez a cron adja a garanciát, hogy a fájl ténylegesen legfeljebb 10 percig marad meg. Csak parancssorból fut (a `.htaccess` webről is tiltja). cPanel → Cron Jobs:
  - Gyakoriság: „Every 10 Minutes” (vagy kézzel: Minute `*/10`, a többi `*`).
  - Parancs (a PHP-CLI elérési útját a cPanel Terminal `which php` parancsával, vagy a „Select PHP Version” oldalon ellenőrizd — ugyanaz a verzió fusson, mint a weben):
    ```
    /usr/local/bin/php /home/<cpanel-felhasznalo>/public_html/ajanlatkeres-cleanup.php >/dev/null 2>&1
    ```
  - A `<cpanel-felhasznalo>` és az útvonal az `.env.deploy.local` `PRODUCTION_SFTP_DIR`-jéből jön (a cron parancsban abszolút útvonal kell, nem a relatív `~/public_html`).

## Platform Extension Required (nem implementálva a kliensben)

| Hiányzó képesség | Miért platform-szintű | Javasolt kiterjesztési pont |
|---|---|---|
| Prerender / SSG (a body is) | Minden kliens SEO-ját érinti. A kliens most csak a head-et rendereli elő útvonalanként (`src/seo`), a body kliensoldali | `sp-platform` build-eszköz (pl. `tools/prerender`) a `SiteData.pages[]` alapján, `hydrateRoot`-tal |
| `useDocumentHead`: `og:url` | Minden oldalon a `siteMeta.url`-t írja, nem az oldal canonicalját. Ezért a kliens `site.url`-je szándékosan üres, az `og:url` az előrenderelt HTML-ben van | `og:url` = `pageMeta.canonical ?? siteMeta.url` |
| `useDocumentHead`: `og:image` | Ha nincs `pageMeta.ogImage`, törli a meglévő `og:image`-et. A kliens ezért minden oldalnak abszolút `ogImage`-et ad | csak felülírjon, ne töröljön; `og:image:width/height/alt`, `og:locale`, `og:type`, `twitter:card` |
| Structured data (JSON-LD: `AccountingService`, `Service`, `FAQPage`) | A `useDocumentHead` nem kezel JSON-LD-t. A kliens a főoldalra build közben írja be (`src/seo/json-ld.ts`) | `PageMeta.structuredData` + `useDocumentHead` `<script type="application/ld+json">` |
| `robots` / `noindex` oldalanként | A `PageMeta`-ban nincs ilyen mező. A kliens maga dönti el (`src/seo/indexable.ts`: 404, üres Tudástár) | `PageMeta.robots` |
| Path-alapú routing, valódi 404 | A `LandingTemplate` ismeretlen slugnál csendben az első oldalra esik vissza. A kliensben megoldott (`resolvePageSlug`, éles HTTP 404 a `.htaccess`-ből) | `@spektra/layouts`: route-feloldás + not-found |
| `HeroBlock`: valódi `<img>` + `fetchpriority` | A kép CSS-háttér, ezért nincs `srcset`, `fetchpriority` és LCP-optimalizálás. A kliens WebP-t ad és `preload`-ot tesz a head-be | `<img>` (`srcSet`, `sizes`, `fetchpriority="high"`) a `HeroBlock`-ban |
| Avatar / monogram primitív | Generikus UI-elem | `@spektra/components` `Avatar` |
| `faq`, `cta` platform-szekció | A `PlatformSectionType` tartalmazza, implementáció nincs | `@spektra/sections` |
| Analytics esemény-API | Ma csak DOM-attribútumok vannak; dispatch/adapter nincs | `@spektra/runtime` event hook |
| `NavigationBar`: link-CTA + telefon-slot | A CTA `onClick` `<button>`, nincs telefon-hely → kliens-header készült | `@spektra/components` `NavigationBar` |
| Gomb-radius token | A `HeroBlock` CTA `rounded-xl` (kártya-radius) → nem pill alakú | CTA/button radius token a témában |

Addig a body kliensoldalon renderel: a szolgáltatások teljes tartalma a JS lefutása után kerül a DOM-ba.
A generált HTML-ben útvonalanként csak a head (title, description, canonical, OG, JSON-LD) van benne.

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

## Előnézet a farkaskonyveles.hu-n (`pnpm deploy:staging`)

Ugyanaz a belépőkapu a végleges domain gyökerében (`DEPLOY_BASE=/`, `.env.staging`), még nem éles: jelszó, `noindex` + `X-Robots-Tag`, és tiltó `robots.txt` (`Disallow: /`, a kapu előtt is olvasható).

- Feltöltés SFTP-n (cPanel), rögzített SSH host kulccsal (`STAGING_SFTP_*` a `.env.deploy.local`-ban, minta: `deploy/pspro/.env.deploy.example`).
- A szerveren lévő `.htaccess` cPanel-blokkjait (MultiPHP) a szkript megtartja, a saját szabályok ezek után jönnek.
- A tárhely PHP 7-et futtat: a kapu PHP-kódja nem használ PHP 8-függvényeket (`str_starts_with` stb.).
- A belépősüti `secure`, ezért a belépés csak HTTPS-en működik (DNS + AutoSSL kell hozzá).
- Élesítéskor: `pnpm deploy:production` (lásd lent) — a kapu, a `noindex` és a tiltó `robots.txt` eltűnik.

## Élesítés a farkaskonyveles.hu-n (`pnpm deploy:production`)

Nyilvános, indexelhető oldal: **https://farkaskonyveles.hu** (www és http nélkül — ez a kanonikus cím, `company.url`).
Élesre **csak** a `pnpm deploy:production` használható. A VS Code SFTP-bővítmény (`context: dist`) erre nem jó: az `ajanlatkeres.php` és a `.htaccess`-ek nincsenek a `dist/`-ben (a szkript a `deploy/production/`-ből teszi őket a csomagba), és a cPanel-blokkok megtartása is elmaradna.

**Mit csinál a szkript:**
1. `vite build --mode production` (a `.env.production` alapján: `DEPLOY_BASE=/`, `VITE_FORM_HANDLER=php`) → `dist-production/`.
   - Útvonalanként saját HTML: `index.html`, `kapcsolat.html`, `szolgaltatasok.html`, `szolgaltatasok/<slug>.html` stb., mindegyik saját title-lel, description-nel, canonicallal, Open Graph-fal; a főoldalon JSON-LD is van.
   - Mellette: `404.html`, `sitemap.xml`, `robots.txt` (`Allow: /` + `Sitemap:`), `ajanlatkeres-config.php`.
2. Csomag: a build kimenete, a `deploy/production/ajanlatkeres.php`, az `assets/.htaccess` (1 év, `immutable`), az `images/.htaccess` (1 hét) és a gyökér-`.htaccess` (`deploy/production/.htaccess.tpl`). A szerveren lévő `.htaccess` cPanel-blokkjait (MultiPHP) megtartja. Kapufájl, `auth-config.php` és tiltó `robots.txt` nem kerül fel.
3. SFTP-feltöltés rögzített host kulccsal (`PRODUCTION_SFTP_*` a `.env.deploy.local`-ban; minta: `deploy/pspro/.env.deploy.example`). A sorrend: assetek és képek → PHP → oldalak → főoldal → sitemap/robots → `.htaccess`-ek, a gyökér-`.htaccess` legutoljára. Így a régi (kapus) szabályok a csere pillanatáig érvényesek.
   - Saját `PRODUCTION_` előtag, bár ma ugyanaz a szerver és mappa, mint a stagingé: az élesítés legyen kifejezett beállítás, és ne essen vissza csendben a staging adataira.

**Mi marad a szerveren:** a régi, hash-elt `assets/*` fájlok (ártalmatlanok), és a staging kapufájljai (`login.php`, `auth-check.php`, `gate.php`, `auth-config.php`). Ez utóbbiakat az új `.htaccess` letiltja (403), és a szkript a feltöltés után kilistázza őket. Törlés:
- `pnpm deploy:production --remove-gate`: kiírja, mit törölne, és csak a begépelt `torles` megerősítés után töröl. A `--dry-run --remove-gate` csak listáz.
- vagy kézzel a cPanel Fájlkezelőben (`public_html/`).

**`.htaccess` — mit csinál és miért:**
- `DirectorySlash Off`, és `/x` → `x.html`, ha létezik. A `/szolgaltatasok` egyszerre oldal és mappa; az alapértelmezett `DirectorySlash On` mellett az Apache 301-gyel `/szolgaltatasok/`-ra irányítana, ez pedig nem egyezne a canonicallal.
- Egyetlen 301 a kanonikus címre. A `http://`, a `www.` és a perjel a végén ugyanabban az ugrásban javul, nincs átirányítási lánc. A `/kapcsolat/` és a `/kapcsolat.html` is 301-gyel megy a `/kapcsolat`-ra.
- Ismeretlen URL és oldal nélküli mappa (`/assets`) → `404.html`, **valódi 404-es státusszal**. A 404-oldal `noindex`-es.
- `/.well-known/` (AutoSSL/ACME): egyik rewrite sem érinti, http-n sem. Az `ErrorDocument` `<If>` nélkül nem szűkíthető útvonalra, ezért egy ott *nem létező* fájl 404-es státusszal a `404.html` törzsét kapja; a létező fájlok változatlanul mennek ki.
- Cache: a HTML, a sitemap és a robots `no-cache` (deploy után azonnal frissül); `/assets` 1 év `immutable` (a fájlnév a tartalommal együtt változik); `/images` 1 hét.
- `<If>` nincs benne, így Apache 2.4-en és LiteSpeeden is működik.

**Kézi lépések élesítéskor (sorrendben):**
1. `.env.deploy.local`: `PRODUCTION_SFTP_HOST/PORT/USER/PASS/DIR/HOSTKEY` (a staging értékei, tudatosan bemásolva).
2. A `kapcsolat@farkaskonyveles.hu` postafiók létezzen. cPanel → Email Deliverability: az SPF és a DKIM legyen „Valid”; DMARC-rekord ajánlott (`v=DMARC1; p=none; rua=mailto:kapcsolat@farkaskonyveles.hu`).
3. cPanel → Select PHP Version → Extensions: az `mbstring` legyen bekapcsolva.
4. `pnpm deploy:production --dry-run`, ellenőrizd a fájllistát, majd `pnpm deploy:production`.
5. cPanel → Cron Jobs: állítsd be a fenti `ajanlatkeres-cleanup.php` tízpercenkénti futtatását.
6. Ellenőrzés `curl -sI`-vel. Mindegyik **egyetlen** `301`, `Location: https://farkaskonyveles.hu/kapcsolat`:
   ```
   curl -sI http://www.farkaskonyveles.hu/kapcsolat/
   curl -sI http://farkaskonyveles.hu/kapcsolat
   curl -sI https://www.farkaskonyveles.hu/kapcsolat
   curl -sI https://farkaskonyveles.hu/kapcsolat/
   ```
   A `curl -sI https://farkaskonyveles.hu/kapcsolat` → `200`; a `curl -sI https://farkaskonyveles.hu/nincs-ilyen` → `404`. A `Server:` fejlécből látszik, hogy Apache vagy LiteSpeed fut. LiteSpeeden külön nézd meg:
   - a `curl -sI https://farkaskonyveles.hu/szolgaltatasok` `200` (nem `301` a `/szolgaltatasok/`-ra) — ebből látszik, hogy a `DirectorySlash Off` érvényes;
   - az `assets/*.js` válaszában `Cache-Control: public, max-age=31536000, immutable` áll;
   - ha a módosított `.htaccess` nem hat azonnal, a LiteSpeed újraolvasása (cPanelen általában automatikus).
7. **Csak a 6. pont sikere után:** cPanel → Domains → „Force HTTPS Redirect” kikapcsolása a `farkaskonyveles.hu`-n. Bekapcsolva a `http://www.` kérés két ugrással ér célba (előbb a cPanel viszi https-re, utána a `.htaccess` a csupasz domainre). Utána ismételd meg a 6. pontot.
8. Ha maradtak kapufájlok: `pnpm deploy:production --remove-gate`, vagy törlés kézzel.
9. Google Search Console: tulajdon-ellenőrzés, a `https://farkaskonyveles.hu/sitemap.xml` beküldése.

## Deploy-megjegyzés

- **Éles:** útvonalanként saját HTML-fájl. A `noindex` nincs beégetve az `index.html`-be; az `fk-seo` Vite-plugin csak a kapus buildekbe (`--mode staging`, `--mode pspro`) teszi be. Nem létező útvonal: valódi 404 (`404.html`).
- **Előnézetek (pspro, staging):** egy `index.html` a kapun át minden útvonalra; a nem létező útvonal a 404-oldalt rendereli, de HTTP-szinten 200-at ad (a kapu miatt, `noindex`-szel).
