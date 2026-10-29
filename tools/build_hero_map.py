#!/usr/bin/env python3
"""
Generator danych mapy do hero (Etap 1).

Tworzy plik js/hero-map-data.js z:
  * warstwami mapy Krakowa (ulice w 3 klasach, Wisła, bulwary, Planty, parki, tramwaje, opisy dzielnic),
  * przykładowymi ofertami (DEMO) i ich strefami dojścia pieszo 5/10/15 min,
  * analizą: przystanki i linie w zasięgu 5 min, najbliższy przystanek, czas dojścia na Rynek Główny.

Źródła danych (pobierane automatycznie do tools/.cache):
  * ulice: OpenStreetMap (ODbL, © autorzy OpenStreetMap), eksport Overpass z repozytorium slotocki/ulice_krakowa
  * granice dzielnic (z nich wyliczany jest bieg Wisły): andilabs/krakow-dzielnice-geojson
  * przystanki i trasy tramwajowe: Miqell24/krakow-bus-map (GTFS ZTP Kraków + OSM)

Uruchomienie:  python3 tools/build_hero_map.py
Wymaga: pip install shapely numpy networkx
"""
import json, math, glob, os, sys, tarfile, io, urllib.request, collections
import numpy as np
import networkx as nx
import shapely
from shapely.geometry import LineString, MultiLineString, Point, Polygon, MultiPolygon, box, shape
from shapely.ops import unary_union, linemerge, polygonize, nearest_points

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, '.cache')
OUT = os.path.join(ROOT, 'js', 'hero-map-data.js')

SOURCES = {
    'ulice_krakowa': 'https://codeload.github.com/slotocki/ulice_krakowa/tar.gz/refs/heads/main',
    'krakow-dzielnice-geojson': 'https://codeload.github.com/andilabs/krakow-dzielnice-geojson/tar.gz/refs/heads/master',
    'krakow-bus-map': 'https://codeload.github.com/Miqell24/krakow-bus-map/tar.gz/refs/heads/main',
}

def fetch_sources():
    os.makedirs(CACHE, exist_ok=True)
    for name, url in SOURCES.items():
        dest = os.path.join(CACHE, name)
        if os.path.isdir(dest):
            continue
        print('pobieram', name)
        data = urllib.request.urlopen(url).read()
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tf:
            for m in tf.getmembers():
                parts = m.name.split('/', 1)
                if len(parts) < 2 or not parts[1]:
                    continue
                m.name = parts[1]
                tf.extract(m, dest)

# --- odwzorowanie: lokalne metry wokół centrum Krakowa (y w dół, jak w SVG) ---
LON0, LAT0 = 19.945, 50.057
KX = math.cos(math.radians(LAT0)) * 111320.0
KY = 110574.0
def to_xy(lon, lat):
    return ((lon - LON0) * KX, -(lat - LAT0) * KY)
def tx(geom):
    return shapely.transform(geom, lambda a: np.column_stack(((a[:, 0] - LON0) * KX, -(a[:, 1] - LAT0) * KY)))

# Zasięg mapy w metrach (zachód, północ, wschód, południe)
X0, Y0, X1, Y1 = -4400, -2800, 4000, 3100
BBOX = box(X0, Y0, X1, Y1)
UNIT = 2.0  # 1 jednostka SVG = 2 m

WALK = 80.0  # m/min, ok. 4,8 km/h
LEVELS = [5, 10, 15]

