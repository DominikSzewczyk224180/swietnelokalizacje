/* =====================================================================
   Formularz zapytania: podpowiedzi z przycisków na stronie, walidacja
   przy wysyłce i komunikaty przy polach. Wysyłka zostanie podłączona
   do serwera na SEOHost w etapie z backendem.
   ===================================================================== */
(function () {
  'use strict';

  var form = document.querySelector('[data-brief]');
  if (!form) return;
  var status = form.querySelector('[data-brief-status]');

  /* --- tryb formularza: szukam / mam nieruchomość / inwestycja -------- */
  var WORDING = {
    szukam: { deal: ['Najem', 'Kupno', 'Jeszcze nie wiem'], budget: 'Budżet', budgetPh: 'np. do 15 000 zł miesięcznie', where: 'Gdzie szukasz', wherePh: 'Miasto, dzielnica lub okolica' },
    mam: { deal: ['Wynajem', 'Sprzedaż', 'Jeszcze nie wiem'], budget: 'Oczekiwana cena', budgetPh: 'np. 9 000 zł miesięcznie lub 1 200 000 zł', where: 'Gdzie jest nieruchomość', wherePh: 'Miasto i adres lub okolica' },
    inwestycja: { deal: ['Kupno', 'Najem długoterminowy', 'Jeszcze nie wiem'], budget: 'Budżet inwestycji', budgetPh: 'np. do 3 000 000 zł', where: 'Preferowana lokalizacja', wherePh: 'Miasto, region lub kilka opcji' }
  };

  function setMode(mode) {
    var w = WORDING[mode] || WORDING.szukam;
    form.querySelectorAll('[data-deal-label]').forEach(function (el, i) { el.textContent = w.deal[i]; });
    form.querySelector('[data-budget-label]').textContent = w.budget;
    form.querySelector('#f-budget').placeholder = w.budgetPh;
    form.querySelector('[data-where-label]').textContent = w.where;
    form.querySelector('#f-where').placeholder = w.wherePh;
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'cel') setMode(e.target.value);
  });

  // przyciski w całej stronie: data-prefill="szukam|mam|inwestycja", opcjonalnie data-prefill-type="biuro"
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-prefill]');
    if (!t) return;
    var mode = t.getAttribute('data-prefill');
    var radio = form.querySelector('input[name="cel"][value="' + mode + '"]');
    if (radio) { radio.checked = true; setMode(mode); }
    var type = t.getAttribute('data-prefill-type');
    if (type) form.querySelector('#f-type').value = type;
  });

  /* --- walidacja ------------------------------------------------------- */
  var RULES = [
    { id: 'f-name', test: function (v) { return v.trim().length >= 2; }, msg: 'Podaj imię i nazwisko.' },
    { id: 'f-phone', test: function (v) { return v.replace(/\D/g, '').length >= 9; }, msg: 'Podaj numer telefonu, żebyśmy mogli oddzwonić.' },
    { id: 'f-email', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, msg: 'Podaj adres e-mail w formacie nazwa@domena.pl.' },
    { id: 'f-consent', test: function (v, el) { return el.checked; }, msg: 'Zaznacz zgodę, żebyśmy mogli odpowiedzieć na zapytanie.' }
  ];

  function showError(el, msg) {
    var box = form.querySelector('[data-error-for="' + el.id + '"]');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) box.textContent = msg || '';
  }

  RULES.forEach(function (r) {
    var el = form.querySelector('#' + r.id);
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (el.getAttribute('aria-invalid') === 'true' && r.test(el.value, el)) showError(el, '');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    RULES.forEach(function (r) {
      var el = form.querySelector('#' + r.id);
      var ok = r.test(el.value, el);
      showError(el, ok ? '' : r.msg);
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      status.className = 'brief__status is-error';
      status.textContent = 'Uzupełnij zaznaczone pola i wyślij ponownie.';
      firstBad.focus();
      return;
    }
    status.className = 'brief__status is-info';
    status.textContent = 'Formularz działa poprawnie. To wersja demonstracyjna, więc zapytanie nie zostało jeszcze wysłane: wysyłkę podłączymy razem z serwerem.';
  });

  setMode('szukam');

  // podpowiedź z adresu, np. index.html?cel=szukam&typ=biuro#kontakt (z listy ofert)
  var qs = new URLSearchParams(window.location.search);
  var cel = qs.get('cel'), typ = qs.get('typ');
  if (cel && form.querySelector('input[name="cel"][value="' + cel + '"]')) {
    form.querySelector('input[name="cel"][value="' + cel + '"]').checked = true;
    setMode(cel);
  }
  if (typ && form.querySelector('#f-type option[value="' + typ + '"]')) form.querySelector('#f-type').value = typ;
})();
