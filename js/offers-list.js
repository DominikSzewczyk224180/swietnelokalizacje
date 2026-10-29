/* =====================================================================
   Lista ofert (oferty.html)
   Filtry zapisują się w adresie strony, więc link do gotowego
   wyszukiwania można wysłać klientowi, np. oferty.html?typ=biura&transakcja=najem
   ===================================================================== */
(function () {
  'use strict';

  var C = window.SLCore;
  var root = document.querySelector('[data-list]');
  if (!root || !C) return;

  var $ = function (sel) { return root.querySelector(sel); };
  var el = {
    tabs: $('[data-f-type]'), panel: $('[data-f-panel]'), toggle: $('[data-f-toggle]'), activeCount: $('[data-f-active-count]'),
    close: $('[data-f-close]'), apply: $('[data-f-apply]'), city: $('#f-city'), areaMin: $('#f-area-min'), areaMax: $('#f-area-max'),
    price: $('#f-price'), priceLabel: $('[data-price-label]'), priceHint: $('[data-price-hint]'), q: $('#f-q'),
    count: $('[data-f-count]'), chips: $('[data-f-chips]'), sort: $('[data-f-sort]'), results: $('[data-results]'), reset: $('[data-f-reset]')
  };

  var all = C.publicOffers();
  var demo = new URLSearchParams(window.location.search).get('oferty');
  if (demo !== null) all = all.slice(0, Math.max(0, parseInt(demo, 10) || 0));

  var DEFAULT = { typ: 'all', transakcja: 'all', miasto: 'all', pow_od: '', pow_do: '', cena_do: '', szukaj: '', sort: 'najnowsze' };
  var state = {};

  function num(v) {
    var n = parseFloat(String(v || '').replace(/\s/g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  }

  /* ------------------------------------------------ adres strony <-> stan */
  function readUrl() {
    var qs = new URLSearchParams(window.location.search);
    state = {};
    Object.keys(DEFAULT).forEach(function (k) { state[k] = qs.get(k) || DEFAULT[k]; });
  }
  function writeUrl() {
    var qs = new URLSearchParams(window.location.search);
    Object.keys(DEFAULT).forEach(function (k) {
      if (state[k] && state[k] !== DEFAULT[k]) qs.set(k, state[k]); else qs.delete(k);
    });
    var s = qs.toString();
    history.replaceState(null, '', window.location.pathname + (s ? '?' + s : ''));
  }

  /* ------------------------------------------------ filtrowanie */
  function matches(o, skip) {
    if (skip !== 'typ' && state.typ !== 'all' && o.type !== state.typ) return false;
    if (state.transakcja !== 'all' && o.deal !== state.transakcja) return false;
    if (state.miasto !== 'all' && o.city !== state.miasto) return false;
    var a1 = num(state.pow_od), a2 = num(state.pow_do), p = num(state.cena_do);
    if (a1 !== null && o.areaValue < a1) return false;
    if (a2 !== null && o.areaValue > a2) return false;
    if (p !== null && state.transakcja !== 'all' && (o.price == null || o.price > p)) return false;
    if (state.szukaj) {
      var hay = norm([o.title, o.kind, o.city, o.district, o.lead, (o.features || []).join(' ')].join(' '));
      var ok = norm(state.szukaj).split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
      if (!ok) return false;
    }
    return true;
  }
  function sorted(list) {
    var by = {
      najnowsze: function (a, b) { return a.added < b.added ? 1 : -1; },
      cena_rosnaco: function (a, b) { return a.deal !== b.deal ? (a.deal === 'najem' ? -1 : 1) : (a.price || 0) - (b.price || 0); },
      cena_malejaco: function (a, b) { return a.deal !== b.deal ? (a.deal === 'najem' ? -1 : 1) : (b.price || 0) - (a.price || 0); },
      pow_rosnaco: function (a, b) { return a.areaValue - b.areaValue; },
      pow_malejaco: function (a, b) { return b.areaValue - a.areaValue; }
    };
    return list.slice().sort(by[state.sort] || by.najnowsze);
  }

  /* ------------------------------------------------ widok */
  function syncInputs() {
    root.querySelectorAll('input[name="transakcja"]').forEach(function (r) { r.checked = r.value === state.transakcja; });
    el.city.value = state.miasto;
    el.areaMin.value = state.pow_od;
    el.areaMax.value = state.pow_do;
    el.price.value = state.cena_do;
    el.q.value = state.szukaj;
    el.sort.value = state.sort;
    var priceOn = state.transakcja !== 'all';
    el.price.disabled = !priceOn;
    el.priceLabel.textContent = state.transakcja === 'najem' ? 'Czynsz do (zł netto / mies.)' : state.transakcja === 'sprzedaz' ? 'Cena do (zł netto)' : 'Cena do';
    el.priceHint.hidden = priceOn;
  }

  function chip(key, text) {
    return '<button type="button" class="chip" data-clear="' + key + '" aria-label="Usuń filtr: ' + C.esc(text) + '">' + C.esc(text) + '<span aria-hidden="true">×</span></button>';
  }

  function render() {
    // zakładki typów z liczbami przy pozostałych filtrach
    el.tabs.innerHTML = C.TYPES.map(function (t) {
      var n = all.filter(function (o) { return matches(o, 'typ') && (t.k === 'all' || o.type === t.k); }).length;
      return '<button type="button" data-type="' + t.k + '" aria-pressed="' + (state.typ === t.k) + '">' + C.esc(t.label) + '<span class="count">' + n + '</span></button>';
    }).join('');

    var list = sorted(all.filter(function (o) { return matches(o); }));
    el.count.textContent = list.length + ' ' + C.plural(list.length, 'oferta', 'oferty', 'ofert');

    var chips = [];
    if (state.transakcja !== 'all') chips.push(chip('transakcja', C.DEALS[state.transakcja]));
    if (state.miasto !== 'all') chips.push(chip('miasto', state.miasto));
    if (state.pow_od || state.pow_do) chips.push(chip('pow', 'Powierzchnia ' + (state.pow_od ? 'od ' + state.pow_od + ' ' : '') + (state.pow_do ? 'do ' + state.pow_do + ' ' : '') + 'm²'));
    if (state.cena_do && state.transakcja !== 'all') chips.push(chip('cena_do', (state.transakcja === 'najem' ? 'Czynsz do ' : 'Cena do ') + C.money(num(state.cena_do))));
    if (state.szukaj) chips.push(chip('szukaj', '„' + state.szukaj + '”'));
    el.chips.innerHTML = chips.join('');
    var active = chips.length + (state.typ !== 'all' ? 1 : 0);
    el.reset.hidden = active === 0;
    el.activeCount.textContent = chips.length ? '(' + chips.length + ')' : '';
    if (el.apply) el.apply.textContent = 'Pokaż ' + list.length + ' ' + C.plural(list.length, 'ofertę', 'oferty', 'ofert');

    if (!list.length) {
      var t = C.typeInfo(state.typ);
      el.results.className = 'offers-grid is-empty';
      el.results.innerHTML = '<div class="offers-invite">' +
        '<h2>' + C.nb(all.length ? 'Nie mamy teraz ofert spełniających te kryteria' : 'Najlepsze oferty pokazujemy klientom osobiście') + '</h2>' +
        '<p>' + C.nb('Zmień albo usuń filtry. Możesz też opisać, czego szukasz, a przygotujemy zestawienie, także z nieruchomości spoza ogłoszeń.') + '</p>' +
        '<div class="invite-actions">' + (active ? '<button class="btn btn--secondary" type="button" data-f-reset-all>Wyczyść filtry</button>' : '') +
        '<a class="btn btn--primary" href="index.html?cel=szukam' + (t.form ? '&amp;typ=' + t.form : '') + '#kontakt">Zleć poszukiwanie</a></div>' +
      '</div>';
    } else {
      el.results.className = 'offers-grid';
      el.results.innerHTML = list.map(function (o) { return C.card(o, { heading: 'h2' }); }).join('');
    }
  }

  function update(patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    writeUrl();
    syncInputs();
    render();
  }

  /* ------------------------------------------------ zdarzenia */
  el.tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-type]');
    if (b) update({ typ: b.getAttribute('data-type') });
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'transakcja') update({ transakcja: t.value, cena_do: '' });
    else if (t === el.city) update({ miasto: t.value });
    else if (t === el.sort) update({ sort: t.value });
  });
  var timer = null;
  function typed(key, input) {
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var patch = {};
        patch[key] = input.value.trim();
        update(patch);
      }, 250);
    });
  }
  typed('pow_od', el.areaMin); typed('pow_do', el.areaMax); typed('cena_do', el.price); typed('szukaj', el.q);

  root.addEventListener('click', function (e) {
    var c = e.target.closest('[data-clear]');
    if (c) {
      var k = c.getAttribute('data-clear');
      if (k === 'pow') update({ pow_od: '', pow_do: '' });
      else { var p = {}; p[k] = DEFAULT[k]; if (k === 'transakcja') p.cena_do = ''; update(p); }
      return;
    }
    if (e.target.closest('[data-f-reset], [data-f-reset-all]')) {
      var keep = state.sort;
      state = JSON.parse(JSON.stringify(DEFAULT));
      state.sort = keep;
      update({});
    }
  });

  // panel filtrów na telefonie
  function setPanel(open) {
    el.panel.classList.toggle('is-open', open);
    el.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('no-scroll', open);
    if (open) { var f = el.panel.querySelector('input, select'); if (f) f.focus(); }
    else el.toggle.focus();
  }
  el.toggle.addEventListener('click', function () { setPanel(!el.panel.classList.contains('is-open')); });
  if (el.close) el.close.addEventListener('click', function () { setPanel(false); });
  if (el.apply) el.apply.addEventListener('click', function () { setPanel(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el.panel.classList.contains('is-open')) setPanel(false);
  });

  /* ------------------------------------------------ start */
  var cities = {};
  all.forEach(function (o) { cities[o.city] = (cities[o.city] || 0) + 1; });
  el.city.innerHTML = '<option value="all">Wszystkie</option>' + Object.keys(cities).sort(function (a, b) { return cities[b] - cities[a] || a.localeCompare(b, 'pl'); })
    .map(function (c) { return '<option value="' + C.esc(c) + '">' + C.esc(c) + ' (' + cities[c] + ')</option>'; }).join('');

  readUrl();
  syncInputs();
  render();
})();
