/* =====================================================================
   Oferty przykładowe (DEMO). Pola odpowiadają przyszłemu API: po podłączeniu
   panelu dane przyjdą z serwera, a strony ofert zostaną bez zmian.

   type        lokale | biura | magazyny | grunty    (filtry)
   deal        najem | sprzedaz
   visibility  public | link   (link: oferta poza rynkiem, nie ma jej na listach,
                               otwiera się tylko z linku od biura)
   status      aktywna | rezerwacja
   drawing     shop | gastro | townhouse | modern | office | hall | plot
               (rysunek zastępczy, dopóki biuro nie doda zdjęć)
   photos      lista adresów zdjęć; pusta = galeria z rysunków
   price       liczba w zł netto (najem: miesięcznie) albo null = cena na zapytanie
   coords      [długość, szerokość] geograficzna, środek okolicy (lokalizacja przybliżona)
   plan        dane do rzutu poglądowego w galerii
   Podgląd stanów list: ?oferty=0, ?oferty=2
   ===================================================================== */
window.SL_AGENCY = {
  name: 'Świetne Lokalizacje',
  email: 'biuro@swietnelokalizacje.pl',
  phone: '+48 000 000 000', // tymczasowy
  phoneHref: '+48000000000'
};

window.SL_OFFERS = [
  {
    id: 'lokal-kazimierz', number: 'SL-1042', added: '2026-10-24',
    type: 'lokale', deal: 'najem', visibility: 'public', status: 'aktywna',
    kind: 'Lokal usługowy', title: 'Lokal z witryną przy ruchliwej ulicy',
    city: 'Kraków', district: 'Kazimierz', coords: [19.9447, 50.0516],
    areaValue: 86, area: '86 m²', price: 12900, priceNote: 'netto / mies.',
    badge: 'Nowość', drawing: 'shop', photos: [],
    lead: 'Parter kamienicy, duża witryna od chodnika i wejście prosto z ulicy.',
    description: [
      'Lokal na parterze kamienicy przy jednej z bardziej uczęszczanych ulic Kazimierza. Duża witryna od strony chodnika i wejście prosto z ulicy sprawiają, że punkt widać z daleka, a klient trafia do środka bez szukania.',
      'Wnętrze ma regularny kształt i wysokość 3,6 m, co ułatwia aranżację pod sklep, usługi albo kawiarnię. Z tyłu jest zaplecze z WC i magazynkiem. Po drobnym odświeżeniu można prowadzić działalność.'
    ],
    features: ['Witryna 7,2 m od strony ulicy', 'Wejście bezpośrednio z chodnika', 'Ruch pieszy przez cały dzień', 'Zaplecze z WC i magazynkiem'],
    location: [['Ruch pieszy', 'Wysoki, ulica handlowo-usługowa'], ['Komunikacja', 'Tramwaj i autobus w kilka minut pieszo'], ['Parking', 'Strefa płatnego parkowania'], ['Otoczenie', 'Gastronomia, usługi, ruch turystyczny']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Lokal usługowy'], ['Transakcja', 'Najem'], ['Powierzchnia', '86 m²'], ['Piętro', 'parter'], ['Dostępny', 'od 1 grudnia 2026']]],
      ['Lokal', [['Witryna', '7,2 m od ulicy'], ['Wejście', 'bezpośrednio z chodnika'], ['Wysokość', '3,6 m'], ['Zaplecze', 'tak, z WC'], ['Przeznaczenie', 'usługi, handel, kawiarnia']]],
      ['Media i koszty', [['Moc przyłączeniowa', '30 kW'], ['Ogrzewanie', 'miejskie'], ['Opłaty eksploatacyjne', 'ok. 900 zł netto / mies.'], ['Kaucja', 'trzymiesięczna'], ['Umowa', 'minimum 3 lata']]],
      ['Dokumenty', [['Świadectwo energetyczne', 'w przygotowaniu'], ['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '12,4 m', d: '6,9 m', rooms: [['Sala', '64 m²'], ['Zaplecze', '16 m²'], ['WC', '6 m²']] }
  },
  {
    id: 'biuro-stare-miasto', number: 'SL-1046', added: '2026-10-27',
    type: 'biura', deal: 'najem', visibility: 'public', status: 'aktywna',
    kind: 'Biuro', title: 'Biuro w kamienicy przy Plantach',
    city: 'Kraków', district: 'Stare Miasto', coords: [19.9338, 50.0636],
    areaValue: 210, area: '210 m²', price: 16800, priceNote: 'netto / mies.',
    badge: 'Nowość', drawing: 'townhouse', photos: [],
    lead: 'Pierwsze piętro zabytkowej kamienicy, okna na park, siedem pokoi.',
    description: [
      'Biuro na pierwszym piętrze zabytkowej kamienicy przy Plantach, z oknami od strony parku. Reprezentacyjna klatka schodowa i wysokie wnętrza robią dobre wrażenie na klientach.',
      'Układ to siedem pokoi, recepcja i sala konferencyjna, więc biuro pasuje kancelarii, gabinetom albo firmie doradczej. Instalacje są po remoncie, można się wprowadzić od razu.'
    ],
    features: ['Okna na Planty', 'Reprezentacyjna klatka schodowa', '7 pokoi i sala konferencyjna', 'Po remoncie, dostępne od zaraz'],
    location: [['Adres', 'Ścisłe centrum, przy Plantach'], ['Komunikacja', 'Tramwaje i autobusy w kilka minut'], ['Parking', 'Strefa płatna, parkingi w pobliżu'], ['Otoczenie', 'Kancelarie, banki, urzędy']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Biuro'], ['Transakcja', 'Najem'], ['Powierzchnia', '210 m²'], ['Piętro', '1 z 4'], ['Dostępne', 'od zaraz']]],
      ['Biuro', [['Układ', '7 pokoi, recepcja, sala konferencyjna'], ['Standard', 'po remoncie, kamienica zabytkowa'], ['Klimatyzacja', 'w części pomieszczeń'], ['Internet', 'światłowód']]],
      ['Koszty', [['Opłaty eksploatacyjne', '2 300 zł netto / mies.'], ['Kaucja', 'dwumiesięczna'], ['Umowa', 'minimum 3 lata']]],
      ['Dokumenty', [['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '18,0 m', d: '11,7 m', rooms: [['Pokoje (7)', '132 m²'], ['Sala konferencyjna', '32 m²'], ['Recepcja', '24 m²'], ['Kuchnia i WC', '22 m²']] }
  },
  {
    id: 'biuro-zablocie', number: 'SL-1038', added: '2026-10-19',
    type: 'biura', deal: 'najem', visibility: 'public', status: 'aktywna',
    kind: 'Biuro', title: 'Biuro typu loft z windą i parkingiem',
    city: 'Kraków', district: 'Zabłocie', coords: [19.9640, 50.0478],
    areaValue: 140, area: '140 m²', price: 10500, priceNote: 'netto / mies.',
    badge: null, drawing: 'office', photos: [],
    lead: 'Rewitalizowana fabryka, wysokie stropy, open space i dwie sale spotkań.',
    description: [
      'Biuro w budynku dawnej fabryki na Zabłociu, po pełnej rewitalizacji. Wysokie stropy, duże okna i ceglane ściany dają charakter, a nowe instalacje zapewniają komfort na co dzień.',
      'Układ to open space na około 16 stanowisk, dwie sale spotkań i kuchnia. W cenie jest dostęp do wspólnej recepcji, a w garażu podziemnym można wynająć dwa miejsca postojowe.'
    ],
    features: ['Wysokie stropy i duże okna', 'Dwie sale spotkań i kuchnia', 'Winda i garaż podziemny', 'Klimatyzacja i światłowód'],
    location: [['Komunikacja', 'Tramwaj i przystanek kolejowy w kilka minut'], ['Dojazd', 'Blisko mostów i drogi do centrum'], ['Parking', 'Garaż w budynku, płatna strefa wokół'], ['Otoczenie', 'Biura, kawiarnie, muzea, nowe osiedla']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Biuro'], ['Transakcja', 'Najem'], ['Powierzchnia', '140 m²'], ['Piętro', '2 z 4'], ['Dostępne', 'od zaraz']]],
      ['Biuro', [['Układ', 'open space, 2 sale spotkań, kuchnia'], ['Standard', 'loft po rewitalizacji'], ['Klimatyzacja', 'tak'], ['Internet', 'światłowód'], ['Winda', 'tak']]],
      ['Koszty i parking', [['Opłaty eksploatacyjne', '16 zł/m² netto / mies.'], ['Parking', '2 miejsca w garażu, 250 zł netto / mies. za miejsce'], ['Kaucja', 'dwumiesięczna'], ['Umowa', 'minimum 2 lata']]],
      ['Dokumenty', [['Świadectwo energetyczne', 'dostępne'], ['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '14,0 m', d: '10,0 m', rooms: [['Open space', '86 m²'], ['Sala 1', '18 m²'], ['Sala 2', '14 m²'], ['Kuchnia', '12 m²'], ['WC', '10 m²']] }
  },
  {
    id: 'lokal-grzegorzki', number: 'SL-1035', added: '2026-10-15',
    type: 'lokale', deal: 'sprzedaz', visibility: 'public', status: 'aktywna',
    kind: 'Lokal handlowy', title: 'Lokal z najemcą sieciowym, umowa do 2031',
    city: 'Kraków', district: 'Grzegórzki', coords: [19.9575, 50.0585],
    areaValue: 62, area: '62 m²', price: 1190000, priceNote: 'netto, stopa zwrotu 7,1%',
    badge: 'Inwestycja', drawing: 'shop', photos: [],
    lead: 'Gotowa inwestycja: wynajęty lokal z czynszem waloryzowanym co roku.',
    description: [
      'Gotowa inwestycja: lokal handlowy wynajęty sieci z branży spożywczej na długi okres. Najemca płaci czynsz regularnie, a umowa obowiązuje do 2031 roku z coroczną waloryzacją.',
      'Lokal jest na parterze budynku z dużym zapleczem mieszkaniowym, przy ulicy z ruchem lokalnym i dobrą komunikacją. Dla inwestora oznacza to przewidywalny przychód bez szukania najemcy.'
    ],
    features: ['Najemca sieciowy z umową do 2031', 'Czynsz waloryzowany co roku', 'Stopa zwrotu 7,1% brutto', 'Odrębna własność z księgą wieczystą'],
    location: [['Otoczenie', 'Osiedla mieszkaniowe, biura, szkoły'], ['Komunikacja', 'Tramwaj przy rondzie, kilka minut pieszo'], ['Parking', 'Miejsca wzdłuż ulicy'], ['Ruch', 'Lokalny, codzienne zakupy']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Lokal handlowy'], ['Transakcja', 'Sprzedaż'], ['Powierzchnia', '62 m²'], ['Piętro', 'parter'], ['Stan', 'wynajęty']]],
      ['Inwestycja', [['Najemca', 'sieć handlowa, branża spożywcza'], ['Umowa najmu', 'do 2031 roku'], ['Czynsz z umowy', '7 050 zł netto / mies.'], ['Waloryzacja', 'coroczna, o wskaźnik inflacji'], ['Stopa zwrotu', '7,1% brutto']]],
      ['Prawo i dokumenty', [['Forma własności', 'odrębna własność lokalu'], ['Księga wieczysta', 'założona'], ['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '9,0 m', d: '6,9 m', rooms: [['Sala sprzedaży', '48 m²'], ['Zaplecze', '10 m²'], ['WC', '4 m²']] }
  },
  {
    id: 'lokal-bronowice', number: 'SL-1029', added: '2026-10-02',
    type: 'lokale', deal: 'sprzedaz', visibility: 'public', status: 'aktywna',
    kind: 'Lokal usługowy', title: 'Narożny lokal z dwiema witrynami',
    city: 'Kraków', district: 'Bronowice', coords: [19.8890, 50.0790],
    areaValue: 95, area: '95 m²', price: 1045000, priceNote: 'netto + VAT',
    badge: null, drawing: 'modern', photos: [],
    lead: 'Nowy budynek, stan deweloperski, miejsce postojowe w cenie.',
    description: [
      'Narożny lokal na parterze nowego budynku w Bronowicach, z dwiema witrynami i osobnym wejściem od ulicy. Lokal jest w stanie deweloperskim, więc wnętrze urządzisz od zera pod własną działalność.',
      'Wokół powstało kilka dużych osiedli, a w okolicy wciąż brakuje usług na co dzień. Do lokalu należy miejsce postojowe w garażu podziemnym.'
    ],
    features: ['Narożnik z dwiema witrynami', 'Stan deweloperski', 'Miejsce postojowe w cenie', 'Nowe osiedla dookoła'],
    location: [['Otoczenie', 'Nowe osiedla, mało usług w okolicy'], ['Komunikacja', 'Tramwaj i autobus w pobliżu'], ['Parking', 'Miejsca przed budynkiem i garaż'], ['Ruch pieszy', 'Średni, rośnie razem z osiedlami']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Lokal usługowy'], ['Transakcja', 'Sprzedaż'], ['Powierzchnia', '95 m²'], ['Piętro', 'parter'], ['Stan', 'deweloperski']]],
      ['Lokal', [['Witryny', 'dwie, narożne'], ['Wejście', 'osobne, od ulicy'], ['Wysokość', '3,3 m'], ['Miejsce postojowe', 'w cenie, garaż podziemny']]],
      ['Prawo i dokumenty', [['Forma własności', 'odrębna własność lokalu'], ['Faktura VAT', 'tak'], ['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '11,0 m', d: '8,6 m', rooms: [['Sala', '82 m²'], ['Zaplecze', '9 m²'], ['WC', '4 m²']] }
  },
  {
    id: 'hala-skawina', number: 'SL-1031', added: '2026-10-08',
    type: 'magazyny', deal: 'najem', visibility: 'public', status: 'aktywna',
    kind: 'Hala magazynowa', title: 'Hala z częścią biurową i dwoma dokami',
    city: 'Skawina', district: 'strefa przemysłowa', coords: [19.8270, 49.9800],
    areaValue: 1200, area: '1 200 m²', price: 26400, priceNote: 'netto / mies.',
    badge: 'Na wyłączność', drawing: 'hall', photos: [],
    lead: 'Dwa doki, brama na poziomie terenu, wysokość składowania 9 m.',
    description: [
      'Hala w strefie przemysłowej Skawiny z częścią biurową i socjalną. Dwa doki i brama na poziomie terenu pozwalają obsługiwać zarówno naczepy, jak i dostawy mniejszymi autami.',
      'Wysokość składowania 9 m i posadzka o nośności 5 t/m² sprawdzą się w magazynie regałowym albo lekkiej produkcji. Teren jest ogrodzony i chroniony całą dobę, a dojazd do obwodnicy Krakowa zajmuje kilkanaście minut.'
    ],
    features: ['Dwa doki i brama na poziomie 0', 'Wysokość składowania 9 m', 'Biuro i zaplecze socjalne w cenie', 'Ochrona całodobowa'],
    location: [['Dojazd', 'Kilkanaście minut do obwodnicy Krakowa'], ['Dla ciężarówek', 'Plac manewrowy i wygodny wjazd'], ['Otoczenie', 'Strefa przemysłowo-logistyczna'], ['Pracownicy', 'Autobus do Krakowa w pobliżu']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Hala magazynowa'], ['Transakcja', 'Najem'], ['Powierzchnia', '1 200 m², w tym biuro 120 m²'], ['Dostępna', 'od stycznia 2027']]],
      ['Hala', [['Wysokość składowania', '9 m'], ['Doki', '2, plus brama na poziomie 0'], ['Posadzka', 'nośność 5 t/m²'], ['Siatka słupów', '12 × 24 m'], ['Ogrzewanie', 'nagrzewnice gazowe']]],
      ['Koszty i teren', [['Opłaty eksploatacyjne', '3,5 zł/m² netto / mies.'], ['Plac manewrowy', 'wspólny, dla aut ciężarowych'], ['Ochrona', 'całodobowa'], ['Umowa', 'minimum 3 lata']]],
      ['Dokumenty', [['Ogłoszenie', 'pośrednika, umowa na wyłączność']]]
    ],
    plan: { w: '50,0 m', d: '24,0 m', docks: 2, gates: 1, rooms: [['Strefa składowania', '1 080 m²'], ['Biuro i socjal', '120 m²']] }
  },
  {
    id: 'magazyn-nowa-huta', number: 'SL-1021', added: '2026-09-20',
    type: 'magazyny', deal: 'najem', visibility: 'public', status: 'aktywna',
    kind: 'Magazyn', title: 'Magazyn z placem manewrowym',
    city: 'Kraków', district: 'Nowa Huta', coords: [20.0650, 50.0700],
    areaValue: 650, area: '650 m²', price: 15600, priceNote: 'netto / mies.',
    badge: null, drawing: 'hall', photos: [],
    lead: 'Dwie bramy na poziomie terenu, własny plac 800 m², opłaty w cenie.',
    description: [
      'Magazyn w strefie przemysłowej Nowej Huty, z dwiema bramami na poziomie terenu i własnym utwardzonym placem. Dobre miejsce na hurtownię, serwis albo magazyn firmy usługowej.',
      'W budynku jest małe biuro z zapleczem. Opłaty eksploatacyjne są w cenie najmu, co ułatwia planowanie kosztów.'
    ],
    features: ['Plac utwardzony 800 m²', 'Dwie bramy na poziomie terenu', 'Biuro z zapleczem', 'Opłaty w cenie najmu'],
    location: [['Dojazd', 'Dobry wyjazd na drogi wylotowe'], ['Dla dostawczych', 'Plac i wygodny wjazd'], ['Otoczenie', 'Strefa przemysłowa i usługowa'], ['Komunikacja', 'Tramwaj w okolicy']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Magazyn'], ['Transakcja', 'Najem'], ['Powierzchnia', '650 m², w tym biuro 40 m²'], ['Dostępny', 'od zaraz']]],
      ['Magazyn', [['Wysokość', '7 m'], ['Bramy', '2 na poziomie 0'], ['Plac', '800 m², utwardzony'], ['Posadzka', 'przemysłowa'], ['Ogrzewanie', 'tak']]],
      ['Koszty', [['Opłaty eksploatacyjne', 'w cenie najmu'], ['Kaucja', 'dwumiesięczna'], ['Umowa', 'minimum 2 lata']]],
      ['Dokumenty', [['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '32,5 m', d: '20,0 m', docks: 0, gates: 2, rooms: [['Magazyn', '610 m²'], ['Biuro i socjal', '40 m²']] }
  },
  {
    id: 'dzialka-wieliczka', number: 'SL-1027', added: '2026-09-30',
    type: 'grunty', deal: 'sprzedaz', visibility: 'public', status: 'aktywna',
    kind: 'Działka inwestycyjna', title: 'Działka usługowa przy drodze wojewódzkiej',
    city: 'Wieliczka', district: null, coords: [20.0420, 49.9965],
    areaValue: 12000, area: '1,2 ha', price: 3600000, priceNote: 'netto',
    badge: null, drawing: 'plot', photos: [],
    lead: 'Plan miejscowy pod usługi i handel, długi front do drogi.',
    description: [
      'Płaska działka o regularnym kształcie, z długim frontem do drogi wojewódzkiej. Plan miejscowy przewiduje zabudowę usługową i handlową, więc teren nadaje się pod park handlowy, salon, stację albo obiekt usługowy.',
      'Media są w działce lub w drodze, a zjazd z drogi wojewódzkiej ułatwia obsługę klientów i dostaw. Działka leży przy wylotowej trasie, wzdłuż której przybywa nowych osiedli.'
    ],
    features: ['Plan miejscowy: usługi i handel', 'Front do drogi wojewódzkiej', 'Media w działce lub w drodze', 'Regularny kształt, teren płaski'],
    location: [['Dojazd', 'Bezpośrednio z drogi wojewódzkiej'], ['Ruch', 'Duży ruch samochodowy przez cały dzień'], ['Otoczenie', 'Nowe osiedla i usługi'], ['Rozwój', 'Okolica szybko się zabudowuje']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Działka inwestycyjna'], ['Transakcja', 'Sprzedaż'], ['Powierzchnia', '1,2 ha (12 000 m²)'], ['Kształt', 'prostokąt, ok. 80 × 150 m'], ['Teren', 'płaski']]],
      ['Plan miejscowy', [['Przeznaczenie', 'usługi i handel (U)'], ['Wysokość zabudowy', 'do 12 m'], ['Powierzchnia zabudowy', 'do 50%'], ['Dostęp do drogi', 'zjazd z drogi wojewódzkiej']]],
      ['Media', [['Prąd', 'w działce'], ['Woda', 'w drodze'], ['Kanalizacja', 'w drodze'], ['Gaz', 'w pobliżu']]],
      ['Dokumenty', [['Forma własności', 'własność'], ['Księga wieczysta', 'uregulowana'], ['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '80 m', d: '150 m', road: 'droga wojewódzka', rooms: [['Działka', '1,2 ha'], ['Możliwa zabudowa', 'do 6 000 m²']] }
  },
  {
    id: 'gastronomia-stare-miasto', number: 'SL-1024', added: '2026-09-26',
    type: 'lokale', deal: 'najem', visibility: 'public', status: 'rezerwacja',
    kind: 'Lokal gastronomiczny', title: 'Lokal pod gastronomię z ogródkiem',
    city: 'Kraków', district: 'Stare Miasto', coords: [19.9395, 50.0605],
    areaValue: 120, area: '120 m²', price: 18000, priceNote: 'netto / mies.',
    badge: 'Rezerwacja', drawing: 'gastro', photos: [],
    lead: 'Kanał wentylacyjny nad dach, zaplecze kuchenne, ogródek w sezonie.',
    description: [
      'Lokal przygotowany pod gastronomię kilka minut od Rynku Głównego. Ma kanał wentylacyjny wyprowadzony nad dach, zaplecze kuchenne z instalacjami i salę na około 50 miejsc.',
      'W sezonie przed lokalem działa ogródek. Do lokalu należy piwnica, która sprawdzi się jako magazyn albo dodatkowa sala. Obecnie trwają rozmowy z zainteresowanym najemcą.'
    ],
    features: ['Kanał wentylacyjny nad dach', 'Zaplecze kuchenne z instalacjami', 'Ogródek sezonowy', 'Piwnica 30 m²'],
    location: [['Ruch pieszy', 'Bardzo wysoki, trasa turystyczna'], ['Otoczenie', 'Restauracje, hotele, kultura'], ['Dostawy', 'Wjazd w wyznaczonych godzinach'], ['Komunikacja', 'Tramwaje przy Plantach']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Lokal gastronomiczny'], ['Transakcja', 'Najem'], ['Powierzchnia', '120 m², plus piwnica 30 m²'], ['Piętro', 'parter'], ['Dostępny', 'od lutego 2027']]],
      ['Gastronomia', [['Kanał wentylacyjny', 'tak, nad dach'], ['Kuchnia', 'zaplecze z instalacjami'], ['Sala', 'ok. 50 miejsc'], ['Ogródek', 'sezonowy, ok. 20 miejsc']]],
      ['Koszty', [['Opłaty eksploatacyjne', 'ok. 1 400 zł netto / mies.'], ['Kaucja', 'trzymiesięczna'], ['Umowa', 'minimum 5 lat']]],
      ['Dokumenty', [['Ogłoszenie', 'pośrednika, umowa z właścicielem']]]
    ],
    plan: { w: '14,0 m', d: '8,6 m', rooms: [['Sala', '78 m²'], ['Kuchnia', '28 m²'], ['WC i szatnia', '14 m²']] }
  },
  {
    id: 'kamienica-podgorze', number: 'SL-1050', added: '2026-10-28',
    type: 'lokale', deal: 'sprzedaz', visibility: 'link', status: 'aktywna',
    kind: 'Kamienica', title: 'Kamienica pod inwestycję w Podgórzu',
    city: 'Kraków', district: 'Podgórze', coords: [19.9560, 50.0440],
    areaValue: 640, area: '640 m²', price: null, priceNote: 'cena na zapytanie',
    badge: 'Poza rynkiem', drawing: 'townhouse', photos: [],
    lead: 'Dwanaście lokali, część wynajęta, poddasze do adaptacji.',
    description: [
      'Kamienica w Podgórzu sprzedawana dyskretnie, bez publicznego ogłoszenia. Budynek ma dwanaście lokali, w tym dwa usługowe na parterze, a część z nich jest już wynajęta.',
      'Poddasze można zaadaptować na dodatkowe mieszkania. Szczegóły, dokumenty i termin oględzin udostępniamy po rozmowie z inwestorem.'
    ],
    features: ['12 lokali, w tym 2 usługowe', 'Część lokali wynajęta', 'Możliwa adaptacja poddasza', 'Uregulowana księga wieczysta'],
    location: [['Otoczenie', 'Rewitalizowane Podgórze, blisko Wisły'], ['Komunikacja', 'Tramwaje w kilka minut'], ['Popyt na najem', 'Wysoki, blisko centrum'], ['Rozwój', 'Nowe biura i usługi w okolicy']],
    params: [
      ['Podstawowe', [['Rodzaj', 'Kamienica'], ['Transakcja', 'Sprzedaż'], ['Powierzchnia użytkowa', '640 m²'], ['Kondygnacje', '4 i poddasze'], ['Stan', 'do częściowego remontu']]],
      ['Inwestycja', [['Lokale', '12, w tym 2 usługowe'], ['Najem', '7 lokali wynajętych'], ['Potencjał', 'adaptacja poddasza']]],
      ['Prawo i dokumenty', [['Forma własności', 'własność'], ['Księga wieczysta', 'uregulowana'], ['Ogłoszenie', 'pośrednika, oferta poza rynkiem']]]
    ],
    plan: { w: '20,0 m', d: '12,0 m', caption: 'Piętro typowe, schemat poglądowy', rooms: [['Lokal 1', '48 m²'], ['Lokal 2', '52 m²'], ['Lokal 3', '44 m²'], ['Lokal 4', '46 m²']] }
  }
];
