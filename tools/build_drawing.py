#!/usr/bin/env python3
"""
Generator rysunku do hero: przekrój ulicy z czterema typami nieruchomości
(lokal w kamienicy, biurowiec, hala magazynowa, działka) i opisami tego,
co sprawdzamy przy analizie lokalizacji.

Rysunek nie zależy od miasta ani od ofert. Wynik wstawiany jest do index.html
między znacznikami <!-- rysunek:start --> i <!-- rysunek:end -->.
Uruchomienie: python3 tools/build_drawing.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, G = 1600, 380, 310  # szerokość, wysokość, linia terenu

out = []
def e(s):
    out.append(s)

def r(x, y, w, h, cls, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" class="{cls}"{extra}/>'
def ln(x1, y1, x2, y2, cls):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{cls}"/>'
def pth(d, cls):
    return f'<path d="{d}" class="{cls}"/>'
def txt(x, y, s, cls, anchor='start'):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{s}</text>'

# o = obrys rysowany kreską, d = detal (pojawia się), c = opis
O1, O2, O3 = 'o lw1', 'o lw2', 'o lw3'
D0, D1, D2 = 'd lw0', 'd lw1', 'd lw2'

def callout(points, label, anchor='start'):
    (px, py) = points[0]
    d = 'M' + ' L'.join(f'{x} {y}' for x, y in points)
    tx, ty = points[-1]
    off = 6 if anchor == 'start' else -6
    return (f'<g class="c">{pth(d, "lead")}<circle cx="{px}" cy="{py}" r="2.3" class="dot"/>'
            f'{txt(tx + off, ty + 4, label, "ct", anchor)}</g>')

def dim_h(x1, x2, y, label, y_from=G + 3):
    t = lambda x: f'M{x - 4} {y + 4} L{x + 4} {y - 4}'
    return (f'<g class="c">{ln(x1, y_from, x1, y + 7, "lead")}{ln(x2, y_from, x2, y + 7, "lead")}'
            f'{ln(x1 - 6, y, x2 + 6, y, "lead")}{pth(t(x1) + " " + t(x2), "tick")}'
            f'{txt((x1 + x2) / 2, y + 19, label, "ct", "middle")}</g>')

def dim_v(x, y1, y2, label):
    t = lambda y: f'M{x - 4} {y + 4} L{x + 4} {y - 4}'
    return (f'<g class="c">{ln(x, y1 - 6, x, y2, "lead")}{ln(x - 14, y1, x + 6, y1, "lead")}'
            f'{pth(t(y1) + " " + t(y2), "tick")}{txt(x, y1 - 12, label, "ct", "middle")}</g>')

def person(x, flip=1):
    return (f'<g class="d lw1 person"><circle cx="{x}" cy="{G - 26.5}" r="3.4"/>'
            f'<path d="M{x} {G - 22} L{x} {G - 11} M{x} {G - 11} L{x - 4 * flip} {G} M{x} {G - 11} L{x + 5 * flip} {G - 1}'
            f' M{x} {G - 19} L{x - 5 * flip} {G - 13} M{x} {G - 19} L{x + 4 * flip} {G - 12}"/></g>')

# ------------------------------------------------------------ teren
e('<g class="ground">')
e(r(0, G, W, 13, 'd hatch-fill'))
e(ln(0, G, W, G, 'o lw3 ground-line'))
e('</g>')

# ------------------------------------------------------------ A: lokal w kamienicy
e('<g class="m" data-m="a" style="--i:0">')
e(ln(18, G, 18, 188, O1)); e(pth('M18 188 Q18 178 28 178 L40 178', O1)); e(r(36, 178, 10, 5, D1 + ' fill'))
e(person(48)); e(person(70, -1))
e(r(90, 110, 300, 200, O2 + ' fill'))
e(r(82, 100, 316, 10, O2 + ' fill'))
e(r(86, 234, 308, 6, O1 + ' fill'))
for top in (118, 160, 201):
    for x in (126, 192, 258, 324):
        e(r(x, top, 30, 28, D1 + ' glass'))
        e(ln(x + 15, top, x + 15, top + 28, D0)); e(ln(x, top + 9, x + 30, top + 9, D0))
        e(ln(x - 3, top + 30, x + 33, top + 30, D1))
e(r(110, 243, 170, 6, D0 + ' fill'))
e(r(110, 252, 170, 52, O1 + ' glass'))
for x in (167, 223):
    e(ln(x, 252, x, 304, D0))
e(ln(110, 262, 280, 262, D0))
e(r(300, 252, 40, 58, O1 + ' fill')); e(r(306, 258, 28, 30, D0 + ' glass')); e(ln(332, 282, 332, 290, D1))
e(callout([(56, 262), (56, 64), (72, 64)], 'ruch pieszy'))
e(dim_h(110, 280, 344, 'witryna od ulicy'))
e('</g>')

# ------------------------------------------------------------ przystanek (A/B)
e('<g class="m m--street" data-m="a" style="--i:1">')
e(ln(432, G, 432, 244, O1)); e(r(422, 228, 20, 16, O1 + ' fill'))
e(r(426, 232, 12, 7, D0)); e(f'<circle cx="429" cy="240.6" r="1.3" class="d lw0"/><circle cx="435" cy="240.6" r="1.3" class="d lw0"/>')
e(callout([(432, 228), (432, 40), (420, 40)], 'dojazd i komunikacja', 'end'))
e('</g>')

# ------------------------------------------------------------ B: biurowiec
e('<g class="m" data-m="b" style="--i:1">')
e(r(500, 50, 240, 260, O2 + ' fill'))
e(r(540, 36, 120, 14, O1 + ' fill'))
for x in range(548, 656, 8):
    e(ln(x, 39, x, 47, D0))
for x in range(524, 740, 24):
    e(ln(x, 54, x, 258, D0 + ' t60'))
for y in range(80, 260, 30):
    e(ln(500, y, 740, y, D0 + ' t60'))
e(ln(500, 260, 740, 260, D1))
for x in (540, 580, 660, 700):
    e(ln(x, 264, x, 310, D0))
e(r(600, 270, 40, 40, O1 + ' glass')); e(ln(620, 270, 620, 310, D0)); e(ln(586, 266, 654, 266, D2))
e(callout([(738, 128), (764, 128), (764, 30), (774, 30)], 'standard budynku'))
e('</g>')

# ------------------------------------------------------------ parking i drzewo (B/C)
e('<g class="m m--street" data-m="b" style="--i:2">')
e(ln(758, G, 758, 262, O1)); e(r(748, 240, 20, 22, O1 + ' fill'))
e(txt(758, 256, 'P', 'd sign-text', 'middle'))
e(callout([(758, 240), (758, 198), (776, 198)], 'parking'))
e(ln(812, G, 812, 272, O1)); e(f'<circle cx="812" cy="252" r="21" class="{O1} fill"/>')
e(pth('M800 258 Q812 246 824 258 M803 246 Q812 238 821 246', D0))
e('</g>')

# ------------------------------------------------------------ C: hala magazynowa
e('<g class="m" data-m="c" style="--i:2">')
e(r(840, 170, 380, 140, O2 + ' fill'))
e(r(836, 162, 388, 8, O1 + ' fill'))
for x in range(921, 1220, 9):
    e(ln(x, 172, x, 296, D0 + ' t45'))
e(r(840, 206, 72, 104, O1 + ' fill'))
for (x, y) in ((852, 220), (882, 220), (852, 250), (882, 250)):
    e(r(x, y, 18, 14, D0 + ' glass'))
e(r(866, 280, 22, 30, D1 + ' fill'))
e(r(930, 296, 276, 14, O1 + ' fill'))
for x in (944, 1012, 1080, 1148):
    e(r(x, 246, 46, 50, O1 + ' fill'))
    for k in range(1, 7):
        e(ln(x, 246 + 7 * k, x + 46, 246 + 7 * k, D0))
    e(r(x + 1, 297, 4, 7, D0)); e(r(x + 41, 297, 4, 7, D0))
e(callout([(1035, 246), (1035, 128), (1046, 128)], 'doki i rampy'))
e(dim_v(1238, 170, G, 'wysokość hali'))
e('</g>')

# ------------------------------------------------------------ D: działka inwestycyjna
e('<g class="m" data-m="d" style="--i:3">')
for x in range(1272, 1590, 21):
    e(pth(f'M{x} {G} l3 -6 l3 6', D0))
for x in (1292, 1566):
    e(ln(x, G, x, 274, O1)); e(r(x - 3, 266, 6, 8, D0 + ' flag'))
e(r(1320, 178, 196, 132, 'd dash'))
for y in (211, 244, 277):
    e(ln(1320, y, 1516, y, 'd dash-fine'))
e('<g class="c">' + txt(1418, 232, 'możliwa zabudowa', 'ct', 'middle') + txt(1418, 248, 'wg planu miejscowego', 'ct ct--sub', 'middle') + '</g>')
# żuraw
e(ln(1540, G, 1540, 84, O1)); e(ln(1550, G, 1550, 84, O1))
zz = 'M1540 300' + ''.join(f' L{1550 if k % 2 else 1540} {300 - 12 * k}' for k in range(1, 18))
e(pth(zz, D0))
e(ln(1400, 84, 1594, 84, O1)); e(ln(1400, 92, 1594, 92, O1))
jz = 'M1400 92' + ''.join(f' L{1400 + 12 * k} {84 if k % 2 else 92}' for k in range(1, 17))
e(pth(jz, D0))
e(pth('M1404 84 L1545 62 L1592 84', D0)); e(ln(1545, 62, 1545, 84, D0))
e(r(1576, 92, 16, 14, D1 + ' fill')); e(r(1552, 92, 12, 12, D1 + ' fill'))
e(ln(1430, 92, 1430, 150, D0)); e(r(1426, 150, 8, 6, D1 + ' fill'))
e(dim_h(1292, 1566, 344, 'front działki'))
e('</g>')

# ------------------------------------------------------------ strefy kliknięcia (zakreślenie robi CSS)
HL = {'a': (76, 90, 380, 222), 'b': (488, 22, 262, 290), 'c': (826, 148, 406, 164), 'd': (1280, 56, 316, 256)}
for k, (x, y, w, h) in HL.items():
    e(r(x, 0, w, H, 'hit', f' data-hit="{k}"'))

svg = (f'<svg class="drawing" viewBox="0 0 {W} {H}" role="img" aria-labelledby="drawing-title drawing-desc" focusable="false">'
       '<title id="drawing-title">Rysunek: lokal, biuro, magazyn i działka przy jednej ulicy</title>'
       '<desc id="drawing-desc">Opisy pokazują, co sprawdzamy: ruch pieszy, witrynę od ulicy, dojazd i komunikację, '
       'standard budynku, parking, doki i rampy, wysokość hali, front działki i możliwą zabudowę według planu miejscowego.</desc>'
       '<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
       '<line x1="0" y1="0" x2="0" y2="7" class="hatch-line"/></pattern></defs>'
       + ''.join(out) + '</svg>')

# każdy obrys dostaje pathLength=1, żeby animacja rysowania działała jednakowo
svg = re.sub(r'<(rect|line|path|circle)([^>]*class="o [^"]*")', r'<\1 pathLength="1"\2', svg)

idx = os.path.join(ROOT, 'index.html')
html = open(idx, encoding='utf-8').read()
start, end = '<!-- rysunek:start -->', '<!-- rysunek:end -->'
if start in html:
    html = html[:html.index(start) + len(start)] + '\n' + svg + '\n' + html[html.index(end):]
    open(idx, 'w', encoding='utf-8').write(html)
    print('wstawiono rysunek do index.html,', round(len(svg) / 1024, 1), 'KB')
else:
    print('brak znaczników w index.html')
