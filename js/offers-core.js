/* =====================================================================
   Wspólny moduł ofert (strona główna, lista ofert, karta oferty):
   formatowanie po polsku, rysunki typów, rzuty poglądowe, karta oferty.
   ===================================================================== */
window.SLCore = (function () {
  'use strict';

  var TYPES = [
    { k: 'all', label: 'Wszystkie' },
    { k: 'lokale', label: 'Lokale', form: 'lokal', name: 'lokali' },
    { k: 'biura', label: 'Biura', form: 'biuro', name: 'biur' },
    { k: 'magazyny', label: 'Magazyny i hale', form: 'magazyn', name: 'magazynów i hal' },
    { k: 'grunty', label: 'Grunty', form: 'grunt', name: 'gruntów' }
  ];
  var DEALS = { najem: 'Najem', sprzedaz: 'Sprzedaż' };
  var MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

  /* ------------------------------------------------ tekst i liczby */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // HTML z twardymi spacjami: liczby, jednostki, jednoliterowe spójniki
  function nb(s) {
    return esc(s)
      .replace(/(\d) (?=\d)/g, '$1&nbsp;')
      .replace(/(\d) (?=(zł|m²|m|ha|kW|t\/m²|%|min|lat|lata))/g, '$1&nbsp;')
      .replace(/(^|\s)([aiouwzAIOUWZ]) /g, '$1$2&nbsp;');
  }
  function plural(n, one, few, many) {
    if (n === 1) return one;
    var n10 = n % 10, n100 = n % 100;
    return n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? few : many;
  }
  function group(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
  function money(v) {
    var r = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    return group(String(r).replace('.', ',')) + '\u00a0zł';
  }
  function priceLabel(o) { return o.price == null ? 'Na zapytanie' : money(o.price); }
  function perM2Label(o) { return o.price == null || !o.areaValue ? 'na zapytanie' : money(o.price / o.areaValue); }
  function fmtDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.getDate() + '\u00a0' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function place(o) { return o.city + (o.district ? ', ' + o.district : ''); }
  function typeInfo(k) { return TYPES.filter(function (t) { return t.k === k; })[0] || TYPES[0]; }

  /* ------------------------------------------------ dane */
  function all() { return (window.SL_OFFERS || []).slice(); }
  function publicOffers() { return all().filter(function (o) { return o.visibility !== 'link'; }); }
  function byId(id) { return all().filter(function (o) { return o.id === id; })[0] || null; }
  function offerUrl(o) { return 'oferta.html?id=' + encodeURIComponent(o.id); }

  /* ------------------------------------------------ prymitywy SVG */
  function L(x1, y1, x2, y2, c) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + c + '"/>'; }
  function R(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + c + '"/>'; }
  function P(d, c) { return '<path d="' + d + '" class="' + c + '"/>'; }
  function T(x, y, s, c, a) { return '<text x="' + x + '" y="' + y + '" class="' + c + '" text-anchor="' + (a || 'middle') + '">' + esc(s) + '</text>'; }

  /* ------------------------------------------------ elewacje typów (viewBox 320 × 200) */
  var G = 168;
  function ground() { return R(0, G, 320, 9, 'hatch') + L(0, G, 320, G, 'lw3'); }
  function tenement() {
    var s = R(80, 52, 160, 116, 'lw2 fill') + R(74, 44, 172, 8, 'lw2 fill') + R(78, 118, 164, 5, 'lw1 fill');
    [58, 80, 102].forEach(function (y) {
      [92, 126, 160, 194].forEach(function (x) {
        s += R(x, y, 22, 14, 'lw1 glass') + L(x + 11, y, x + 11, y + 14, 'lw0') + L(x - 2, y + 15.5, x + 24, y + 15.5, 'lw1');
      });
    });
    return s;
  }
  function shop(awning) {
    var s = tenement();
    s += R(92, 130, 96, 34, 'lw1 glass') + L(124, 130, 124, 164, 'lw0') + L(156, 130, 156, 164, 'lw0');
    s += R(198, 130, 26, 38, 'lw1 fill') + R(203, 135, 16, 18, 'lw0 glass');
    if (awning) {
      s += P('M88 124 L192 124 L197 136 L83 136 Z', 'lw1 awning');
      for (var x = 96; x < 192; x += 13) s += L(x, 124, x - 2, 136, 'lw0');
      s += L(30, 150, 74, 150, 'lw1') + L(30, 150, 30, G, 'lw1') + L(52, 150, 52, G, 'lw0') + L(74, 150, 74, G, 'lw1');
    }
    return s;
  }
  function townhouse() {
    var s = tenement();
    s += P('M146 168 V140 Q160 126 174 140 V168', 'lw1 fill') + L(160, 133, 160, 168, 'lw0');
    s += R(96, 132, 26, 24, 'lw1 glass') + L(109, 132, 109, 156, 'lw0');
    s += R(198, 132, 26, 24, 'lw1 glass') + L(211, 132, 211, 156, 'lw0');
    s += L(80, 160, 240, 160, 'lw0');
    return s;
  }
  function modern() {
    var s = R(62, 36, 196, 4, 'lw1 fill') + R(66, 40, 188, 128, 'lw2 fill');
    [70, 98, 124].forEach(function (y) { s += L(66, y, 254, y, 'lw0 t60'); });
    [46, 76, 104].forEach(function (top) {
      [80, 116, 152, 188, 224].forEach(function (x, i) {
        s += R(x, top, 20, 16, 'lw1 glass');
        if (i % 2) s += R(x - 4, top + 17, 28, 4, 'lw0 fill');
      });
    });
    s += L(68, 126, 252, 126, 'lw2') + R(74, 130, 172, 38, 'lw1 glass');
    [102, 130, 158, 186, 214].forEach(function (x) { s += L(x, 130, x, 168, 'lw0'); });
    return s;
  }
  function office() {
    var s = R(108, 24, 104, 144, 'lw2 fill') + R(126, 16, 68, 8, 'lw1 fill');
    for (var x = 121; x < 212; x += 13) s += L(x, 27, x, 140, 'lw0 t60');
    for (var y = 40; y < 142; y += 16) s += L(108, y, 212, y, 'lw0 t60');
    s += L(108, 142, 212, 142, 'lw1') + R(148, 148, 24, 20, 'lw1 glass') + L(140, 145, 180, 145, 'lw2');
    s += L(250, G, 250, 136, 'lw1') + R(242, 122, 16, 16, 'lw1 fill') + T(250, 134, 'P', 'sign');
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
    for (var x = 20; x < 300; x += 17) s += P('M' + x + ' ' + G + ' l2.5 -5 l2.5 5', 'lw0');
    [50, 270].forEach(function (x) { s += L(x, G, x, 146, 'lw1') + R(x - 2.5, 140, 5, 7, 'lw0 flag'); });
    s += R(92, 76, 120, 92, 'dash') + L(92, 107, 212, 107, 'dash-fine') + L(92, 138, 212, 138, 'dash-fine');
    s += L(246, G, 246, 30, 'lw1') + L(252, G, 252, 30, 'lw1');
    var zz = 'M246 160';
    for (var k = 1; k < 18; k++) zz += ' L' + (k % 2 ? 252 : 246) + ' ' + (160 - 7.5 * k);
    s += P(zz, 'lw0') + L(150, 30, 300, 30, 'lw1') + L(150, 35, 300, 35, 'lw1');
    var jz = 'M150 35';
    for (var j = 1; j < 21; j++) jz += ' L' + (150 + 7.5 * j) + ' ' + (j % 2 ? 30 : 35);
    s += P(jz, 'lw0') + R(286, 35, 12, 9, 'lw1 fill') + L(180, 35, 180, 62, 'lw0') + R(177, 62, 6, 4, 'lw1 fill');
    return s;
  }
  var ELEVATIONS = { shop: function () { return shop(false); }, gastro: function () { return shop(true); }, townhouse: townhouse, modern: modern, office: office, hall: hall, plot: plot };
  var DETAIL = {
    shop: ['64 78 192 120', 'Parter i witryna'],
    gastro: ['30 78 192 120', 'Parter, witryna i ogródek'],
    townhouse: ['64 78 192 120', 'Wejście do budynku'],
    modern: ['58 70 204 127.5', 'Parter z witrynami'],
    office: ['86 84 148 92.5', 'Wejście i niższe kondygnacje'],
    hall: ['96 94 168 105', 'Doki i bramy'],
    plot: ['66 50 200 125', 'Możliwa zabudowa']
  };

  function drawingSvg(kind, viewBox, label) {
    var body = (ELEVATIONS[kind] || ELEVATIONS.shop)();
    return '<svg class="type-drawing" viewBox="' + (viewBox || '0 0 320 200') + '"' +
      (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') +
      ' focusable="false">' + ground() + body + '</svg>';
  }

  /* ------------------------------------------------ rzuty poglądowe (viewBox 320 × 200) */
  function dimH(x1, x2, y, label) {
    return L(x1, y, x2, y, 'dim') + L(x1, y - 5, x1, y + 5, 'dim') + L(x2, y - 5, x2, y + 5, 'dim') +
      P('M' + (x1 - 3) + ' ' + (y + 3) + ' L' + (x1 + 3) + ' ' + (y - 3) + ' M' + (x2 - 3) + ' ' + (y + 3) + ' L' + (x2 + 3) + ' ' + (y - 3), 'tick') +
      T((x1 + x2) / 2, y - 3, label, 'pl-dim');
  }
  function dimV(x, y1, y2, label) {
    return L(x, y1, x, y2, 'dim') + L(x - 5, y1, x + 5, y1, 'dim') + L(x - 5, y2, x + 5, y2, 'dim') +
      P('M' + (x - 3) + ' ' + (y1 + 3) + ' L' + (x + 3) + ' ' + (y1 - 3) + ' M' + (x - 3) + ' ' + (y2 + 3) + ' L' + (x + 3) + ' ' + (y2 - 3), 'tick') +
      T(x + 4, (y1 + y2) / 2 + 2, label, 'pl-dim', 'start');
  }
  function north(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="7" class="part"/>' +
      P('M' + x + ' ' + (y - 5) + ' L' + (x + 3) + ' ' + (y + 4) + ' L' + x + ' ' + (y + 2) + ' L' + (x - 3) + ' ' + (y + 4) + ' Z', 'north') +
      T(x, y - 9.5, 'N', 'pl-dim');
  }
  function winH(x1, x2, y) { return L(x1, y, x2, y, 'cut') + L(x1, y - 1.4, x2, y - 1.4, 'glass-line') + L(x1, y + 1.4, x2, y + 1.4, 'glass-line'); }
  function doorUp(x1, x2, y) {
    var w = x2 - x1;
    return L(x1, y, x2, y, 'cut') + L(x1, y, x1, y - w, 'door') + P('M' + x1 + ' ' + (y - w) + ' A' + w + ' ' + w + ' 0 0 1 ' + x2 + ' ' + y, 'swing');
  }
  function doorRight(x, y1, y2) {
    var w = y2 - y1;
    return L(x, y1, x, y2, 'cut') + L(x, y1, x + w, y1, 'door') + P('M' + (x + w) + ' ' + y1 + ' A' + w + ' ' + w + ' 0 0 1 ' + x + ' ' + y2, 'swing');
  }
  function label2(x, y, room, small) {
    return T(x, y, room[0], small ? 'pl-label pl-label--sm' : 'pl-label') + (room[1] ? T(x, y + (small ? 8.5 : 10.5), room[1], small ? 'pl-area pl-area--sm' : 'pl-area') : '');
  }

  function planThree(p) {
    var x0 = 50, y0 = 34, x1 = 270, y1 = 152, r = p.rooms;
    var s = R(x0, y0, x1 - x0, y1 - y0, 'room');
    s += L(196, y0, 196, 104, 'part') + L(196, 104, x1, 104, 'part') + L(236, y0, 236, 70, 'part') + L(236, 70, x1, 70, 'part');
    s += L(196, 84, 196, 99, 'cut-in') + L(246, 70, 259, 70, 'cut-in');
    s += R(x0, y0, x1 - x0, y1 - y0, 'wall');
    s += winH(64, 184, y1) + doorUp(204, 232, y1) + winH(206, 226, y0);
    s += label2(122, 90, r[0]) + (r[1] ? label2(228, 84, r[1], true) : '') + (r[2] ? label2(253, 50, r[2], true) : '');
    s += T(124, 166, 'ulica', 'pl-note') + dimH(x0, x1, 184, p.w) + dimV(290, y0, y1, p.d) + north(24, 50);
    return s;
  }
  function planOffice(p) {
    var x0 = 30, y0 = 30, x1 = 276, y1 = 156, xs = 196, r = p.rooms, n = Math.max(1, r.length - 1), hh = (y1 - y0) / n, i;
    var s = R(x0, y0, x1 - x0, y1 - y0, 'room') + L(xs, y0, xs, y1, 'part');
    for (i = 1; i < n; i++) s += L(xs, y0 + i * hh, x1, y0 + i * hh, 'part');
    for (i = 0; i < n; i++) s += L(xs, y0 + i * hh + 6, xs, y0 + i * hh + 17, 'cut-in');
    [[76, 70], [76, 114], [136, 70], [136, 114]].forEach(function (c) { s += R(c[0] - 1.8, c[1] - 1.8, 3.6, 3.6, 'col'); });
    s += R(x0, y0, x1 - x0, y1 - y0, 'wall');
    [44, 74, 104, 134, 164].forEach(function (x) { s += winH(x, x + 18, y0) + winH(x, x + 18, y1); });
    s += winH(214, 234, y0) + winH(238, 258, y1) + doorRight(x0, 84, 104);
    s += label2(113, 92, r[0]);
    for (i = 1; i < r.length; i++) s += label2(236, y0 + (i - 1) * hh + hh / 2 - 1, r[i], true);
    s += dimH(x0, x1, 178, p.w) + dimV(290, y0, y1, p.d) + north(14, 46);
    return s;
  }
  function planTownhouse(p) {
    var x0 = 30, y0 = 34, x1 = 276, y1 = 150, r = p.rooms, n = r.length;
    var ct = Math.ceil(n / 2), cb = n - ct, k, s = R(x0, y0, x1 - x0, y1 - y0, 'room');
    var wt = (x1 - 70) / ct, wb = cb ? (x1 - x0) / cb : 0;
    s += L(70, y0, 70, 84, 'part') + L(x0, 84, x1, 84, 'part') + L(x0, 100, x1, 100, 'part');
    for (k = 1; k < ct; k++) s += L(70 + k * wt, y0, 70 + k * wt, 84, 'part');
    for (k = 1; k < cb; k++) s += L(x0 + k * wb, 100, x0 + k * wb, y1, 'part');
    for (var y = 40; y < 84; y += 6) s += L(34, y, 66, y, 'stair');
    for (k = 0; k < ct; k++) s += L(70 + k * wt + wt / 2 - 7, 84, 70 + k * wt + wt / 2 + 7, 84, 'cut-in');
    for (k = 0; k < cb; k++) s += L(x0 + k * wb + wb / 2 - 7, 100, x0 + k * wb + wb / 2 + 7, 100, 'cut-in');
    s += R(x0, y0, x1 - x0, y1 - y0, 'wall') + winH(42, 58, y0);
    for (k = 0; k < ct; k++) s += winH(70 + k * wt + wt / 2 - 13, 70 + k * wt + wt / 2 + 13, y0);
    for (k = 0; k < cb; k++) s += winH(x0 + k * wb + wb / 2 - 13, x0 + k * wb + wb / 2 + 13, y1);
    for (k = 0; k < ct; k++) s += label2(70 + k * wt + wt / 2, 58, r[k]);
    for (k = 0; k < cb; k++) s += label2(x0 + k * wb + wb / 2, 124, r[ct + k]);
    s += T(50, 81, 'klatka', 'pl-note') + T(173, 94.5, 'korytarz', 'pl-note');
    s += dimH(x0, x1, 176, p.w) + dimV(290, y0, y1, p.d) + north(14, 46);
    return s;
  }
  function planHall(p) {
    var x0 = 20, y0 = 26, x1 = 280, y1 = 150, r = p.rooms, docks = p.docks || 0, gates = p.gates || 0, k;
    var s = R(x0, y0, x1 - x0, y1 - y0, 'room') + L(86, y0, 86, 74, 'part') + L(x0, 74, 86, 74, 'part') + L(62, 74, 75, 74, 'cut-in');
    [113, 180, 247].forEach(function (x) { s += R(x - 2, 86, 4, 4, 'col'); });
    s += R(x0, y0, x1 - x0, y1 - y0, 'wall') + winH(28, 46, y0) + winH(60, 78, y0) + L(x0, 38, x0, 52, 'cut');
    for (k = 0; k < docks + gates; k++) {
      var x = 104 + k * 48, dock = k < docks, w = dock ? 26 : 30;
      s += L(x, y1, x + w, y1, 'cut') + (dock ? R(x + 2, y1 + 2.5, 22, 6, 'part') : L(x, y1 + 6, x + w, y1 + 6, 'dash-fine'));
      s += T(x + w / 2, y1 + 18, dock ? 'dok' : 'brama', 'pl-note');
    }
    s += label2(180, 58, r[0]) + (r[1] ? label2(53, 46, r[1], true) : '');
    s += dimH(x0, x1, 184, p.w) + dimV(294, y0, y1, p.d) + north(306, 18);
    return s;
  }
  function planPlot(p) {
    var r = p.rooms;
    var s = L(0, 166, 320, 166, 'part') + L(0, 184, 320, 184, 'part') + L(0, 175, 320, 175, 'dash-fine') + T(250, 179, p.road || 'droga', 'pl-note');
    s += P('M36 46 L280 38 L288 150 L30 154 Z', 'plot-line');
    [[36, 46], [280, 38], [288, 150], [30, 154]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="2.4" class="stake"/>'; });
    s += P('M58 64 L260 58 L266 132 L54 136 Z', 'envelope') + L(140, 154, 140, 166, 'part') + L(164, 153, 164, 166, 'part');
    s += label2(160, 94, r[1] || ['', '']) + T(44, 147, r[0][0] + ' ' + r[0][1], 'pl-label pl-label--sm', 'start');
    s += dimH(36, 280, 24, p.w) + dimV(298, 38, 150, p.d) + north(14, 32);
    return s;
  }
  function planSvg(o) {
    var p = o.plan || { w: '', d: '', rooms: [[o.kind, o.area]] };
    var t = o.drawing;
    var body = t === 'plot' ? planPlot(p) : t === 'hall' ? planHall(p) : t === 'office' ? planOffice(p) : t === 'townhouse' ? planTownhouse(p) : planThree(p);
    var cap = p.caption || (t === 'plot' ? 'Plan sytuacyjny, schemat poglądowy' : 'Rzut, schemat poglądowy');
    return '<svg class="plan" viewBox="0 0 320 200" role="img" aria-label="' + esc(cap) + '" focusable="false">' +
      body + '</svg>';
  }

  /* ------------------------------------------------ galeria */
  function galleryItems(o) {
    if (o.photos && o.photos.length) {
      return o.photos.map(function (src, i) {
        return { html: '<img src="' + esc(src) + '" alt="' + esc(o.title + ', zdjęcie ' + (i + 1)) + '">', caption: 'Zdjęcie ' + (i + 1), drawn: false };
      });
    }
    var d = DETAIL[o.drawing] || DETAIL.shop;
    return [
      { html: drawingSvg(o.drawing, null, 'Elewacja, rysunek poglądowy'), caption: 'Elewacja, rysunek poglądowy', drawn: true },
      { html: drawingSvg(o.drawing, d[0], d[1]), caption: d[1], drawn: true },
      { html: planSvg(o), caption: (o.plan && o.plan.caption) || (o.drawing === 'plot' ? 'Plan sytuacyjny, schemat poglądowy' : 'Rzut, schemat poglądowy'), drawn: true, plan: true }
    ];
  }

  /* ------------------------------------------------ karta oferty */
  function card(o, opts) {
    opts = opts || {};
    var media = o.photos && o.photos.length
      ? '<img src="' + esc(o.photos[0]) + '" alt="" loading="lazy">'
      : drawingSvg(o.drawing);
    var badge = o.badge
      ? '<span class="offer__badge' + (o.status === 'rezerwacja' ? ' offer__badge--muted' : '') + '">' + esc(o.badge) + '</span>'
      : '';
    var H = opts.heading || 'h3';
    return '<article class="offer">' +
      '<div class="offer__media">' + media + badge + '</div>' +
      '<div class="offer__body">' +
        '<p class="offer__meta"><span>' + esc(o.kind) + '</span><span>' + esc(DEALS[o.deal]) + '</span></p>' +
        '<' + H + ' class="offer__title"><a class="offer__link" href="' + offerUrl(o) + '">' + nb(o.title) + '</a></' + H + '>' +
        '<p class="offer__place">' + esc(place(o)) + '</p>' +
      '</div>' +
      '<dl class="offer__specs">' +
        '<div><dt>Powierzchnia</dt><dd>' + nb(o.area) + '</dd></div>' +
        '<div><dt>Cena</dt><dd>' + priceLabel(o) + '<small>' + nb(o.price == null ? '' : o.priceNote) + '</small></dd></div>' +
        '<div><dt>Za m²</dt><dd>' + perM2Label(o) + '</dd></div>' +
      '</dl>' +
    '</article>';
  }

  return {
    TYPES: TYPES, DEALS: DEALS,
    esc: esc, nb: nb, plural: plural, money: money, priceLabel: priceLabel, perM2Label: perM2Label,
    fmtDate: fmtDate, place: place, typeInfo: typeInfo,
    all: all, publicOffers: publicOffers, byId: byId, offerUrl: offerUrl,
    drawingSvg: drawingSvg, planSvg: planSvg, galleryItems: galleryItems, card: card
  };
})();
