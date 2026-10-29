# Świetne Lokalizacje: nowa strona (demo)

Strona główna biura nieruchomości komercyjnych Świetne Lokalizacje: hero (etap 1) i wszystkie sekcje
strony głównej (etap 2). Czysty HTML, CSS i JavaScript, bez frameworka i bez kroku budowania.

## Sekcje strony głównej

1. **Hero:** hasło klienta i rysunek techniczny ulicy z czterema typami nieruchomości. Podpisy pod
   budynkami prowadzą do sekcji ofert z ustawionym filtrem (`#oferty-lokale`, `#oferty-biura`,
   `#oferty-magazyny`, `#oferty-grunty`).
2. **Dla kogo pracujemy:** firmy szukające miejsca, inwestorzy, właściciele nieruchomości.
3. **Wybrane oferty:** filtr typów, karty ofert, stany „kilka ofert” i „brak ofert”.
4. **Usługi:** doradztwo lokalizacyjne, wyszukiwanie, negocjacje, projekty inwestycyjne.
5. **Jak pracujemy:** pięć kroków współpracy.
6. **Dla właścicieli:** w czym pomagamy, przycisk „Zgłoś nieruchomość”.
7. **O nas:** opis i standardy (OC pośrednika, członkostwo w MSPON, wizytówka w rejestrze PFRN).
8. **Kontakt:** formularz zapytania z walidacją, e-mail i telefon.
9. **Stopka.**

## Oferty

Dane przykładowe są w `js/offers-data.js`. Pola odpowiadają przyszłemu API z backendu, więc po jego
podłączeniu karty i filtry zostają bez zmian. Gdy oferta nie ma zdjęcia (`photo: null`), karta pokazuje
rysunek typu nieruchomości w stylu hero.

Zachowanie sekcji zależy od liczby ofert:
- 3 i więcej: siatka kart, pod nią zaproszenie do zlecenia poszukiwania,
- 1 lub 2: karty i obok nich blok „Nie widzisz tego, czego szukasz?”,
- 0: tylko zaproszenie (także dla pustego filtra, np. brak publicznych ofert gruntów),
- na telefonie widać trzy oferty i przycisk „Pokaż wszystkie oferty”.

Podgląd stanów w demo: `index.html?oferty=0` albo `index.html?oferty=2`.

## Formularz

Przyciski w całej stronie podpowiadają formularzowi, o co chodzi: „Zleć poszukiwanie” ustawia
„Szukam nieruchomości”, „Zgłoś nieruchomość” ustawia „Mam nieruchomość” (zmieniają się wtedy opisy
pól, np. „Oczekiwana cena” zamiast „Budżet”), przycisk przy pustym filtrze ustawia rodzaj nieruchomości.
Walidacja działa przy wysyłce, komunikaty pojawiają się przy polach. Wysyłka zostanie podłączona do
serwera na SEOHost w etapie z backendem; do tego czasu formularz pokazuje informację, że to demo.


## Oferty po stronie odwiedzającego (etap 3)

Strony: `oferty.html` (lista) i `oferta.html?id=...` (karta oferty). Wszystko działa bez serwera,
dane są w `js/offers-data.js`.

### Lista ofert

- filtry: rodzaj (zakładki z liczbą ofert), transakcja, miejscowość, powierzchnia od i do,
  cena do (czynsz miesięczny przy najmie, cena całkowita przy sprzedaży), wyszukiwanie po słowach,
- sortowanie: najnowsze, cena, powierzchnia,
- aktywne filtry jako etykiety do kliknięcia, przycisk „Wyczyść filtry”,
- **filtry zapisują się w adresie**, więc link do gotowego wyszukiwania można wysłać klientowi,
  np. `oferty.html?typ=lokale&transakcja=najem&cena_do=15000`,
