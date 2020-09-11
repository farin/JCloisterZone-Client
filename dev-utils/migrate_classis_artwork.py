#!/usr/ bin/env python3
import re
import json
from collections import defaultdict

def rotate90(path):
    res = []
    xi = None
    for i, token in enumerate(re.split("(\D+)", path)):
        res.append(token)
        if not token or not token[0].isdigit():
            continue
        if xi is None:
            xi = i
            continue

        x = int(res[xi])
        y = int(token)

        if x == 999:
            x = 1000
        if y == 999:
            y = 1000

        res[xi] = str(1000 - y)
        res[-1] = str(x)
        xi = None

    return "".join(res)


def fix(path):
    return rotate90(rotate90(rotate90(rotate90(path))))

def norm(path):
    points = [p[1:] for p in path.split() if p != 'Z']
    return ' '.join(sorted(points))


with open('../src/renderer/static/artworks/classic/artwork.json') as f:
    artwork = json.load(f)


features = {}

for tile_id, tile in artwork['tiles'].items():
    tile['image'] = 'images/' + tile_id
    for loc, f in tile['features'].items():
        f['shape'] = fix(f['shape'])
        shape = f['shape']
        agg = features.get(norm(shape))
        if not agg:
            # print(tile_id, loc)
            # print(0, " ", shape)
            for i in range(3):
                shape = rotate90(shape)
                # print(i+1, " ", shape)
                agg = features.get(norm(shape))
                if agg:
                    rotation = (i + 1) * 90
                    break
        else:
            rotation = 0

        if not agg:
            rotation = 0
            agg = {
                "shape": f['shape'],
                "point": f['point'],
                "tiles": [],
                'name': None
            }
            features[norm(f['shape'])] = agg

        agg['tiles'].append({
            "tile": tile_id,
            "loc": loc,
            "rotation": rotation
        })

        f['agg'] = agg
        f['rotation'] = rotation

        # if rotation > 0:
        #     print(tile_id + " " + loc + " is " + str(rotation) + " rotation of " + agg['tiles'][0]['tile'] + " " + agg['tiles'][0]['loc'])

name_counter = defaultdict(int)
fjson = {}

for f in features.values():
    if len(f['tiles']) > 1:
        sample_loc = f['tiles'][0]['loc']
        tiles_ids = [t['tile'] for t in f['tiles']]
        if sample_loc == 'TOWER':
            name = 'tower'
        elif sample_loc == 'CLOISTER':
            name = 'cloister'
        elif 'INNER_FARM' in sample_loc or 'R.' in sample_loc or 'L.' in sample_loc or sample_loc in ['EL', 'ER', 'SL', 'SR', 'NL', 'NR', 'WR', 'WL']:
            name = 'farm'
        elif any('R' not in t for t in tiles_ids):
            name = 'city'
        elif any('C' not in t for t in tiles_ids):
            name = 'road'
        elif len(sample_loc) == 1 and any('r' in t for t in tiles_ids):
            name = 'city'
        elif len(sample_loc) == 1 and any('c' in t for t in tiles_ids):
            name = 'road'
        elif len(sample_loc) == 2 and any('r' not in t for t in tiles_ids):
            name = 'city'
        elif len(sample_loc) == 2 and any('c' not in t for t in tiles_ids):
            name = 'road'
        elif 'RI.1/CIRI' in tiles_ids and sample_loc == 'N':
            name = 'city'
        elif 'BA/CRRR' in tiles_ids and sample_loc == 'N':
            name = 'city'
        elif 'IC/CRCR' in tiles_ids and sample_loc == 'S':
            name = 'city'
        elif 'BB/CCCR' in tiles_ids and sample_loc == 'S':
            name = 'road'
        elif 'BB/CFR.b' in tiles_ids and sample_loc == 'N':
            name = 'city'
        else:
            print("Unknown " + str(tiles_ids) + " " + sample_loc)
            print(f['tiles'])

        prefix = f"{name}.{sample_loc}"
        c = 1 + name_counter[prefix]
        f['name'] = f"{name}.{sample_loc}-{c:02d}"
        name_counter[prefix] += 1

        fjson[f['name']] = {
            "clip": f['shape'],
            "point": f['point']
        }

        # print(f['shape'])
        # print([t['tile'] + ":" + t['loc'] for t in f['tiles']])

sorted_fjson = { k: fjson[k] for k in sorted(fjson.keys())}
artwork['features'] = sorted_fjson

for tile_id, tile in artwork['tiles'].items():
    tile['background'] = 'images/' + tile_id + '.jpg'
    del tile['image']
    res = {}
    for loc, f in tile['features'].items():
        name = f['agg']['name']
        if name is None:
            res[loc] = {
                "clip": f['shape'],
                "point": f['point']
            }
        else:
            if f['rotation']:
                r = f['rotation']
                if r == 90:
                    r = 270
                elif r == 270:
                    r = 90
                res[loc] = { "id": name, "rotation": r}
            else:
                res[loc] = name

    tile['features'] = res

# reorder json keys
t = artwork['tiles']
del artwork['tiles']
artwork['tiles'] = t

print(json.dumps(artwork, indent=2, ensure_ascii=False))
# print(list(sorted_fjson.keys()))

# print(features)
