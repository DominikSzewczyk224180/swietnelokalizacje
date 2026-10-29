/* =====================================================================
   Hero: rysunek ulicy z typami nieruchomości
   Najechanie, fokus albo przesunięcie panoramy (telefon) zakreśla
   wybrany typ. Kliknięcie w budynek działa jak link pod nim.
   Klasyczny skrypt, bez zależności, działa też z pliku na dysku.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-drawing]');
  if (!root) return;
  var scroller = root.querySelector('[data-drawing-scroll]');
  var links = Array.prototype.slice.call(root.querySelectorAll('.drawing-labels a[data-m]'));
  var hits = Array.prototype.slice.call(root.querySelectorAll('[data-hit]'));
  var byKey = {};
  links.forEach(function (a) { byKey[a.getAttribute('data-m')] = a; });

  function setActive(key) {
    if (key) root.setAttribute('data-active', key);
    else root.removeAttribute('data-active');
    links.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-m') === key);
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-dot]'), function (d) {
      d.classList.toggle('is-active', d.getAttribute('data-dot') === key);
    });
  }

  var scrollable = function () { return scroller.scrollWidth > scroller.clientWidth + 4; };

  // komputer: myszka i klawiatura
  hits.forEach(function (h) {
    var key = h.getAttribute('data-hit');
    h.addEventListener('mouseenter', function () { setActive(key); });
    h.addEventListener('mouseleave', function () { if (!scrollable()) setActive(null); });
    h.addEventListener('click', function () {
      var a = byKey[key];
      if (a) a.click();
    });
  });
  links.forEach(function (a) {
    var key = a.getAttribute('data-m');
    a.addEventListener('mouseenter', function () { setActive(key); });
    a.addEventListener('mouseleave', function () { if (!scrollable()) setActive(null); });
    a.addEventListener('focus', function () {
      setActive(key);
      if (scrollable()) a.parentNode.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    a.addEventListener('blur', function () { if (!scrollable()) setActive(null); });
  });

  // telefon: zakreślony jest ten typ, który jest na środku ekranu
  var ticking = false;
  function fromScroll() {
    ticking = false;
    if (!scrollable()) return;
    var mid = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
    var best = null;
    var bestD = Infinity;
    links.forEach(function (a) {
      var r = a.getBoundingClientRect();
      var d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestD) { bestD = d; best = a.getAttribute('data-m'); }
    });
    setActive(best);
  }
  scroller.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(fromScroll); }
  }, { passive: true });

  function onResize() {
    if (scrollable()) fromScroll();
    else setActive(null);
  }
  window.addEventListener('resize', onResize);
  // po animacji wejścia pokazujemy na telefonie pierwszy typ
  setTimeout(onResize, 2400);
})();
