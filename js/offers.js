/* =====================================================================
   Sekcja ofert: filtr typów, karty, stany „kilka ofert” i „brak ofert”.
   Linki z rysunku w hero (#oferty-lokale, #oferty-biura...) ustawiają filtr.
   Gdy oferta nie ma zdjęcia, karta pokazuje rysunek jej typu.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-offers]');
  if (!root) return;
  var grid = root.querySelector('[data-offers-grid]');
  var tabsBox = root.querySelector('[data-offers-tabs]');
  var more = root.querySelector('[data-offers-more]');

  var all = (window.SL_OFFERS || []).slice();
  // podgląd stanów w demo: ?oferty=0, ?oferty=2
  var demo = new URLSearchParams(window.location.search).get('oferty');
  if (demo !== null) all = all.slice(0, Math.max(0, parseInt(demo, 10) || 0));

  var TYPES = [
    { k: 'all', label: 'Wszystkie' },
    { k: 'lokale', label: 'Lokale', form: 'lokal', name: 'lokali' },
    { k: 'biura', label: 'Biura', form: 'biuro', name: 'biur' },
    { k: 'magazyny', label: 'Magazyny i hale', form: 'magazyn', name: 'magazynów i hal' },
    { k: 'grunty', label: 'Grunty', form: 'grunt', name: 'gruntów' }
  ];
  var current = 'all';
  var expanded = false;
  var narrow = window.matchMedia('(max-width: 620px)');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function nb(s) {
    // twarde spacje: liczby, jednostki, jednoliterowe spójniki
    return esc(s)
      .replace(/(\d) (?=\d)/g, '$1&nbsp;')
      .replace(/(\d) (?=(zł|m²|ha|%))/g, '$1&nbsp;')
      .replace(/(^|\s)([aiouwzAIOUWZ]) /g, '$1$2&nbsp;');
  }

  /* ---------------------------------------------- rysunki zastępcze typów */
  function L(x1, y1, x2, y2, c) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + c + '"/>'; }
  function R(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + c + '"/>'; }
  var G = 168;
  function ground() {
    return R(0, G, 320, 9, 'hatch') + L(0, G, 320, G, 'lw3');
  }
  function shop(awning) {
    var s = R(80, 52, 160, 116, 'lw2 fill') + R(74, 44, 172, 8, 'lw2 fill') + R(78, 118, 164, 5, 'lw1 fill');
    [58, 80, 102].forEach(function (y) {
      [92, 126, 160, 194].forEach(function (x) {
        s += R(x, y, 22, 14, 'lw1 glass') + L(x + 11, y, x + 11, y + 14, 'lw0') + L(x - 2, y + 15.5, x + 24, y + 15.5, 'lw1');
      });
    });
    s += R(92, 130, 96, 34, 'lw1 glass') + L(124, 130, 124, 164, 'lw0') + L(156, 130, 156, 164, 'lw0');
    s += R(198, 130, 26, 38, 'lw1 fill') + R(203, 135, 16, 18, 'lw0 glass');
    if (awning) {
      s += '<path d="M88 124 L192 124 L197 136 L83 136 Z" class="lw1 awning"/>';
      for (var x = 96; x < 192; x += 13) s += L(x, 124, x - 2, 136, 'lw0');
      s += L(30, 150, 74, 150, 'lw1') + L(30, 150, 30, G, 'lw1') + L(52, 150, 52, G, 'lw0') + L(74, 150, 74, G, 'lw1');
    }
    return s;
  }
  function office() {
    var s = R(108, 24, 104, 144, 'lw2 fill') + R(126, 16, 68, 8, 'lw1 fill');
    for (var x = 121; x < 212; x += 13) s += L(x, 27, x, 140, 'lw0 t60');
    for (var y = 40; y < 142; y += 16) s += L(108, y, 212, y, 'lw0 t60');
    s += L(108, 142, 212, 142, 'lw1') + R(148, 148, 24, 20, 'lw1 glass') + L(140, 145, 180, 145, 'lw2');
    s += L(250, G, 250, 136, 'lw1') + R(242, 122, 16, 16, 'lw1 fill') + '<text x="250" y="134" class="sign" text-anchor="middle">P</text>';
    return s;
  }
  function hall() {
    var s = R(44, 86, 232, 6, 'lw1 fill') + R(48, 92, 224, 76, 'lw2 fill');
    for (var x = 98; x < 272; x += 7) s += L(x, 94, x, 152, 'lw0 t45');
    s += R(48, 112, 44, 56, 'lw1 fill') + R(56, 122, 11, 9, 'lw0 glass') + R(73, 122, 11, 9, 'lw0 glass') + R(62, 146, 14, 22, 'lw1 fill');
    s += R(112, 154, 150, 14, 'lw1 fill');
    [122, 168, 214].forEach(function (x) {
      s += R(x, 120, 34, 34, 'lw1 fill');
      for (var k = 1; k < 6; k++) s += L(x, 120 + k * 5.7, x + 34, 120 + k * 5.7, 'lw0');
    });
    return s;
  }
  function plot() {
    var s = '';
    for (var x = 20; x < 300; x += 17) s += '<path d="M' + x + ' ' + G + ' l2.5 -5 l2.5 5" class="lw0"/>';
    [50, 270].forEach(function (x) { s += L(x, G, x, 146, 'lw1') + R(x - 2.5, 140, 5, 7, 'lw0 flag'); });
    s += R(92, 76, 120, 92, 'dash') + L(92, 107, 212, 107, 'dash-fine') + L(92, 138, 212, 138, 'dash-fine');
    s += L(246, G, 246, 30, 'lw1') + L(252, G, 252, 30, 'lw1');
    var zz = 'M246 160';
    for (var k = 1; k < 18; k++) zz += ' L' + (k % 2 ? 252 : 246) + ' ' + (160 - 7.5 * k);
    s += '<path d="' + zz + '" class="lw0"/>';
    s += L(150, 30, 300, 30, 'lw1') + L(150, 35, 300, 35, 'lw1');
    var jz = 'M150 35';
    for (var j = 1; j < 21; j++) jz += ' L' + (150 + 7.5 * j) + ' ' + (j % 2 ? 30 : 35);
    s += '<path d="' + jz + '" class="lw0"/>' + R(286, 35, 12, 9, 'lw1 fill') + L(180, 35, 180, 62, 'lw0') + R(177, 62, 6, 4, 'lw1 fill');
    return s;
  }
  function drawing(kind) {
    var body = kind === 'office' ? office() : kind === 'hall' ? hall() : kind === 'plot' ? plot() : shop(kind === 'gastro');
    return '<svg class="type-drawing" viewBox="0 0 320 200" aria-hidden="true" focusable="false">' + ground() + body + '</svg>';
  }

  /* ---------------------------------------------- karty */
  function card(o) {
    var place = o.city + (o.district ? ', ' + o.district : '');
    var media = o.photo
      ? '<img src="' + esc(o.photo) + '" alt="" loading="lazy">'
      : drawing(o.drawing);
    var badge = o.badge
      ? '<span class="offer__badge' + (o.badge === 'Rezerwacja' ? ' offer__badge--muted' : '') + '">' + esc(o.badge) + '</span>'
      : '';
    return '<article class="offer">' +
      '<div class="offer__media">' + media + badge + '</div>' +
      '<div class="offer__body">' +
        '<p class="offer__meta"><span>' + esc(o.kind) + '</span><span>' + esc(o.deal) + '</span></p>' +
        '<h3 class="offer__title"><a class="offer__link" href="#oferty" data-offer="' + esc(o.id) + '">' + nb(o.title) + '</a></h3>' +
        '<p class="offer__place">' + esc(place) + '</p>' +
      '</div>' +
      '<dl class="offer__specs">' +
        '<div><dt>Powierzchnia</dt><dd>' + nb(o.area) + '</dd></div>' +
        '<div><dt>Cena</dt><dd>' + nb(o.price) + '<small>' + nb(o.priceNote) + '</small></dd></div>' +
        '<div><dt>Za m²</dt><dd>' + nb(o.perM2) + '</dd></div>' +
      '</dl>' +
    '</article>';
  }

  function invite(type, count) {
    var t = TYPES.filter(function (x) { return x.k === type; })[0];
    var title = count === 0
      ? (type === 'all' ? 'Najlepsze oferty pokazujemy klientom osobiście' : 'Nie mamy teraz publicznych ofert ' + t.name)
      : 'Nie widzisz tego, czego szukasz?';
    var text = 'Opisz, czego szukasz, a przygotujemy zestawienie nieruchomości, także takich, których nie ma w ogłoszeniach.';
    return '<div class="offers-invite">' +
      '<h3>' + nb(title) + '</h3><p>' + nb(text) + '</p>' +
      '<a class="btn btn--primary" href="#kontakt" data-prefill="szukam"' + (t && t.form ? ' data-prefill-type="' + t.form + '"' : '') + '>Zleć poszukiwanie</a>' +
    '</div>';
  }

  function render() {
    var list = current === 'all' ? all : all.filter(function (o) { return o.type === current; });
    // na telefonie pokazujemy trzy oferty, resztę po kliknięciu
    var collapsed = !expanded && narrow.matches && list.length > 3;
    var html = (collapsed ? list.slice(0, 3) : list).map(card).join('');
    if (collapsed) html += '<button class="btn btn--secondary offers-showall" type="button" data-showall>Pokaż wszystkie oferty (' + list.length + ')</button>';
    if (list.length < 3) html += invite(current, list.length);
    grid.innerHTML = html;
    grid.classList.toggle('is-empty', list.length === 0);
    grid.classList.toggle('is-few', list.length > 0 && list.length < 3);
    if (more) more.hidden = list.length < 3;
    Array.prototype.forEach.call(tabsBox.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-type') === current ? 'true' : 'false');
    });
  }

  function buildTabs() {
    if (!all.length) { tabsBox.hidden = true; return; }
    tabsBox.innerHTML = TYPES.map(function (t) {
      var n = t.k === 'all' ? all.length : all.filter(function (o) { return o.type === t.k; }).length;
      return '<button type="button" data-type="' + t.k + '" aria-pressed="false">' + esc(t.label) + '<span class="count">' + n + '</span></button>';
    }).join('');
    tabsBox.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-type]');
      if (!b) return;
      current = b.getAttribute('data-type');
      expanded = false;
      render();
    });
  }
  grid.addEventListener('click', function (e) {
    if (!e.target.closest('[data-showall]')) return;
    expanded = true;
    render();
  });
  narrow.addEventListener('change', render);

  // linki #oferty-lokale itd. (z rysunku w hero)
  function fromHash(scroll) {
    var m = /^#oferty-(lokale|biura|magazyny|grunty)$/.exec(window.location.hash);
    if (!m) return;
    current = m[1];
    render();
    if (scroll) root.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  window.addEventListener('hashchange', function () { fromHash(true); });

  buildTabs();
  render();
  fromHash(true);
})();
