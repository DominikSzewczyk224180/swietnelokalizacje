/* =====================================================================
   Oferty przykładowe (DEMO). W etapie z backendem te same pola przyjdą
   z API, więc karty i filtry nie będą wymagały zmian.

   type:     lokale | biura | magazyny | grunty   (filtr i rysunek zastępczy)
   drawing:  shop | gastro | office | hall | plot  (rysunek, gdy brak zdjęcia)
   photo:    adres zdjęcia albo null (wtedy karta pokazuje rysunek typu)
   badge:    Nowość | Na wyłączność | Inwestycja | Rezerwacja | null
   Podgląd stanów sekcji: index.html?oferty=0 albo ?oferty=2
   ===================================================================== */
window.SL_OFFERS = [
  {
    id: 'lokal-kazimierz',
    type: 'lokale', drawing: 'shop', photo: null,
    kind: 'Lokal usługowy', deal: 'Najem',
    title: 'Lokal z witryną przy ruchliwej ulicy',
    city: 'Kraków', district: 'Kazimierz',
    area: '86 m²', price: '12 900 zł', priceNote: 'netto / mies.', perM2: '150 zł',
    badge: 'Nowość'
  },
  {
    id: 'biuro-zablocie',
    type: 'biura', drawing: 'office', photo: null,
    kind: 'Biuro', deal: 'Najem',
    title: 'Biuro typu loft z windą i parkingiem',
    city: 'Kraków', district: 'Zabłocie',
    area: '140 m²', price: '10 500 zł', priceNote: 'netto / mies.', perM2: '75 zł',
    badge: null
  },
  {
    id: 'lokal-grzegorzki',
    type: 'lokale', drawing: 'shop', photo: null,
    kind: 'Lokal handlowy', deal: 'Sprzedaż',
    title: 'Lokal z najemcą sieciowym, umowa do 2031',
    city: 'Kraków', district: 'Grzegórzki',
    area: '62 m²', price: '1 190 000 zł', priceNote: 'netto, stopa zwrotu 7,1%', perM2: '19 194 zł',
    badge: 'Inwestycja'
  },
  {
    id: 'hala-skawina',
    type: 'magazyny', drawing: 'hall', photo: null,
    kind: 'Hala magazynowa', deal: 'Najem',
    title: 'Hala z częścią biurową i dwoma dokami',
    city: 'Skawina', district: 'strefa przemysłowa',
    area: '1 200 m²', price: '26 400 zł', priceNote: 'netto / mies.', perM2: '22 zł',
    badge: 'Na wyłączność'
  },
  {
    id: 'dzialka-wieliczka',
    type: 'grunty', drawing: 'plot', photo: null,
    kind: 'Działka inwestycyjna', deal: 'Sprzedaż',
    title: 'Działka usługowa przy drodze wojewódzkiej',
    city: 'Wieliczka', district: null,
    area: '1,2 ha', price: '3 600 000 zł', priceNote: 'netto', perM2: '300 zł',
    badge: null
  },
  {
    id: 'gastronomia-stare-miasto',
    type: 'lokale', drawing: 'gastro', photo: null,
    kind: 'Lokal gastronomiczny', deal: 'Najem',
    title: 'Lokal pod gastronomię z ogródkiem',
    city: 'Kraków', district: 'Stare Miasto',
    area: '120 m²', price: '18 000 zł', priceNote: 'netto / mies.', perM2: '150 zł',
    badge: 'Rezerwacja'
  }
];