# --- przykładowe oferty (DEMO, lokalizacje przybliżone) ---
OFFERS = [
    {
        'id': 'demo-kazimierz', 'at': (20, 640),
        'district': 'Kazimierz', 'type': 'Lokal usługowy z witryną',
        'area': '86 m²', 'detail': 'parter, witryna 7 m, wejście od ulicy',
        'price': '12 900 zł netto / mies.', 'priceNote': '150 zł/m²', 'deal': 'Najem',
    },
    {
        'id': 'demo-zablocie', 'at': (1210, 810),
        'district': 'Zabłocie', 'type': 'Biuro typu loft',
        'area': '140 m²', 'detail': '2. piętro, winda, 2 miejsca postojowe',
        'price': '10 500 zł netto / mies.', 'priceNote': '75 zł/m²', 'deal': 'Najem',
    },
    {
        'id': 'demo-grzegorzki', 'at': (860, -140),
        'district': 'Grzegórzki', 'type': 'Lokal handlowy z najemcą',
        'area': '62 m²', 'detail': 'najemca sieciowy, umowa do 2031',
        'price': '1 190 000 zł netto', 'priceNote': 'stopa zwrotu 7,1%', 'deal': 'Sprzedaż',
    },
]
RYNEK = (-545, -503)

def load_ways():
    ways = {}
    for fn in sorted(glob.glob(os.path.join(CACHE, 'ulice_krakowa/data/osm_chunks/*.json'))):
        for e in json.load(open(fn))['elements']:
            if e['type'] == 'way' and 'geometry' in e:
                ways[e['id']] = e
    return list(ways.values())

def road_class(hw):
    if hw in ('primary', 'secondary', 'trunk', 'motorway'):
        return 'major'
    if hw == 'tertiary':
        return 'mid'
    return 'minor'

# ---------------------------------------------------------------- zapis SVG
def q(v):
    return int(round(v / UNIT))

def path_lines(lines, tol=3.0, min_len=0):
    """Wiele linii -> jedna ścieżka SVG z komendami względnymi."""
    out = []
    for ln in lines:
        if ln.length < min_len:
            continue
        s = ln.simplify(tol)
        pts = [(q(x - X0), q(y - Y0)) for x, y in s.coords]
        ded = [pts[0]]
        for p in pts[1:]:
            if p != ded[-1]:
                ded.append(p)
        if len(ded) < 2:
            continue
        seg = ['M%d %d' % ded[0]]
        rel = []
        for a, b in zip(ded, ded[1:]):
            rel.append('%d %d' % (b[0] - a[0], b[1] - a[1]))
        seg.append('l' + ' '.join(rel))
        out.append(''.join(seg))
    return ''.join(out)

def path_poly(geom, tol=4.0):
    out = []
    polys = getattr(geom, 'geoms', [geom])
    for pg in polys:
        if pg.is_empty or pg.geom_type != 'Polygon':
            continue
        pg = pg.simplify(tol)
        for ring in [pg.exterior] + list(pg.interiors):
            pts = [(q(x - X0), q(y - Y0)) for x, y in ring.coords]
            ded = [pts[0]]
            for p in pts[1:]:
                if p != ded[-1]:
                    ded.append(p)
            if len(ded) < 4:
                continue
            rel = ['%d %d' % (b[0] - a[0], b[1] - a[1]) for a, b in zip(ded, ded[1:-1])]
            out.append('M%d %d' % ded[0] + 'l' + ' '.join(rel) + 'z')
    return ''.join(out)

def pt(xy):
    return [round((xy[0] - X0) / UNIT, 1), round((xy[1] - Y0) / UNIT, 1)]

def river_label_at(line, prefer, seg=520, max_angle=22):
    """Miejsce na napis Wisła: możliwie prosty odcinek, blisko wskazanego punktu."""
    L = line.length
    best = None
    core = box(-1800, -1500, 2600, 1800)
    for s in np.arange(seg / 2, L - seg / 2, 20):
        a = line.interpolate(s - seg / 2)
        b = line.interpolate(s + seg / 2)
        m = line.interpolate(s)
        ang = math.degrees(math.atan2(b.y - a.y, b.x - a.x))
        chord = LineString([a, b])
        dev = max(line.interpolate(s - seg / 2 + k * seg / 8).distance(chord) for k in range(9))
        if abs(ang) > max_angle or dev > 25 or not core.contains(m):
            continue
        d = math.hypot(m.x - prefer[0], m.y - prefer[1])
        if best is None or d < best[0]:
            best = (d, s)
    return round((best[1] if best else L * 0.5) / L, 4)

