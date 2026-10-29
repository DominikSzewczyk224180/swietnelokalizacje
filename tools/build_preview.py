#!/usr/bin/env python3
"""Składa całą stronę w jeden plik HTML (CSS, JS i fonty w środku) do szybkiego podglądu.
Uruchomienie: python3 tools/build_preview.py  ->  podglad.html"""
import base64, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()

def font_uri(m):
    path = os.path.normpath(os.path.join(ROOT, 'css', m.group(1)))
    data = base64.b64encode(open(path, 'rb').read()).decode('ascii')
    return 'url("data:font/woff2;base64,' + data + '")'

def inline_css(m):
    css = open(os.path.join(ROOT, m.group(1)), encoding='utf-8').read()
    css = re.sub(r'url\("(\.\./fonts/[^"]+)"\)', font_uri, css)
    return '<style>\n' + css + '\n</style>'

html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
scripts = re.findall(r'<script src="([^"]+)" defer></script>', html)
html = re.sub(r'\s*<script src="[^"]+" defer></script>', '', html)
body = ''.join('<script>\n' + open(os.path.join(ROOT, s), encoding='utf-8').read() + '\n</script>\n' for s in scripts)
html = html.replace('</body>', body + '</body>')
out = os.path.join(ROOT, 'podglad.html')
open(out, 'w', encoding='utf-8').write(html)
print('zapisano', out, round(len(html.encode('utf-8')) / 1024), 'KB')
