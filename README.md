# Świetne Lokalizacje: nowa strona, etap 1 (hero)

Demo pierwszego ekranu strony dla biura nieruchomości komercyjnych Świetne Lokalizacje z Krakowa.
Czysty HTML, CSS i JavaScript, bez frameworka i bez kroku budowania.

## Co jest w paczce

```
index.html               strona: nagłówek, menu mobilne, hero
css/tokens.css           kolory, typografia, odstępy, ruch (jedno źródło prawdy)
css/base.css             fonty, reset, przyciski, focus
css/header.css           nagłówek i menu mobilne
css/hero.css             hero: mapa, treść, karta oferty
js/hero-map-data.js      dane mapy i przykładowych ofert (generowane, nie edytować ręcznie)
js/hero.js               rysowanie mapy, strefy dojścia, przełączanie ofert
js/header.js             menu mobilne
fonts/                   Półtawski Nowy i Archivo, przycięte do łaciny z polskimi znakami (licencja OFL)
tools/build_hero_map.py  generator danych mapy i stref dojścia
tools/build_preview.py   składa wszystko w jeden plik podglad.html
```

## Uruchomienie

Wystarczy otworzyć `index.html` w przeglądarce (skrypty są klasyczne, więc działa też z dysku).
Wygodniej z lokalnym serwerem: `python3 -m http.server` w folderze projektu i `http://localhost:8000`.

## GitHub Pages

1. Wrzuć zawartość folderu do repozytorium (na darmowym koncie musi być publiczne).
2. Settings, Pages, Deploy from a branch: `main`, folder `/ (root)`.
3. Folder `tools/.cache` jest w `.gitignore`, nie trafia do repozytorium.

## Co jest tymczasowe

- Znak i nazwa w nagłówku: do podmiany na logo klienta (komentarz w `index.html`).
- Telefon +48 000 000 000: do uzupełnienia.
- Trzy oferty i ich ceny są przykładowe (tak jest też napisane na stronie). Lokalizacje są przybliżone.
- Linki w menu prowadzą do sekcji, które powstaną w kolejnych etapach.

## Jak działają strefy dojścia

Strefa dojścia (izochrona) to obszar, do którego dojdziesz pieszo w danym czasie, liczony po ulicach, a nie w linii prostej.

- Sieć: około 17 tysięcy odcinków ulic z OpenStreetMap. W danych są tylko ulice z nazwą, więc generator dokłada krótkie łączniki piesze (ślepe końce do 45 m, przejścia przez Planty do 130 m, bliskie ulice do 30 m, nigdy przez Wisłę) oraz kładkę Ojca Bernatka.
- Tempo: 80 m na minutę (około 4,8 km/h). Strefy 5, 10 i 15 minut.
- Statystyki w karcie (przystanki i linie w 5 min, najbliższy przystanek, dojście na Rynek Główny) są liczone po sieci, z danych przystanków KMK.
- Bieg Wisły wyliczony z granic dzielnic (granica północ/południe biegnie osią rzeki), sprawdzony na mostach.

Zmiana ofert demo: lista `OFFERS` w `tools/build_hero_map.py`, potem:

```
pip install shapely numpy networkx scipy
python3 tools/build_hero_map.py
python3 tools/build_preview.py   # opcjonalnie, nowy podglad.html
```

Przy pierwszym uruchomieniu generator sam pobiera dane źródłowe do `tools/.cache`.
W etapie z panelem strefy dla prawdziwych ofert będzie liczył backend (OpenRouteService) przy zapisie oferty.

## Źródła danych i licencje

- Ulice i bieg Wisły: OpenStreetMap, licencja ODbL. Podpis „© autorzy OpenStreetMap” musi być widoczny na stronie (jest pod mapą).
  Eksport Overpass z repozytorium slotocki/ulice_krakowa, granice dzielnic z andilabs/krakow-dzielnice-geojson.
- Przystanki i trasy tramwajowe: dane GTFS ZTP Kraków, przetworzone w repozytorium Miqell24/krakow-bus-map.
- Fonty: Półtawski Nowy (digitalizacja antykwy Adama Półtawskiego) i Archivo, licencja SIL Open Font License (pliki w `fonts/`).

## Dostępność i wydajność

- Pełna obsługa klawiatury (pinezki to przyciski), widoczny focus, opisy dla czytników ekranu.
- Przy ustawieniu ograniczonego ruchu animacje są wyłączone, strona od razu pokazuje stan końcowy.
- Mapa to cztery warstwy SVG, dane ważą około 105 KB (po kompresji na GitHub Pages znacznie mniej), fonty około 180 KB.
