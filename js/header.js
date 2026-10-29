/* Nagłówek: menu mobilne i obramowanie po przewinięciu */
(function () {
  'use strict';
  var header = document.querySelector('[data-header]');
  if (!header) return;
  var toggle = header.querySelector('[data-nav-toggle]');
  var menu = document.getElementById('mobile-menu');

  function setOpen(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('[data-nav-label]').textContent = open ? 'Zamknij' : 'Menu';
    menu.hidden = !open;
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1121px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  var demo = document.querySelector('[data-demo-bar]');
  if (demo) {
    var closed = false;
    try { closed = sessionStorage.getItem('sl-demo-closed') === '1'; } catch (e) {}
    demo.hidden = closed;
    var x = demo.querySelector('[data-demo-close]');
    if (x) x.addEventListener('click', function () {
      demo.hidden = true;
      try { sessionStorage.setItem('sl-demo-closed', '1'); } catch (e) {}
    });
  }

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
