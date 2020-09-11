import re

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

        res[xi] = str(1000 - y)
        res[-1] = str(x)
        xi = None

    return "".join(res)

while True:
    path = input("> ")
    if not path:
        break

    for i in range(3):
        path = rotate90(path)
        print(path)





