#!/usr/bin/env python3

ALPHA = 0.92
background = '#282c34'
colors = [
    '#f4343496',
    '#03a9f470',
    '#ffed0070',
    '#00990070',
    '#ff980070',
    '#673ab770',
    '#f48fb170',
    '#fffce090',
    '#000000ff',
]


def parse(c):
    return int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), int(c[7:9], 16) / 255 if len(c) > 7 else None


bg = parse(background)
for color in colors:
    *rgb, a = parse(color)

    c = [(1 - a) * bg_item + a * rgb_item for bg_item, rgb_item in zip(bg, rgb)]
    c_hx = '#{:02x}{:02x}{:02x}'.format(*map(int, c))

    opaque = [(c_item - (1 - ALPHA) * bg_item) / ALPHA for bg_item, c_item in zip(bg, c)]
    opaque_hx = '#{:02x}{:02x}{:02x}{:02x}'.format(*map(int, opaque), int(ALPHA * 255))

    # print(rgb, a, color)
    # print(c, c_hx)
    # print(opaque, ALPHA, opaque_hx)
    print(color, opaque_hx)


