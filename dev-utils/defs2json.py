#!/usr/bin/env python3
import json
import xml.etree.ElementTree as ET
import glob

SIDES = ['N', 'E', 'S', 'W']


def get_feature_signature(feature):
    a = []
    for k in sorted(feature.attrib.keys()):
        a.append(f'{k}={feature.attrib[k]}')
    return (feature.tag, ','.join(a))


def get_feature_code(f):
    if f == 'city':
        return 'c'
    if f == 'road':
        return 'r'
    if f == 'farm':
        return 'f'
    if f == 'river':
        return 'i'
    return '*'


def get_symmetry(features):
    sym0 = (features.get('N') != features.get('S') or features.get('NL') != features.get('SL') or features.get('WR') != features.get('SR') or
            features.get('W') != features.get('E') or features.get('WL') != features.get('EL') or features.get('WR') != features.get('ER'))
    if sym0:
        return 0

    sym2 = features.get('N') != features.get('E') or features.get('NL') != features.get('EL') or features.get('NR') != features.get('ER')
    return 2 if sym2 else 4


def get_edges(features):
    sides = []
    for side in SIDES:
        f = features.get(side)
        if f:
            sides.append(get_feature_code(f[0]))
        else:
            sides.append('f' if features.get(side + 'L') else '*')
    return ''.join(sides)


tiles = {}
multi_tiles = {}
sets = {}

for f in glob.glob("src/tile-definitions-xml/**/*.xml", recursive=True):
    print(f"Parsing {f}")
    tree = ET.parse(f)

    root = tree.getroot()
    for tile in root.iter('tile'):
        id = tile.attrib['id']
        features = {}
        for feature in tile:
            signature = get_feature_signature(feature)
            if feature.text:
                for loc in feature.text.split():
                    features[loc] = signature

        tiles[id] = {
            'symmetry': get_symmetry(features),
            'edge': get_edges(features),
        }
        if 'max' in tile.attrib:
            tiles[id]['max'] = int(tile.attrib['max'])

    for mt in root.iter('multi-tile'):
        id = mt.attrib['id']
        multi_tiles[id] = {
            'size': mt.attrib['size'],
            'tiles': [ref.attrib['tile'] for ref in mt]
        }


    for el in root.iter('tile-set'):
        id = el.attrib['id']
        set_tiles = {}
        sets[id] = {
            'tiles': set_tiles
        }
        if 'max' in el.attrib:
            sets[id]['max'] = int(el.attrib['max'])

        for item in el:
            if item.tag == 'ref':
                set_tiles[item.attrib['tile']] = int(item.attrib['count'])
            elif item.tag == 'remove':
                if 'remove' not in sets[id]:
                    sets[id]['remove'] = []
                sets[id]['remove'].append(item.attrib['tile'])


with open('src/extraResources/tiles.json', 'w') as out:
    json.dump({
        'tiles': tiles,
        'multiTiles': multi_tiles,
        'sets': sets
    }, out, indent=2)

