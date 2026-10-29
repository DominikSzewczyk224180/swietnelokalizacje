/* =====================================================================
   Sekcja ofert na stronie głównej: filtr typów, karty, stany
   „kilka ofert” i „brak ofert”. Korzysta z js/offers-core.js.
   Pełna lista z filtrami: oferty.html.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-offers]');
  if (!root || !window.SLCore) return;
  var C = window.SLCore;
  var grid = root.querySelector('[data-offers-grid]');
  var tabsBox = root.querySelector('[data-offers-tabs]');
  var more = root.querySelector('[data-offers-more]');

  var all = C.publicOffers().sort(function (a, b) { return a.added < b.added ? 1 : -1; });
  // podgląd stanów w demo: ?oferty=0, ?oferty=2
  var demo = new URLSearchParams(window.location.search).get('oferty');
  if (demo !== null) all = all.slice(0, Math.max(0, parseInt(demo, 10) || 0));

  var current = 'all';
  var expanded = false;
  var narrow = window.matchMedia('(max-width: 620px)');
  var LIMIT = 6;

  function invite(type, count) {
    var t = C.typeInfo(type);
    var title = count === 0
      ? (type === 'all' ? 'Najlepsze oferty pokazujemy klientom osobiście' : 'Nie mamy teraz publicznych ofert ' + t.name)
      : 'Nie widzisz tego, czego szukasz?';
    return '<div class="offers-invite">' +
      '<h3>' + C.nb(title) + '</h3><p>' + C.nb('Opisz, czego szukasz, a przygotujemy zestawienie nieruchomości, także takich, których nie ma w ogłoszeniach.') + '</p>' +
      '<a class="btn btn--primary" href="#kontakt" data-prefill="szukam"' + (t.form ? ' data-prefill-type="' + t.form + '"' : '') + '>Zleć poszukiwanie</a>' +
    '</div>';
  }

  function render() {
    var list = current === 'all' ? all : all.filter(function (o) { return o.type === current; });
    var shown = list.slice(0, LIMIT);
    var collapsed = !expanded && narrow.matches && shown.length > 3;
    var html = (collapsed ? shown.slice(0, 3) : shown).map(function (o) { return C.card(o); }).join('');
    if (collapsed) html += '<button class="btn btn--secondary offers-showall" type="button" data-showall>Pokaż więcej ofert</button>';
    if (list.length < 3) html += invite(current, list.length);
    grid.innerHTML = html;
    grid.classList.toggle('is-empty', list.length === 0);
    grid.classList.toggle('is-few', list.length > 0 && list.length < 3);
    if (more) more.hidden = list.length < 3;
    var link = root.querySelector('[data-offers-all]');
    if (link) link.href = 'oferty.html' + (current === 'all' ? '' : '?typ=' + current);
    Array.prototype.forEach.call(tabsBox.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-type') === current ? 'true' : 'false');
    });
  }

  function buildTabs() {
    if (!all.length) { tabsBox.hidden = true; return; }
    tabsBox.innerHTML = C.TYPES.map(function (t) {
      var n = t.k === 'all' ? all.length : all.filter(function (o) { return o.type === t.k; }).length;
      return '<button type="button" data-type="' + t.k + '" aria-pressed="false">' + C.esc(t.label) + '<span class="count">' + n + '</span></button>';
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

  // stare linki #oferty-lokale itd. nadal ustawiają filtr
  function fromHash() {
    var m = /^#oferty-(lokale|biura|magazyny|grunty)$/.exec(window.location.hash);
    if (!m) return;
    current = m[1];
    render();
    root.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  window.addEventListener('hashchange', fromHash);

  buildTabs();
  render();
  fromHash();
})();
