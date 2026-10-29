/* =====================================================================
   Karta oferty (oferta.html?id=...)
   Galeria z pełnym ekranem, parametry, opis, lokalizacja przybliżona
   na mapie, udostępnianie linku, zapytanie o ofertę, podobne oferty.
   ===================================================================== */
(function () {
  'use strict';

  var C = window.SLCore;
  var page = document.querySelector('[data-offer-page]');
  if (!page || !C) return;
  var A = window.SL_AGENCY || { name: 'Świetne Lokalizacje', email: '', phone: '', phoneHref: '' };
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var field = function (name) { return page.querySelector('[data-o="' + name + '"]'); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var id = new URLSearchParams(window.location.search).get('id');
  var o = id ? C.byId(id) : null;

  // link "Oferty" w okruszkach wraca do wyników z tymi samymi filtrami
  var back = $('[data-back]');
  if (back && document.referrer.indexOf('oferty.html') !== -1) back.href = document.referrer;

  if (!o) { notFound(); return; }

  var where = C.place(o);
  var deal = C.DEALS[o.deal];
  var cleanUrl = window.location.href.split('#')[0];

  /* ------------------------------------------------ nagłówek i powiadomienia */
  document.title = o.title + ' | ' + where + ' | ' + A.name;
  setMeta('description', o.kind + ', ' + deal.toLowerCase() + ', ' + o.area + ', ' + where + '. ' + (o.lead || ''));
  field('crumb').textContent = o.title;
  field('meta').innerHTML = '<span>' + C.esc(o.kind) + '</span><span>' + C.esc(deal) + '</span><span>Nr oferty ' + C.esc(o.number) + '</span>' +
    (o.badge ? '<span class="offer-head__badge' + (o.status === 'rezerwacja' ? ' is-muted' : '') + '">' + C.esc(o.badge) + '</span>' : '');
  field('title').innerHTML = C.nb(o.title);
  field('place').textContent = where;

  var notice = $('[data-o-notice]');
  if (o.visibility === 'link') {
    setMeta('robots', 'noindex, nofollow');
    notice.hidden = false;
    notice.innerHTML = '<strong>Oferta poza rynkiem.</strong> ' + C.nb('Nie publikujemy jej na liście ofert ani w wyszukiwarkach. Widzisz ją dzięki linkowi od biura, prosimy o dyskrecję.');
  } else if (o.status === 'rezerwacja') {
    notice.hidden = false;
    notice.innerHTML = '<strong>Oferta zarezerwowana.</strong> ' + C.nb('Trwają rozmowy z najemcą. Zapytaj o podobne nieruchomości albo zostaw kontakt na wypadek, gdyby rezerwacja nie doszła do skutku.');
  }

  /* ------------------------------------------------ galeria */
  var items = C.galleryItems(o);
  var gi = 0;
  var stageItem = $('[data-g-item]');
  var thumbs = $('[data-g-thumbs]');
  var caption = $('[data-g-caption]');
  var counter = $('[data-g-count]');
  $('[data-g-note]').hidden = !items[0].drawn;

  thumbs.innerHTML = items.map(function (it, i) {
    return '<button type="button" class="gallery__thumb" data-g-to="' + i + '" aria-label="Pokaż obraz ' + (i + 1) + ' z ' + items.length + ': ' + C.esc(it.caption) + '">' + it.html + '</button>';
  }).join('');
  function showGallery(i) {
    gi = (i + items.length) % items.length;
    stageItem.innerHTML = items[gi].html;
    stageItem.classList.toggle('is-plan', !!items[gi].plan);
    caption.textContent = items[gi].caption;
    counter.textContent = (gi + 1) + ' / ' + items.length;
    Array.prototype.forEach.call(thumbs.children, function (b, n) { b.setAttribute('aria-current', n === gi ? 'true' : 'false'); });
  }
  thumbs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-g-to]');
    if (b) showGallery(+b.getAttribute('data-g-to'));
  });
  $('[data-g-prev]').addEventListener('click', function () { showGallery(gi - 1); });
  $('[data-g-next]').addEventListener('click', function () { showGallery(gi + 1); });
  var stage = $('[data-g-stage]');
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showGallery(gi - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showGallery(gi + 1); }
    if (e.key === 'Enter') openLightbox();
  });
  swipe(stage, function (dir) { showGallery(gi + dir); }, function (e) {
    if (!e.target.closest('button')) openLightbox();
  });
  $('[data-g-open]').addEventListener('click', openLightbox);
  if (items.length < 2) page.classList.add('gallery-single');
  showGallery(0);

  // pełny ekran
  var lb = $('[data-lightbox]');
  var lbStage = $('[data-lb-stage]');
  function renderLb() {
    lbStage.innerHTML = items[gi].html;
    lbStage.classList.toggle('is-plan', !!items[gi].plan);
    $('[data-lb-caption]').textContent = items[gi].caption;
    $('[data-lb-count]').textContent = (gi + 1) + ' / ' + items.length;
  }
  function openLightbox() {
    if (!lb || typeof lb.showModal !== 'function') return;
    renderLb();
    lb.showModal();
    document.documentElement.classList.add('no-scroll');
  }
  if (lb) {
    lb.addEventListener('close', function () { document.documentElement.classList.remove('no-scroll'); showGallery(gi); stage.focus(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    $('[data-lb-close]').addEventListener('click', function () { lb.close(); });
    $('[data-lb-prev]').addEventListener('click', function () { showGallery(gi - 1); renderLb(); });
    $('[data-lb-next]').addEventListener('click', function () { showGallery(gi + 1); renderLb(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { showGallery(gi - 1); renderLb(); }
      if (e.key === 'ArrowRight') { showGallery(gi + 1); renderLb(); }
    });
    swipe(lbStage, function (dir) { showGallery(gi + dir); renderLb(); });
  }

  /* ------------------------------------------------ parametry, opis, lokalizacja */
  field('params').innerHTML = (o.params || []).map(function (g) {
    return '<section class="params__group"><h3>' + C.esc(g[0]) + '</h3><dl>' +
      g[1].map(function (r) { return '<div><dt>' + C.nb(r[0]) + '</dt><dd>' + C.nb(r[1]) + '</dd></div>'; }).join('') +
      '</dl></section>';
  }).join('');
  field('desc').innerHTML = (o.description || []).map(function (p) { return '<p>' + C.nb(p) + '</p>'; }).join('');
  field('features').innerHTML = (o.features || []).map(function (f) { return '<li>' + C.nb(f) + '</li>'; }).join('');
  field('loc').innerHTML = (o.location || []).map(function (r) { return '<div><dt>' + C.nb(r[0]) + '</dt><dd>' + C.nb(r[1]) + '</dd></div>'; }).join('');
  field('locnote').innerHTML = '<strong>' + C.esc(where) + '.</strong> ' + C.nb('Pokazujemy okolicę, a nie dokładny adres. Adres podajemy przy umawianiu oględzin.');

  /* ------------------------------------------------ cena i kontakt */
  field('deal').textContent = deal;
  field('price').textContent = o.price == null ? 'Cena na zapytanie' : C.money(o.price);
  field('pricenote').innerHTML = o.price == null ? C.nb('Cenę i warunki przedstawiamy po rozmowie.') : C.nb(o.priceNote);
  var facts = [['Powierzchnia', o.area]];
  if (o.price != null) facts.push(['Za m²', C.perM2Label(o)]);
  facts.push(['Nr oferty', o.number], ['Dodano', C.fmtDate(o.added)]);
  field('facts').innerHTML = facts.map(function (f) { return '<div><dt>' + C.esc(f[0]) + '</dt><dd>' + C.nb(f[1]) + '</dd></div>'; }).join('');
  if (o.status === 'rezerwacja') field('ask').textContent = 'Zapytaj o podobne';
  ['call', 'bar-call'].forEach(function (n) { var a = field(n); if (a) a.href = 'tel:' + A.phoneHref; });
  field('legal').innerHTML = C.nb('Ogłoszenie pośrednika: ' + A.name + '. Oferta opublikowana na podstawie umowy z właścicielem. Ceny i parametry mają charakter informacyjny.');

  /* ------------------------------------------------ udostępnianie */
  var shareText = o.title + ', ' + where + ', ' + o.area + ', ' + (o.price == null ? 'cena na zapytanie' : C.money(o.price).replace(/\u00a0/g, ' ') + ' ' + o.priceNote);
  var urlInput = $('[data-share-url]');
  urlInput.value = cleanUrl;
  urlInput.addEventListener('focus', function () { urlInput.select(); });
  $('[data-share-wa]').href = 'https://wa.me/?text=' + encodeURIComponent(shareText + '\n' + cleanUrl);
  $('[data-share-mail]').href = 'mailto:?subject=' + encodeURIComponent('Oferta: ' + o.title) + '&body=' + encodeURIComponent(shareText + '\n\n' + cleanUrl);
  $('[data-share-sms]').href = 'sms:?&body=' + encodeURIComponent(shareText + ' ' + cleanUrl);
  var copyBtn = $('[data-share-copy]');
  copyBtn.addEventListener('click', function () {
    var done = function () {
      copyBtn.textContent = 'Skopiowano';
      setTimeout(function () { copyBtn.textContent = 'Kopiuj link'; }, 2200);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(cleanUrl).then(done, fallbackCopy);
    else fallbackCopy();
    function fallbackCopy() { urlInput.select(); try { document.execCommand('copy'); done(); } catch (err) { /* użytkownik skopiuje ręcznie */ } }
  });
  var nativeBtn = $('[data-share-native]');
  if (navigator.share) {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener('click', function () {
      navigator.share({ title: o.title, text: shareText, url: cleanUrl }).catch(function () {});
    });
  }
  $('[data-print]').addEventListener('click', function () { window.print(); });

  /* ------------------------------------------------ mapa okolicy (ładowana dopiero przy przewinięciu) */
  var mapEl = $('[data-map]');
  var mapStarted = false;
  function mapFallback() {
    if (mapEl.classList.contains('is-ready')) return;
    var c = o.coords;
    mapEl.classList.add('is-fallback');
    mapEl.innerHTML = '<div class="map__fallback"><p>' + C.nb('Mapa okolicy nie wczytała się. Lokalizacja przybliżona: ') + '<strong>' + C.esc(where) + '</strong>.</p>' +
      '<a class="text-link" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=' + c[1] + '&amp;mlon=' + c[0] + '#map=15/' + c[1] + '/' + c[0] + '">Otwórz okolicę w OpenStreetMap</a></div>';
  }
  function startMap() {
    if (mapStarted) return;
    mapStarted = true;
    if (!o.coords) return mapFallback();
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'vendor/maplibre/maplibre-gl.css';
    document.head.appendChild(css);
    var s = document.createElement('script');
    s.src = 'vendor/maplibre/maplibre-gl.js';
    s.onload = initMap;
    s.onerror = mapFallback;
    document.head.appendChild(s);
    setTimeout(function () { if (!mapEl.classList.contains('is-ready')) mapFallback(); }, 12000);
  }
  function initMap() {
    try {
      var center = approx(o.coords, o.id);
      var map = new window.maplibregl.Map({
        container: mapEl,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: center,
        zoom: o.type === 'grunty' || o.type === 'magazyny' ? 13.4 : 14.6,
        cooperativeGestures: true,
        attributionControl: { compact: true }
      });
      map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.on('load', function () {
        map.addSource('area', { type: 'geojson', data: circle(center, o.type === 'grunty' || o.type === 'magazyny' ? 450 : 260) });
        map.addLayer({ id: 'area-fill', type: 'fill', source: 'area', paint: { 'fill-color': '#f2c94c', 'fill-opacity': 0.35 } });
        map.addLayer({ id: 'area-line', type: 'line', source: 'area', paint: { 'line-color': '#1f2429', 'line-width': 1.6, 'line-dasharray': [2, 2] } });
        mapEl.classList.add('is-ready');
      });
      map.on('error', function () { if (!mapEl.classList.contains('is-ready')) { map.remove(); mapFallback(); } });
    } catch (err) { mapFallback(); }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { obs.disconnect(); startMap(); }
    }, { rootMargin: '300px' }).observe(mapEl);
  } else startMap();

  /* ------------------------------------------------ zapytanie o ofertę */
  var form = $('[data-ask]');
  var msg = $('#a-msg', form);
  msg.value = 'Dzień dobry, interesuje mnie oferta ' + o.number + ': ' + o.title + ' (' + where + '). Proszę o kontakt.';
  $('[data-ask-offer]').innerHTML = C.nb(o.title) + ' <span>' + C.esc(o.number) + '</span>';
  var RULES = [
    { id: 'a-name', test: function (v) { return v.trim().length >= 2; }, msg: 'Podaj imię i nazwisko.' },
    { id: 'a-phone', test: function (v) { return v.replace(/\D/g, '').length >= 9; }, msg: 'Podaj numer telefonu, żebyśmy mogli oddzwonić.' },
    { id: 'a-email', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, msg: 'Podaj adres e-mail w formacie nazwa@domena.pl.' },
    { id: 'a-consent', test: function (v, e) { return e.checked; }, msg: 'Zaznacz zgodę, żebyśmy mogli odpowiedzieć na zapytanie.' }
  ];
  function err(e, text) {
    e.setAttribute('aria-invalid', text ? 'true' : 'false');
    var box = form.querySelector('[data-error-for="' + e.id + '"]');
    if (box) box.textContent = text || '';
  }
  RULES.forEach(function (r) {
    var e = $('#' + r.id, form);
    e.addEventListener(e.type === 'checkbox' ? 'change' : 'input', function () {
      if (e.getAttribute('aria-invalid') === 'true' && r.test(e.value, e)) err(e, '');
    });
  });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var first = null;
    RULES.forEach(function (r) {
      var e = $('#' + r.id, form);
      var ok = r.test(e.value, e);
      err(e, ok ? '' : r.msg);
      if (!ok && !first) first = e;
    });
    var status = $('[data-ask-status]', form);
    if (first) {
      status.className = 'brief__status is-error';
      status.textContent = 'Uzupełnij zaznaczone pola i wyślij ponownie.';
      first.focus();
      return;
    }
    status.className = 'brief__status is-info';
    status.textContent = 'Formularz działa poprawnie. To wersja demonstracyjna, więc zapytanie nie zostało jeszcze wysłane: wysyłkę podłączymy razem z serwerem.';
  });
  $('[data-ask-email]').href = 'mailto:' + A.email + '?subject=' + encodeURIComponent('Oferta ' + o.number + ': ' + o.title);
  $('[data-ask-email]').textContent = A.email;
  $('[data-ask-phone]').href = 'tel:' + A.phoneHref;
  $('[data-ask-phone]').textContent = A.phone.replace(/ /g, '\u00a0');

  /* ------------------------------------------------ podobne oferty */
  var similar = C.publicOffers().filter(function (x) { return x.id !== o.id; }).map(function (x) {
    return { x: x, s: (x.type === o.type ? 3 : 0) + (x.city === o.city ? 1 : 0) + (x.deal === o.deal ? 1 : 0) };
  }).sort(function (a, b) { return b.s - a.s || (a.x.added < b.x.added ? 1 : -1); }).slice(0, 3).map(function (r) { return r.x; });
  field('similar').innerHTML = similar.map(function (x) { return C.card(x); }).join('');

  /* ------------------------------------------------ pasek na telefonie */
  var bar = $('[data-o-bar]');
  var ctaVisible = true, askVisible = false;
  function updateBar() { bar.classList.toggle('is-visible', !ctaVisible && !askVisible); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { ctaVisible = en[0].isIntersecting; updateBar(); }).observe($('[data-o-cta]'));
    new IntersectionObserver(function (en) { askVisible = en[0].isIntersecting; updateBar(); }, { rootMargin: '0px 0px -30% 0px' }).observe($('#zapytanie'));
  }

  /* ------------------------------------------------ dane strukturalne */
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'RealEstateListing',
    name: o.title, description: (o.description || []).join(' '), url: cleanUrl, datePosted: o.added,
    offers: o.price == null ? undefined : { '@type': 'Offer', price: o.price, priceCurrency: 'PLN', businessFunction: o.deal === 'najem' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell' },
    contentLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: o.city, addressCountry: 'PL' } },
    floorSize: { '@type': 'QuantitativeValue', value: o.areaValue, unitCode: 'MTK' }
  });
  document.head.appendChild(ld);

  /* ------------------------------------------------ pomocnicze */
  function setMeta(name, content) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
    m.content = content;
  }
  function swipe(node, onSwipe, onTap) {
    var x0 = null, y0 = 0;
    node.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    node.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 1 : -1);
      else if (onTap && Math.abs(dx) < 6 && Math.abs(dy) < 6) onTap(e);
    });
  }
  // przesunięcie środka o maks. ok. 120 m, żeby okrąg nie wskazywał adresu
  function approx(c, key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
    var ang = (h % 360) * Math.PI / 180, dist = 60 + (h % 60);
    return [c[0] + dist * Math.cos(ang) / (111320 * Math.cos(c[1] * Math.PI / 180)), c[1] + dist * Math.sin(ang) / 110574];
  }
  function circle(c, r) {
    var pts = [];
    for (var i = 0; i <= 64; i++) {
      var a = i / 64 * 2 * Math.PI;
      pts.push([c[0] + r * Math.cos(a) / (111320 * Math.cos(c[1] * Math.PI / 180)), c[1] + r * Math.sin(a) / 110574]);
    }
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [pts] }, properties: {} };
  }
  function notFound() {
    document.title = 'Oferta niedostępna | ' + A.name;
    setMeta('robots', 'noindex');
    var body = $('[data-o-body]');
    body.innerHTML = '<div class="offer-missing"><h1 class="section-title">Ta oferta jest już niedostępna</h1>' +
      '<p class="section-intro">' + C.nb('Mogła zostać wynajęta albo sprzedana, a link mógł się zmienić. Zobacz aktualne oferty albo opisz, czego szukasz.') + '</p>' +
      '<div class="invite-actions"><a class="btn btn--primary" href="oferty.html">Zobacz aktualne oferty</a><a class="btn btn--secondary" href="index.html?cel=szukam#kontakt">Zleć poszukiwanie</a></div></div>';
    var crumb = field('crumb');
    if (crumb) crumb.textContent = 'Oferta niedostępna';
    ['[data-o-ask]', '[data-o-bar]'].forEach(function (s) { var n = $(s); if (n) n.remove(); });
    var sim = field('similar');
    if (sim) sim.innerHTML = C.publicOffers().sort(function (a, b) { return a.added < b.added ? 1 : -1; }).slice(0, 3).map(function (x) { return C.card(x); }).join('');
    var h = $('#h-similar');
    if (h) h.textContent = 'Najnowsze oferty';
  }
})();