- na telefonie filtry otwierają się w panelu na cały ekran z przyciskiem „Pokaż N ofert”,
- brak wyników: propozycja wyczyszczenia filtrów albo zlecenia poszukiwania (formularz na stronie
  głównej dostaje od razu rodzaj nieruchomości).

### Karta oferty

- galeria: zdjęcia, a dopóki ich nie ma, trzy rysunki poglądowe (elewacja, zbliżenie, rzut
  z wymiarami); strzałki, przesuwanie palcem, klawiatura, pełny ekran,
- parametry w grupach, opis, atuty, opis okolicy,
- mapa z **przybliżoną lokalizacją** (okrąg, nie pinezka z adresem). MapLibre z kafelkami
  OpenFreeMap: bez kluczy, limitów i ciasteczek. Ładuje się dopiero po przewinięciu do sekcji;
  bez internetu pokazuje wersję zastępczą z linkiem do OpenStreetMap,
- panel ceny (na komputerze przyklejony z boku): cena, cena za m², numer oferty, data dodania,
  „Zapytaj o ofertę”, „Zadzwoń”,
- **udostępnianie**: kopiuj link, WhatsApp, e-mail, SMS, systemowe „udostępnij” na telefonie,
  wydruk lub PDF (osobny styl do druku),
- zapytanie z numerem oferty wpisanym w wiadomość, podobne oferty, pasek „Zadzwoń / Zapytaj”
  przyklejony na dole ekranu telefonu,
- oferta zarezerwowana: informacja i przycisk „Zapytaj o podobne”,
- **oferta poza rynkiem** (`visibility: 'link'`): nie ma jej na listach ani w wyszukiwarkach
  (noindex), otwiera się tylko z linku od biura. Przykład: `oferta.html?id=kamienica-podgorze`,
- nieistniejąca oferta: komunikat i najnowsze oferty.

Podgląd linku w komunikatorach (zdjęcie i cena w WhatsAppie czy Messengerze) wymaga małego skryptu
po stronie serwera, więc w demie jest ogólny. Dojdzie razem z panelem.

### Dodawanie ofert w demie

Skopiuj jeden obiekt w `js/offers-data.js`, zmień `id` (adres oferty), `number`, teksty i liczby.
Pola `price` i `areaValue` to liczby (filtry i sortowanie), a `area`, `priceNote` to teksty do
wyświetlenia. Zdjęcia dodasz w `photos: ['img/oferta-1.jpg', ...]`; wtedy galeria i karta
pokażą zdjęcia zamiast rysunków.

### Biblioteki

- `vendor/maplibre/`: MapLibre GL JS 5.24.0 (licencja BSD-3, plik `LICENSE.txt`).
- Mapa: OpenFreeMap, © OpenMapTiles, dane © autorzy OpenStreetMap (podpis wyświetla się na mapie).


## Składanie stron (nagłówek, stopka, metadane)

Nagłówek i stopka są w `partials/`. Po każdej zmianie w nich uruchom:

```
python3 tools/build_pages.py
```

Skrypt wstawia je do wszystkich stron (na podstronach zamienia `#kotwice` na `index.html#kotwice`),
generuje metadane (tytuł, opis, podgląd linku, favicona) oraz `sitemap.xml` i `robots.txt`.
Na górze skryptu są dwa ustawienia:

- `SITE_URL`: adres strony. Teraz `https://dominikszewczyk224180.github.io/SwietneLokalizacje/`.
  Jeśli repozytorium nazywa się inaczej, popraw i uruchom skrypt, bo inaczej podgląd linku
  (obrazek w WhatsAppie i Messengerze) się nie wczyta. Przy starcie: `https://www.swietnelokalizacje.pl/`.
- `DEMO = True`: pasek „Wersja demonstracyjna” na górze stron i blokada indeksowania w Google
  (fikcyjne oferty pod marką klienta nie powinny trafić do wyszukiwarki). Przy starcie `False`.

## Strony

