# Świetne Lokalizacje: nowa strona, etap 1 (hero)

Pierwszy ekran strony biura nieruchomości komercyjnych Świetne Lokalizacje.
Czysty HTML, CSS i JavaScript, bez frameworka i bez kroku budowania.

## Pomysł

Wyśrodkowane hasło klienta i pod nim rysunek techniczny jednej ulicy: lokal w kamienicy, biurowiec,
hala magazynowa i działka inwestycyjna. Opisy na rysunku pokazują, co biuro sprawdza przy analizie
(ruch pieszy, witryna od ulicy, dojazd i komunikacja, standard budynku, parking, doki i rampy,
wysokość hali, front działki, możliwa zabudowa według planu miejscowego).

Rysunek nie zależy od miasta ani od ofert, więc nie wymaga żadnej obsługi, gdy klient dodaje nowe
oferty. Podpisy pod budynkami to linki do ofert danego typu (na razie prowadzą do sekcji `#oferty`,
w etapie z ofertami dostaną filtr).

Zachowanie:
- przy wejściu rysunek kreśli się linia po linii, potem pojawiają się detale i opisy (jeden moment ruchu),
- najechanie na budynek albo jego podpis koloruje go jak zakreślaczem, reszta przygasa,
- na telefonie rysunek jest panoramą do przesuwania palcem, zakreślony jest typ na środku ekranu,
- przy ustawieniu ograniczonego ruchu animacje są wyłączone.

## Co jest w paczce

```
index.html              strona: nagłówek, menu mobilne, hero z rysunkiem
css/tokens.css          kolory, typografia, odstępy, ruch (jedno źródło prawdy)
css/base.css            font, reset, przyciski, focus
css/header.css          nagłówek i menu mobilne
css/hero.css            hero i rysunek
js/hero.js              zakreślanie budynków, panorama na telefonie
js/header.js            menu mobilne
fonts/                  Archivo (zmienny: waga i szerokość), przycięty do łaciny z polskimi znakami, licencja OFL
tools/build_drawing.py  generator rysunku (wstawia SVG do index.html)
tools/build_preview.py  składa wszystko w jeden plik podglad.html
```

## Typografia i kolory

Jeden krój, Archivo, w dwóch rolach: nagłówki w wąskiej, bardzo grubej odmianie (szerokość 72%,
waga 800), tekst w zwykłej szerokości. Paleta: beton (tło), grafit (tekst i kreska), zieleń
przemysłowa (przyciski) i żółty sygnałowy (zakreślacz). Wszystko jest w `css/tokens.css`.

## Uruchomienie

Wystarczy otworzyć `index.html` w przeglądarce. Wygodniej z lokalnym serwerem:
`python3 -m http.server` w folderze projektu i `http://localhost:8000`.

## GitHub Pages

1. Wrzuć zawartość folderu do repozytorium (na darmowym koncie musi być publiczne).
2. Settings, Pages, Deploy from a branch: `main`, folder `/ (root)`.

## Zmiana rysunku

Opisy, budynki i ich położenie są w `tools/build_drawing.py`. Po zmianie:

```
python3 tools/build_drawing.py     # podmienia SVG w index.html
python3 tools/build_preview.py     # opcjonalnie, nowy podglad.html
```

Jeśli przesuniesz budynek, popraw też położenie jego podpisu (`--x` w liście `drawing-labels` w `index.html`).

## Co jest tymczasowe

- Znak i nazwa w nagłówku: do podmiany na logo klienta (komentarz w `index.html`).
- Telefon +48 000 000 000: do uzupełnienia.
- Linki w menu i pod rysunkiem prowadzą do sekcji, które powstaną w kolejnych etapach.
