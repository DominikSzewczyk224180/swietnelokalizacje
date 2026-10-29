#!/usr/bin/env python3
"""Składa każdą stronę w jeden plik HTML (CSS, JS i fonty w środku) do szybkiego podglądu:
index.html -> podglad.html, oferty.html -> podglad-oferty.html, oferta.html -> podglad-oferta.html.
Mapa w karcie oferty ładuje się z vendor/, więc w samym podglądzie pokaże wersję zastępczą.
Uruchomienie: python3 tools/build_preview.py"""
import base64, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = {'index.html': 'podglad.html', 'oferty.html': 'podglad-oferty.html', 'oferta.html': 'podglad-oferta.html'}

def font_uri(m):
    path = os.path.normpath(os.path.join(ROOT, 'css', m.group(1)))
    return 'url("data:font/woff2;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii') + '")'

def inline_css(m):
    css = open(os.path.join(ROOT, m.group(1)), encoding='utf-8').read()
    return '<style>\n' + re.sub(r'url\("(\.\./fonts/[^"]+)"\)', font_uri, css) + '\n</style>'

for src, dst in PAGES.items():
    html = open(os.path.join(ROOT, src), encoding='utf-8').read()
    html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
    scripts = re.findall(r'<script src="([^"]+)" defer></script>', html)
    html = re.sub(r'\s*<script src="[^"]+" defer></script>', '', html)
    body = ''.join('<script>\n' + open(os.path.join(ROOT, s), encoding='utf-8').read() + '\n</script>\n' for s in scripts)
    html = html.replace('</body>', body + '</body>')
    # linki między stronami prowadzą do plików podglądu
    html = html.replace('oferta.html?id=', 'podglad-oferta.html?id=').replace('"oferty.html', '"podglad-oferty.html').replace("'oferty.html", "'podglad-oferty.html")
    html = html.replace('"index.html', '"podglad.html')
    if src == 'oferta.html':  # podgląd bez parametru pokazuje pierwszą ofertę
        html = html.replace("new URLSearchParams(window.location.search).get('id');", "new URLSearchParams(window.location.search).get('id') || 'lokal-kazimierz';")
    open(os.path.join(ROOT, dst), 'w', encoding='utf-8').write(html)
    print('zapisano', dst, round(len(html.encode('utf-8')) / 1024), 'KB')