- `index.html`: strona główna,
- `oferty.html`: lista ofert,
- `oferta.html?id=...`: karta oferty,
- `polityka-prywatnosci.html`: wzór polityki prywatności (miejsca w nawiasach kwadratowych do
  uzupełnienia; przed publikacją do sprawdzenia przez prawnika),
- `404.html`: strona „Tu jeszcze nic nie stoi” (GitHub Pages pokazuje ją dla błędnych adresów).

## Jakość (Lighthouse, telefon)

| Strona | Wydajność | Dostępność | Dobre praktyki |
|---|---|---|---|
| Strona główna | 97 | 100 | 100 |
| Oferty | 98 | 100 | 100 |
| Karta oferty | 92 | 100 | 100 |
| Polityka prywatności | 99 | 100 | 100 |

SEO pokazuje teraz 66 tylko dlatego, że demo ma blokadę indeksowania; po `DEMO = False` jest 100.
Testy automatyczne: 6 stron na szerokościach od 320 do 1920 px, bez błędów w konsoli, bez
przewijania w bok, wszystkie linki i kotwice działają, jeden nagłówek H1 na stronę.

## Przed startem (lista kontrolna)

- [ ] logo klienta w nagłówku i stopce (`partials/`), telefon, adres i NIP (stopka, kontakt, polityka),
- [ ] polityka prywatności uzupełniona i sprawdzona przez prawnika,
- [ ] prawdziwe oferty i zdjęcia (docelowo z panelu),
- [ ] `SITE_URL` na domenę klienta, `DEMO = False`, `python3 tools/build_pages.py`,
- [ ] wysyłka formularzy i podgląd linku konkretnej oferty (skrypt na serwerze, etap z panelem).

## Co jest w paczce

```
index.html              strona główna
oferty.html             lista ofert z filtrami
oferta.html             karta oferty (oferta.html?id=...)
css/tokens.css          kolory, typografia, odstępy, ruch (jedno źródło prawdy)
css/base.css            font, reset, przyciski, focus
css/header.css          nagłówek i menu mobilne
css/hero.css            hero i rysunek
css/sections.css        sekcje strony głównej, formularze i stopka
css/offers.css          karty ofert, lista, karta oferty, galeria, wydruk
js/hero.js              zakreślanie budynków, panorama na telefonie
js/header.js            menu mobilne
js/offers-data.js       oferty przykładowe (DEMO) i dane biura
js/offers-core.js       wspólne: formatowanie, rysunki, rzuty, karta oferty
js/offers.js            sekcja ofert na stronie głównej
js/offers-list.js       lista ofert: filtry, sortowanie, adres strony
js/offer-detail.js      karta oferty: galeria, mapa, udostępnianie, zapytanie
js/contact.js           formularz zapytania
fonts/                  Archivo (zmienny: waga i szerokość), łacina z polskimi znakami, licencja OFL
partials/               wspólny nagłówek (z paskiem demo) i stopka
tools/build_pages.py    składa strony z partials/, metadane, sitemap.xml, robots.txt
tools/build_drawing.py  generator rysunku w hero (wstawia SVG do index.html)
img/                    obrazek podglądu linku (1200 × 630) i ikona na ekran telefonu
favicon.svg             ikona w karcie przeglądarki
tools/build_preview.py  składa każdą stronę w jeden plik podglądu (podglad*.html)
vendor/maplibre/        biblioteka mapy
```

## Uruchomienie i GitHub Pages

Wystarczy otworzyć `index.html` w przeglądarce (albo `python3 -m http.server` i `http://localhost:8000`).
Na GitHub Pages: publiczne repozytorium, Settings, Pages, Deploy from a branch: `main`, folder `/ (root)`.

## Co jest tymczasowe

- Znak i nazwa w nagłówku i stopce: do podmiany na logo klienta.
- Telefon +48 000 000 000 i dane firmy (adres, NIP): do uzupełnienia.
- Oferty i ceny są przykładowe.