def main():
    fetch_sources()
    ways = load_ways()
    print('ulic (odcinków OSM):', len(ways))

    # ---- ulice
    layers = {'major': [], 'mid': [], 'minor': []}
    graph_lines = []
    for w in ways:
        ln = LineString([to_xy(p['lon'], p['lat']) for p in w['geometry']])
        graph_lines.append((w, ln))
        if not ln.intersects(BBOX):
            continue
        clipped = ln.intersection(BBOX)
        for g in getattr(clipped, 'geoms', [clipped]):
            if g.geom_type == 'LineString' and g.length > 1:
                layers[road_class(w['tags'].get('highway'))].append(g)

    # ---- Wisła z granic dzielnic (granica płn./płd. biegnie osią rzeki)
    dz = json.load(open(os.path.join(CACHE, 'krakow-dzielnice-geojson/krakow-dzielnice.geojson')))
    G = {}
    for f in dz['features']:
        G[f['properties']['name'].split()[1]] = tx(shape(f['geometry']).buffer(0))
    north = unary_union([G['I'], G['II'], G['VII'], G['XIV']])
    south = unary_union([G['VIII'], G['XIII']])
    river = linemerge(north.boundary.intersection(south.boundary))
    river = river.intersection(BBOX.buffer(400))
    river = max(getattr(river, 'geoms', [river]), key=lambda g: g.length)
    # wygładzenie (Chaikin), żeby nie było schodków granic administracyjnych
    def chaikin(coords, it=3):
        c = np.array(coords)
        for _ in range(it):
            q1 = 0.75 * c[:-1] + 0.25 * c[1:]
            q2 = 0.25 * c[:-1] + 0.75 * c[1:]
            c = np.vstack([c[:1], np.column_stack([q1, q2]).reshape(-1, 2), c[-1:]])
        return c
    river_s = LineString(chaikin(river.simplify(15).coords))
    if river_s.coords[0][0] > river_s.coords[-1][0]:
        river_s = LineString(list(river_s.coords)[::-1])  # z zachodu na wschód

    # ---- Planty: pas wewnątrz obwodnicy Starego Miasta
    ring_names = {'Basztowa', 'Westerplatte', 'Świętej Gertrudy', 'Podzamcze', 'Floriana Straszewskiego', 'Podwale', 'Juliana Dunajewskiego'}
    ring = [ln for w, ln in graph_lines if w['tags'].get('name') in ring_names and ln.distance(Point(RYNEK)) < 900]
    hull = unary_union(ring).convex_hull
    planty = hull.buffer(-16).difference(hull.buffer(-72))

    # ---- parki: ściany grafu ulic zawierające punkt parku
    lm = json.load(open(os.path.join(CACHE, 'ulice_krakowa/data/krakow_landmarks.geojson')))
    park_pts = []
    for f in lm['features']:
        p = f['properties']
        if p.get('landmark_group') == 'parks' and not p['name']['pl'].startswith(('Bulwar', 'Planty')):
            x, y = to_xy(*f['geometry']['coordinates'])
            park_pts.append((p['name']['pl'], Point(x, y)))
    park_pts.append(('Błonia', Point(to_xy(19.9125, 50.0590))))
    local = [ln for w, ln in graph_lines if ln.intersects(BBOX.buffer(300))]
    noded = unary_union(local)
    faces = list(polygonize(noded))
    parks = []
    for name, p in park_pts:
        if not BBOX.contains(p):
            continue
        cand = [f for f in faces if f.contains(p)]
        if cand:
            f = min(cand, key=lambda g: g.area)
            if 8000 < f.area < 1_400_000:
                parks.append((name, f.buffer(-9)))
    print('parki:', [(n, int(f.area)) for n, f in parks])

    # ---- tramwaje
    route = json.load(open(os.path.join(CACHE, 'krakow-bus-map/docs/data/route.geojson')))
    trams = [tx(shape(f['geometry'])) for f in route['features'] if f['properties'].get('mode') == 'tram']
    tram_net = unary_union([t.intersection(BBOX) for t in trams]).simplify(4)
    tram_lines = [g for g in getattr(tram_net, 'geoms', [tram_net]) if g.geom_type == 'LineString']

    # ---- graf pieszy
    Gw = nx.Graph()
    coords = {}
    for w, ln in graph_lines:
        if not ln.intersects(BBOX.buffer(2500)):
            continue
        ids = w['nodes']
        geo = [to_xy(p['lon'], p['lat']) for p in w['geometry']]
        for i in range(len(ids) - 1):
            a, b = ids[i], ids[i + 1]
            coords[a], coords[b] = geo[i], geo[i + 1]
            L = math.dist(geo[i], geo[i + 1])
            if not Gw.has_edge(a, b) or Gw[a][b]['len'] > L:
                Gw.add_edge(a, b, len=L)
    # Kładka Ojca Bernatka (pieszo-rowerowa, w OSM to footway bez nazwy ulicy)
    bern = Point(179, 1154)
    def side(p):
        np_ = nearest_points(river_s, p)[0]
        i = river_s.project(np_)
        a = river_s.interpolate(max(0, i - 5)); b = river_s.interpolate(min(river_s.length, i + 5))
        return np.sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x))
    near = sorted(coords, key=lambda n: math.dist(coords[n], (bern.x, bern.y)))[:80]
    s0 = side(bern.buffer(1).centroid)
    na = next(n for n in near if side(Point(coords[n])) < 0 and n in Gw)
    nb = next(n for n in near if side(Point(coords[n])) > 0 and n in Gw)
    Gw.add_edge(na, nb, len=math.dist(coords[na], coords[nb]) * 1.05)
    print('graf: węzłów', Gw.number_of_nodes(), 'krawędzi', Gw.number_of_edges())

    # Łączniki piesze: w danych są tylko ulice z nazwą, więc brakuje ścieżek, przejść
    # i krótkich łączników. Ślepe końce łączymy z najbliższym węzłem innej ulicy (do 45 m),
    # a w obrębie Plant (do 130 m) z obwodnicą, bez przecinania Wisły.
    river_block = river_s.buffer(45)
    nodes = np.array(list(coords.keys()))
    nxy = np.array([coords[n] for n in nodes])
    ring_nodes = {n for w, ln in graph_lines if w['tags'].get('name') in ring_names for n in w['nodes'] if n in coords}
    old_town = hull.buffer(-10)
    added = 0
    for n in list(Gw.nodes):
        if Gw.degree(n) != 1:
            continue
        x, y = coords[n]
        in_planty = old_town.contains(Point(x, y)) and hull.exterior.distance(Point(x, y)) < 130
        R = 130 if in_planty else 45
        d = np.hypot(nxy[:, 0] - x, nxy[:, 1] - y)
        order = np.argsort(d)
        for i in order[1:40]:
            if d[i] > R:
                break
            m = nodes[i]
            if m == n or m not in Gw or Gw.has_edge(n, m):
                continue
            if in_planty and d[i] > 45 and m not in ring_nodes:
                continue
            try:
                gd = nx.shortest_path_length(Gw, n, m, weight='len')
                if gd < 2.5 * d[i] + 30:
                    continue  # już dobrze połączone
            except nx.NetworkXNoPath:
                pass
            seg = LineString([(x, y), coords[m]])
            if seg.intersects(river_block):
                continue
            Gw.add_edge(n, m, len=float(d[i]) * 1.15)
            added += 1
            break
    # Drugi rodzaj łączników: bliskie (do 30 m) węzły ulic, które się nie stykają
    # (np. zjazdy i chodniki bez nazwy, których nie ma w danych). Pomijamy mosty.
    from scipy.spatial import cKDTree
    node_ways = collections.defaultdict(set)
    bridge_nodes = set()
    for w, ln in graph_lines:
        for n in w['nodes']:
            if n in coords:
                node_ways[n].add(w['id'])
                if w['tags'].get('bridge'):
                    bridge_nodes.add(n)
    way_touch = collections.defaultdict(set)
    for n, ws in node_ways.items():
        for a in ws:
            way_touch[a] |= ws
    gnodes = [n for n in nodes if n in Gw and n not in bridge_nodes]
    gxy = np.array([coords[n] for n in gnodes])
    tree = cKDTree(gxy)
    added2 = 0
    for i, j in sorted(tree.query_pairs(30.0)):
        a, b = gnodes[i], gnodes[j]
        wa, wb = node_ways[a], node_ways[b]
        if wa & wb or any(wb & way_touch[x] for x in wa):
            continue
        seg = LineString([coords[a], coords[b]])
        if seg.intersects(river_block):
            continue
        Gw.add_edge(a, b, len=seg.length * 1.2)
        added2 += 1
    print('łączniki piesze:', added, '+ zbliżenia:', added2)
    def snap(xy):
        d = np.hypot(nxy[:, 0] - xy[0], nxy[:, 1] - xy[1])
        i = int(np.argmin(d))
        return nodes[i], float(d[i])

    # ---- przystanki
    stops = json.load(open(os.path.join(CACHE, 'krakow-bus-map/docs/data/stops.geojson')))
    stop_list = []
    for f in stops['features']:
        x, y = to_xy(*f['geometry']['coordinates'])
        if BBOX.buffer(1500).contains(Point(x, y)):
            p = f['properties']
            stop_list.append({'name': p['name'], 'mode': p['mode'], 'lines': p.get('arr') or [], 'xy': (x, y)})
    for s in stop_list:
        s['node'], s['snap'] = snap(s['xy'])

    rynek_node, rynek_snap = snap(RYNEK)
    out_offers = []
    for o in OFFERS:
        src, d0 = snap(o['at'])
        print(' ', o['district'], 'przyciągnięte do węzła', src, 'odl.', round(d0), 'm')
        dist = nx.single_source_dijkstra_path_length(Gw, src, cutoff=max(LEVELS) * WALK + 200, weight='len')
        zones = []
        for m in LEVELS:
            T = m * WALK - d0
            segs = []
            for u, v, data in Gw.edges(data=True):
                du, dv, L = dist.get(u), dist.get(v), data['len']
                if du is None and dv is None:
                    continue
                pu, pv = coords[u], coords[v]
                if du is not None and dv is not None and du + L <= T + 1e-6 and dv + L <= T + 1e-6:
                    segs.append(LineString([pu, pv])); continue
                for dn, pa, pb in ((du, pu, pv), (dv, pv, pu)):
                    if dn is not None and dn < T:
                        f = min(1.0, (T - dn) / L) if L > 0 else 0
                        if f > 0:
                            segs.append(LineString([pa, (pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f)]))
            # bufor wokół osiągalnych odcinków (pierzeje po obu stronach ulicy),
            # potem domknięcie, żeby strefa była ciągła tam, gdzie w danych brakuje ścieżek
            area = unary_union([s.buffer(62, quad_segs=4) for s in segs])
            area = area.buffer(80, quad_segs=4).buffer(-80, quad_segs=4)
            def fill(pg):
                return Polygon(pg.exterior, [r for r in pg.interiors if Polygon(r).area > 160000])
            area = unary_union([fill(p) for p in getattr(area, 'geoms', [area]) if p.area > 4000])
            zones.append(area)
        # analiza liczona po sieci (odległość dojścia), a nie po kształcie strefy
        def stop_time(s):
            dd = dist.get(s['node'])
            return None if dd is None else dd + d0 + s['snap']
        timed = [(stop_time(s), s) for s in stop_list]
        timed = [(t, s) for t, s in timed if t is not None]
        in5 = [s for t, s in timed if t <= LEVELS[0] * WALK]
        names5 = sorted({s['name'] for s in in5})
        lines5 = sorted({l for s in in5 for l in s['lines']}, key=lambda v: (len(v), v))
        best = None
        for s in stop_list:
            dd = dist.get(s['node'])
            if dd is None:
                continue
            t = dd + d0 + s['snap']
            if best is None or t < best[0]:
                best = (t, s['name'])
        rd = nx.shortest_path_length(Gw, src, rynek_node, weight='len') + d0 + rynek_snap
        # przystanki do pokazania w strefie 15 min (unikalne nazwy, środek ciężkości peronów)
        in15 = collections.defaultdict(list)
        for t, s in timed:
            if t <= LEVELS[-1] * WALK:
                in15[(s['name'], 'tram' if s['mode'] == 'tram' else 'bus')].append((t, s['xy']))
        shown = []
        for (nm, md), items in in15.items():
            c = np.mean(np.array([xy for _, xy in items]), axis=0)
            tmin = min(t for t, _ in items)
            shown.append({'p': pt(c), 'm': md, 'z': next(i for i, mz in enumerate(LEVELS) if tmin <= mz * WALK)})
        out_offers.append({
            **{k: v for k, v in o.items() if k != 'at'},
            'pin': pt(o['at']),
            'zones': [path_poly(z, tol=5) for z in zones],
            'stops': shown,
            'stats': {
                'stops5': len(names5), 'lines5': len(lines5),
                'nearest': best[1] if best else None,
                'nearestMin': max(1, round(best[0] / WALK)) if best else None,
                'rynekMin': max(1, round(rd / WALK)),
            },
        })
        print(o['district'], 'przystanki 5 min:', len(names5), 'linie:', len(lines5), 'najbliższy:', best[1], round(best[0] / WALK, 1), 'min, Rynek:', round(rd / WALK, 1), 'min')

    # ---- opisy dzielnic (pozycje sprawdzone na danych ulic)
    labels = [
        ('Stare Miasto', (-560, -700)), ('Kazimierz', (330, 700)), ('Podgórze', (420, 1590)),
        ('Zabłocie', (1420, 980)), ('Grzegórzki', (1350, -330)), ('Kleparz', (-140, -1420)),
        ('Dębniki', (-1650, 1150)), ('Ludwinów', (-700, 1640)), ('Wesoła', (600, -520)),
        ('Piasek', (-1300, -850)),
        ('Krowodrza', (-1900, -2050)), ('Płaszów', (2350, 1750)), ('Wawel', (-690, 330)),
    ]
    data = {
        'size': [q(X1 - X0), q(Y1 - Y0)],
        'unit': UNIT,
        'pxPerUnitHint': 'skala liczona w hero.js',
        'roads': {k: path_lines(v, tol=3) for k, v in layers.items()},
        'river': path_lines([river_s], tol=0),
        'planty': path_poly(planty, tol=3),
        'parks': path_poly(unary_union([f for _, f in parks]), tol=4),
        'trams': path_lines(tram_lines, tol=4, min_len=40),
        'riverLabelAt': river_label_at(river_s, prefer=(1700, 350)),
        'labels': [{'t': t, 'p': pt(xy), 'k': 'park' if t == 'Błonia' else 'landmark' if t == 'Wawel' else 'district'} for t, xy in labels],
        'offers': out_offers,
        'walk': {'speed': WALK, 'levels': LEVELS},
        'attribution': 'Dane mapy: © autorzy OpenStreetMap (ODbL). Przystanki: ZTP Kraków (GTFS).',
    }
    js = ('/* Wygenerowane przez tools/build_hero_map.py. Nie edytuj ręcznie. */\n'
          'window.SL_HERO_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write(js)
    print('zapisano', OUT, round(len(js.encode('utf-8')) / 1024), 'KB')
    for k, v in data['roads'].items():
        print(' ', k, round(len(v) / 1024), 'KB')

if __name__ == '__main__':
    main()
