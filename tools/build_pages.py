#!/usr/bin/env python3
"""
Składa strony z części wspólnych, żeby nagłówek, stopka i metadane były wszędzie takie same.

  partials/header.html  pasek demo, nagłówek, menu mobilne (linki jak na stronie głównej: #kotwice)
  partials/footer.html  stopka

Strony mają znaczniki <!-- meta:start/end -->, <!-- include:header -->, <!-- include:footer -->;
skrypt podmienia ich zawartość, a na podstronach zamienia #kotwice na index.html#kotwice.
Tworzy też sitemap.xml i robots.txt.

Uruchom po każdej zmianie w partials/ albo w ustawieniach poniżej:
    python3 tools/build_pages.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Adres, pod którym działa strona (potrzebny do podglądu linku i mapy strony).
# Demo na GitHub Pages: https://<użytkownik>.github.io/<repozytorium>/
# Po starcie: https://www.swietnelokalizacje.pl/
SITE_URL = 'https://dominikszewczyk224180.github.io/SwietneLokalizacje/'
# Demo: pasek „wersja demonstracyjna” i blokada indeksowania w Google (fikcyjne oferty pod marką klienta).
DEMO = True

NAME = 'Świetne Lokalizacje'
PAGES = {
    'index.html': dict(home=True, title='Świetne Lokalizacje | Nieruchomości komercyjne | Kraków',
                       desc='Wyszukujemy, analizujemy i negocjujemy nieruchomości komercyjne dla firm i inwestorów: lokale, biura, magazyny i grunty.'),
    'oferty.html': dict(offers=True, title='Oferty nieruchomości komercyjnych | Świetne Lokalizacje',
                        desc='Lokale usługowe i handlowe, biura, magazyny i grunty inwestycyjne. Filtry po rodzaju, transakcji, miejscowości, powierzchni i cenie.'),
    'oferta.html': dict(offers=True, title='Oferta | Świetne Lokalizacje',
                        desc='Oferta nieruchomości komercyjnej: parametry, opis, lokalizacja i kontakt z biurem.'),
    'polityka-prywatnosci.html': dict(title='Polityka prywatności | Świetne Lokalizacje',
                                      desc='Jak Świetne Lokalizacje przetwarzają dane osobowe osób, które korzystają ze strony i formularzy.'),
    '404.html': dict(title='Nie ma takiej strony | Świetne Lokalizacje', desc='Strona nie istnieje albo zmieniła adres.', is404=True),
}
ANCHORS = ('uslugi', 'jak-pracujemy', 'dla-wlascicieli', 'o-nas', 'kontakt', 'dla-kogo')


def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def meta(page, cfg):
    url = SITE_URL + ('' if page == 'index.html' else page)
    base_path = re.sub(r'^https?://[^/]+', '', SITE_URL) or '/'
    out = []
    if cfg.get('is404'):
        out.append(f'<base href="{base_path}">')  # 404 działa pod dowolnym adresem, więc zasoby liczymy od katalogu strony
    out += [
        f'<title>{esc(cfg["title"])}</title>',
        f'<meta name="description" content="{esc(cfg["desc"])}">',
    ]
    if DEMO or cfg.get('is404'):
        out.append('<meta name="robots" content="noindex, nofollow">')
    if not cfg.get('is404'):
        out.append(f'<link rel="canonical" href="{url}">')
    out += [
        '<meta name="theme-color" content="#e6e7e3">',
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="pl_PL">',
        f'<meta property="og:site_name" content="{NAME}">',
        f'<meta property="og:title" content="{esc(cfg["title"].split(" | ")[0])}">',
        f'<meta property="og:description" content="{esc(cfg["desc"])}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE_URL}img/og-image.png">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
        '<link rel="apple-touch-icon" href="img/apple-touch-icon.png">',
        '<link rel="preload" href="fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>',
        "<script>document.documentElement.classList.add('js');</script>",
    ]
    if cfg.get('home'):
        ld = {
            '@context': 'https://schema.org', '@type': 'RealEstateAgent', 'name': NAME,
            'description': cfg['desc'], 'url': SITE_URL, 'email': 'biuro@swietnelokalizacje.pl',
            'image': SITE_URL + 'img/og-image.png',
            'memberOf': {'@type': 'Organization', 'name': 'Małopolskie Stowarzyszenie Pośredników w Obrocie Nieruchomościami'},
            'knowsAbout': ['nieruchomości komercyjne', 'doradztwo lokalizacyjne', 'lokale usługowe', 'biura', 'magazyny', 'grunty inwestycyjne'],
        }
        out.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')
    return '\n'.join('  ' + l for l in out)


def sub_links(html, cfg):
    html = html.replace('href="./"', 'href="index.html"')
    for a in ANCHORS:
        html = html.replace(f'href="#{a}"', f'href="index.html#{a}"')
    html = html.replace('href="index.html#kontakt" data-prefill="szukam"', 'href="index.html?cel=szukam#kontakt"')
    if cfg.get('offers'):
        html = html.replace('<a href="oferty.html">Oferty</a>', '<a href="oferty.html" aria-current="page">Oferty</a>')
    return html


def put(html, start, end, content):
    a, b = html.index(start) + len(start), html.index(end)
    return html[:a] + '\n' + content + '\n' + html[b:]


def ensure_markers(html):
    """Pierwsze uruchomienie: dodaje znaczniki do stron, które ich jeszcze nie mają."""
    if '<!-- meta:start -->' not in html:
        a = html.index('  <title>')
        m = re.search(r'  <link rel="preload"[^>]*>\n', html)
        b = m.end() if m else html.index('  <link rel="stylesheet"')
        html = html[:a] + '  <!-- meta:start -->\n  <!-- meta:end -->\n' + html[b:]
        html = re.sub(r'  <meta name="(description|theme-color)"[^>]*>\n', '', html)
        html = re.sub(r'  <meta property="og:[^>]*>\n', '', html)
    if '<!-- include:header -->' not in html:
        a = html.index('  <a class="skip-link"')
        b = html.index('</header>') + len('</header>')
        html = html[:a] + '  <!-- include:header -->\n  <!-- /include:header -->' + html[b:]
    if '<!-- include:footer -->' not in html:
        a = html.index('  <footer class="site-footer">')
        b = html.index('</footer>') + len('</footer>')
        html = html[:a] + '  <!-- include:footer -->\n  <!-- /include:footer -->' + html[b:]
    return html


def main():
    header = open(os.path.join(ROOT, 'partials/header.html'), encoding='utf-8').read().split('\n', 1)[1].rstrip()
    footer = open(os.path.join(ROOT, 'partials/footer.html'), encoding='utf-8').read().split('\n', 1)[1].rstrip()
    if not DEMO:
        header = re.sub(r'  <!-- demo-bar:start -->.*?<!-- demo-bar:end -->\n', '', header, flags=re.S)
    for page, cfg in PAGES.items():
        path = os.path.join(ROOT, page)
        if not os.path.exists(path):
            print('pominięto (brak pliku):', page)
            continue
        html = ensure_markers(open(path, encoding='utf-8').read())
        h, f = (header, footer) if cfg.get('home') else (sub_links(header, cfg), sub_links(footer, cfg))
        html = put(html, '<!-- meta:start -->', '<!-- meta:end -->', meta(page, cfg))
        html = put(html, '<!-- include:header -->', '<!-- /include:header -->', h)
        html = put(html, '<!-- include:footer -->', '<!-- /include:footer -->', f)
        open(path, 'w', encoding='utf-8').write(html)
        print('złożono', page)

    # mapa strony i robots.txt
    data = open(os.path.join(ROOT, 'js/offers-data.js'), encoding='utf-8').read()
    ids = [m.group(1) for m in re.finditer(r"id: '([a-z0-9-]+)'[^\n]*\n\s+type: '[a-z]+', deal: '[a-z]+', visibility: 'public'", data)]
    urls = [SITE_URL, SITE_URL + 'oferty.html', SITE_URL + 'polityka-prywatnosci.html'] + [SITE_URL + 'oferta.html?id=' + i for i in ids]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
         ''.join(f'  <url><loc>{u.replace("&", "&amp;")}</loc></url>\n' for u in urls) + '</urlset>\n'
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(sm)
    robots = 'User-agent: *\nDisallow: /\n' if DEMO else f'User-agent: *\nAllow: /\nSitemap: {SITE_URL}sitemap.xml\n'
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write(robots)
    print('sitemap.xml:', len(urls), 'adresów; robots.txt:', 'blokada (demo)' if DEMO else 'otwarte')


if __name__ == '__main__':
    main()
