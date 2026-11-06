# TODO — sp-farkasklara

## Üzemeltetés

- [ ] **„Mail delivery failed: returning message to sender” a `kapcsolat@farkaskonyveles.hu` postafiókban** (2026-11-06, 04:22)
  A próba-ajánlatkérés tesztje közben észrevett bounce-levél, órákkal az élesítés előttről — nem a mai `ajanlatkeres.php`-teszthez kapcsolódik (az akkor még nem is futott). Nem blokkolja az élesítést.
  - Valószínűleg backscatter: hamisított feladóval küldött spam visszapattanása, nem a saját kimenő levelünk.
  - Későbbi lépés a DMARC szigorítása (`p=none` → `p=quarantine`), a pspro.hu-n bevált beállítás mintájára. Az ügyfélnél nem figyelünk DMARC-jelentéseket. Feltétel: SPF=pass és DKIM=pass a kimenő levelek minden útján (webes űrlap, Roundcube, levelezőprogram, ha van), és hogy nincs más feladó a domain nevében (pl. számlázó- vagy könyvelőprogram, amely `kapcsolat@` vagy `iroda@` címről küld). Ezt Ervinnel és Klárával tisztázni a szigorítás előtt.

## Tartalom

- [ ] **Pályázat-előkészítés szolgáltatás kidolgozása** (`src/content/services.ts`, `palyazatok`)
  A szolgáltatás jelenleg csak a jogosultság ellenőrzését írja le, a vállalkozás pénzügyi adatai alapján.
  A megírás, a beadás, az elszámolás, a pénzügyi adatok összeállítása és a dokumentumok összegyűjtése kikerült. A szöveg csak a vállalt munkát írja le, nemleges mondat nélkül.
  Ami még kell: a tartalom véglegesítése az ügyféllel. Mit vállalnak pontosan, milyen dokumentumokat kérnek, kell-e GYIK.
