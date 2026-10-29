# Świetne Lokalizacje: nowa strona, etapy 1 i 2

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

## Co jest w paczce

```
index.html              cała strona główna
css/tokens.css          kolory, typografia, odstępy, ruch (jedno źródło prawdy)
css/base.css            font, reset, przyciski, focus
css/header.css          nagłówek i menu mobilne
css/hero.css            hero i rysunek
css/sections.css        sekcje strony głównej i stopka
js/hero.js              zakreślanie budynków, panorama na telefonie
js/header.js            menu mobilne
js/offers-data.js       oferty przykładowe (DEMO)
js/offers.js            filtr, karty, stany sekcji ofert
js/contact.js           formularz zapytania
fonts/                  Archivo (zmienny: waga i szerokość), łacina z polskimi znakami, licencja OFL
tools/build_drawing.py  generator rysunku w hero (wstawia SVG do index.html)
tools/build_preview.py  składa wszystko w jeden plik podglad.html
```

## Uruchomienie i GitHub Pages

Wystarczy otworzyć `index.html` w przeglądarce (albo `python3 -m http.server` i `http://localhost:8000`).
Na GitHub Pages: publiczne repozytorium, Settings, Pages, Deploy from a branch: `main`, folder `/ (root)`.

## Co jest tymczasowe

- Znak i nazwa w nagłówku i stopce: do podmiany na logo klienta.
- Telefon +48 000 000 000 i dane firmy (adres, NIP): do uzupełnienia.
- Oferty i ceny są przykładowe.
- Link do polityki prywatności i karty ofert prowadzą do stron z kolejnych etapów.
