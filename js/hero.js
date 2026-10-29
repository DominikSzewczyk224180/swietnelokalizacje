/* =====================================================================
   Hero: mapa ze strefami dojścia
   Klasyczny skrypt bez modułów, więc działa też po otwarciu pliku z dysku.
   Dane: window.SL_HERO_DATA (js/hero-map-data.js, generowane w tools/).
   ===================================================================== */
(function () {
  'use strict';

  var D = window.SL_HERO_DATA;
  var hero = document.querySelector('[data-hero]');
  var mount = document.querySelector('[data-hero-map]');
  var card = document.querySelector('[data-hero-card]');
  if (!D || !hero || !mount || !card) return;

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stackedMq = window.matchMedia('(max-width: 1180px)');
  var W = D.size[0];
  var H = D.size[1];
  var UNIT = D.unit;
  var offers = D.offers;

  var state = { i: 0, s: 1, w: 0, h: 0, focus: [0.63, 0.44], busy: 0, ready: false };

  /* ---------------------------------------------------------- pomocnicze */
  function svgEl(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function div(cls, parent) {
    var n = document.createElement('div');
    n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function layer(cls) {
    return svgEl('svg', { 'class': 'map-layer ' + cls, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, stage);
  }
  function plural(n, one, few, many) {
    if (n === 1) return one;
    var n10 = n % 10;
    var n100 = n % 100;
    return n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? few : many;
  }
  function nbsp(t) {
    // twarde spacje w liczbach i po jednoliterowych spójnikach (polska typografia)
    return String(t)
      .replace(/(\d) (?=\d)/g, '$1\u00a0')
      .replace(/(\d) (?=(zł|m²|m|min|%)(?=[\s,.;:/)]|$))/g, '$1\u00a0')
      .replace(/(^|\s)([aiouwzAIOUWZ]) /g, '$1$2\u00a0');
  }
  var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  function tween(ms, delay, fn, done) {
    var token = state.busy;
    if (reduce || ms === 0) { fn(1); if (done) done(); return; }
    var start = null;
    function frame(now) {
      if (token !== state.busy) return;
      if (start === null) start = now + delay;
      var t = Math.max(0, Math.min(1, (now - start) / ms));
      if (now >= start) fn(t);
      if (t < 1) requestAnimationFrame(frame);
      else if (done) done();
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------- budowa mapy */
  var viewport = div('map-viewport', mount);
  var stage = div('map-stage is-hidden', viewport);

  var water = layer('map-water');
  svgEl('path', { 'class': 'map-park', d: D.parks }, water);
  svgEl('path', { 'class': 'map-planty', d: D.planty }, water);
  var bulwar = svgEl('path', { 'class': 'map-bulwar', d: D.river }, water);
  var riverEdge = svgEl('path', { 'class': 'map-river-edge', d: D.river }, water);
  var river = svgEl('path', { 'class': 'map-river', d: D.river, id: 'sl-river' }, water);

  var zonesSvg = layer('map-zones');
  var zoneGroups = [2, 1, 0].map(function (k) {
    var g = svgEl('g', { opacity: '0' }, zonesSvg);
    var p = svgEl('path', { 'class': 'zone zone--' + D.walk.levels[k] }, g);
    return { k: k, g: g, p: p };
  }).sort(function (a, b) { return a.k - b.k; });

  var roads = layer('map-roads');
  ['minor', 'mid', 'major'].forEach(function (c) {
    svgEl('path', { 'class': 'road road--' + c, d: D.roads[c] }, roads);
  });
  svgEl('path', { 'class': 'map-tram', d: D.trams }, roads);

  var labelsSvg = layer('map-labels');
  var labelEls = D.labels.map(function (l) {
    var t = svgEl('text', { 'class': 'map-label map-label--' + l.k, x: l.p[0], y: l.p[1], 'text-anchor': 'middle', 'dominant-baseline': 'central' }, labelsSvg);
    t.textContent = l.t;
    return { el: t, k: l.k };
  });
  var riverText = svgEl('text', { 'class': 'map-river-label', dy: '-0.6em' }, labelsSvg);
  var riverPath = svgEl('textPath', { href: '#sl-river', startOffset: (D.riverLabelAt * 100).toFixed(1) + '%', 'text-anchor': 'middle' }, riverText);
  riverPath.textContent = 'Wisła';

  var stopsSvg = layer('map-stops');
  var pinsBox = div('map-pins', stage);

  var pins = offers.map(function (o, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'map-pin';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', o.district + ': ' + o.type + ', pokaż strefy dojścia');
    b.innerHTML = '<svg viewBox="0 0 30 40" aria-hidden="true"><path class="pin-body" d="M15 38.5C15 38.5 3.5 24.6 3.5 15.2a11.5 11.5 0 1 1 23 0C26.5 24.6 15 38.5 15 38.5Z"/><circle class="pin-dot" cx="15" cy="15.2" r="4.3"/></svg>';
    b.addEventListener('click', function () { select(i); });
    pinsBox.appendChild(b);
    return b;
  });

  /* ---------------------------------------------------------- układ i skala */
  function layout() {
    var w = mount.clientWidth;
    var h = mount.clientHeight;
    var stacked = stackedMq.matches;
    // ile metrów miasta mieści się w szerokości mapy
    var meters = stacked ? (w < 520 ? 3300 : 4300) : (w > 1700 ? 7600 : w > 1300 ? 6800 : 6200);
    var s = w / (meters / UNIT);
    var focus = [0.5, 0.45];
    if (!stacked) {
      // pinezka ląduje w wolnym pasie między tekstem a kartą, a skala pilnuje,
      // żeby strefa 10 min zmieściła się w tym pasie
      var mr = mount.getBoundingClientRect();
      var textRight = hero.querySelector('.hero__content').getBoundingClientRect().right - mr.left;
      var cardLeft = card.getBoundingClientRect().left - mr.left;
      var free = Math.max(180, cardLeft - textRight);
      focus = [(textRight + free / 2) / w, 0.45];
      s = Math.max(w / (9000 / UNIT), Math.min(s, (free / 2) / (700 / UNIT)));
    }
    state.s = s;
    state.w = w;
    state.h = h;
    state.focus = focus;

    var pw = W * s;
    var ph = H * s;
    stage.style.width = pw + 'px';
    stage.style.height = ph + 'px';
    Array.prototype.forEach.call(stage.querySelectorAll('svg.map-layer'), function (svg) {
      svg.setAttribute('width', pw);
      svg.setAttribute('height', ph);
    });

    // szerokości w metrach, więc rosną razem z mapą
    river.style.strokeWidth = 122 / UNIT;
    riverEdge.style.strokeWidth = 128 / UNIT;
    bulwar.style.strokeWidth = 210 / UNIT;

    // napisy i znaczniki w pikselach ekranu
    labelEls.forEach(function (l) {
      var px = l.k === 'district' ? 11.5 : l.k === 'park' ? 14 : 13;
      l.el.setAttribute('font-size', (px / s).toFixed(2));
      l.el.setAttribute('stroke-width', (3.2 / s).toFixed(2));
    });
    riverText.setAttribute('font-size', (14 / s).toFixed(2));

    offers.forEach(function (o, i) {
      pins[i].style.left = o.pin[0] * s + 'px';
      pins[i].style.top = o.pin[1] * s + 'px';
    });
    renderStops(state.i, state.ready ? false : null);
  }

  function focusOn(i, animate) {
    var p = offers[i].pin;
    var s = state.s;
    var slack = 60;
    var tx = state.w * state.focus[0] - p[0] * s;
    var ty = state.h * state.focus[1] - p[1] * s;
    tx = Math.min(slack, Math.max(state.w - W * s - slack, tx));
    ty = Math.min(slack, Math.max(state.h - H * s - slack, ty));
    var use = animate && !reduce;
    stage.classList.toggle('is-panning', use);
    stage.style.transition = use ? 'transform 0.95s var(--ease-in-out), opacity 1s var(--ease-out)' : 'opacity 1s var(--ease-out)';
    stage.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
  }

  /* ---------------------------------------------------------- strefy i przystanki */
  function setZones(i) {
    var o = offers[i];
    zoneGroups.forEach(function (z) {
      z.p.setAttribute('d', o.zones[z.k]);
      z.g.setAttribute('opacity', '0');
    });
  }

  function growZones(i, done) {
    var c = offers[i].pin;
    zoneGroups.forEach(function (z) {
      tween(760, 120 * z.k, function (t) {
        var e = easeOutCubic(t);
        var sc = 0.45 + 0.55 * e;
        z.g.setAttribute('transform', 'translate(' + c[0] + ' ' + c[1] + ') scale(' + sc.toFixed(4) + ') translate(' + -c[0] + ' ' + -c[1] + ')');
        z.g.setAttribute('opacity', Math.min(1, t * 1.6).toFixed(3));
      }, z.k === 2 ? done : null);
    });
  }

  function fadeZones(done) {
    var start = zoneGroups.map(function (z) { return parseFloat(z.g.getAttribute('opacity') || '0'); });
    tween(200, 0, function (t) {
      zoneGroups.forEach(function (z, n) { z.g.setAttribute('opacity', (start[n] * (1 - t)).toFixed(3)); });
    }, done);
    Array.prototype.forEach.call(stopsSvg.querySelectorAll('.stop'), function (c) { c.classList.remove('is-visible'); });
  }

  function renderStops(i, reveal) {
    var s = state.s;
    var keep = stopsSvg.querySelectorAll('.stop.is-visible').length > 0;
    while (stopsSvg.firstChild) stopsSvg.removeChild(stopsSvg.firstChild);
    offers[i].stops.forEach(function (st) {
      var tram = st.m === 'tram';
      var c = svgEl('circle', {
        'class': 'stop stop--' + (tram ? 'tram' : 'bus'),
        cx: st.p[0], cy: st.p[1], r: ((tram ? 3.6 : 2.5) / s).toFixed(2)
      }, stopsSvg);
      if (reveal) {
        c.style.transitionDelay = (0.1 + st.z * 0.14 + Math.random() * 0.12).toFixed(2) + 's';
        requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('is-visible'); }); });
      } else if (keep || reveal === false) {
        c.classList.add('is-visible');
      }
    });
  }

  function setActivePin(i) {
    pins.forEach(function (b, n) { b.setAttribute('aria-pressed', n === i ? 'true' : 'false'); });
  }

  /* ---------------------------------------------------------- karta oferty */
  function field(name) { return card.querySelector('[data-f="' + name + '"]'); }

  function fillCard(i) {
    var o = offers[i];
    var st = o.stats;
    field('district').textContent = o.district;
    field('deal').textContent = o.deal;
    field('type').textContent = nbsp(o.type);
    field('meta').textContent = nbsp(o.area + ', ' + o.detail);
    field('price').textContent = nbsp(o.price);
    field('priceNote').textContent = o.priceNote ? nbsp(o.priceNote) : '';
    field('s5').textContent = st.stops5
      ? nbsp(st.stops5 + ' ' + plural(st.stops5, 'przystanek', 'przystanki', 'przystanków') + ', ' + st.lines5 + ' ' + plural(st.lines5, 'linia', 'linie', 'linii'))
      : 'brak przystanków';
    // nazwa przystanku nie łamie się w środku, najwyżej po przecinku
    field('near').textContent = nbsp(String(st.nearest).replace(/ /g, '\u00a0') + ', ' + st.nearestMin + ' min');
    field('rynek').textContent = nbsp(st.rynekMin + ' min');
    field('count').textContent = (i + 1) + ' z ' + offers.length;
  }

  function swapCard(i) {
    if (reduce) { fillCard(i); return; }
    card.classList.add('is-swapping');
    setTimeout(function () {
      fillCard(i);
      card.classList.remove('is-swapping');
    }, 220);
  }

  /* ---------------------------------------------------------- wybór oferty */
  function select(i) {
    i = (i + offers.length) % offers.length;
    if (i === state.i) return;
    state.busy++;
    state.i = i;
    setActivePin(i);
    swapCard(i);
    fadeZones(function () {
      state.busy++;
      setZones(i);
      renderStops(i, null);
      focusOn(i, true);
      setTimeout(function () {
        growZones(i);
        renderStops(i, true);
      }, reduce ? 0 : 620);
    });
  }

  card.querySelector('[data-prev]').addEventListener('click', function () { select(state.i - 1); });
  card.querySelector('[data-next]').addEventListener('click', function () { select(state.i + 1); });

  /* ---------------------------------------------------------- start */
  function intro() {
    layout();
    setZones(0);
    fillCard(0);
    focusOn(0, false);

    var len = river.getTotalLength();
    [river, riverEdge, bulwar].forEach(function (p) {
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = reduce ? 0 : len;
      p.classList.add('map-river-draw');
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        stage.classList.remove('is-hidden');
        [river, riverEdge, bulwar].forEach(function (p) { p.style.strokeDashoffset = 0; });
      });
    });

    var t = reduce ? 0 : 1;
    setTimeout(function () {
      pins.forEach(function (b) { b.classList.add('is-shown'); });
      setActivePin(0);
      if (!reduce) pins[0].classList.add('is-dropping');
    }, 850 * t);
    setTimeout(function () {
      state.ready = true;
      growZones(0);
      renderStops(0, true);
    }, 1150 * t);
    setTimeout(function () {
      card.classList.remove('is-pending');
      hero.classList.remove('is-intro');
    }, 1350 * t);
    setTimeout(function () { pins[0].classList.remove('is-dropping'); }, 1600 * t);
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      layout();
      focusOn(state.i, false);
    }, 120);
  }
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(mount);
  else window.addEventListener('resize', onResize);

  intro();
})();
