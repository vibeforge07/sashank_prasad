# The two small stages from Antigravity (reference stage/done) stand on a floor that runs out through the
# picture's sides and bottom, which would show as hard cut lines on the site. This closes each floor off
# as a stage block, with sides and a front edge in the same black ink, and writes the result to art/raw
# for `npm run art`.
#   wedding: a flat floor, clipped short of the edges, with ink sides and a top line where it meets the key
#   sangeet: a floor in perspective; its slanted sides are carried on down to the front edge, and the front
#            face gets ink sides and a bottom
from PIL import Image
import numpy as np

SRC = 'reference stage/done'
INK = (24, 8, 8)


def keyed(a, k):
    c = 2 if k == 'b' else 1
    o = [i for i in range(3) if i != c]
    return a[..., c] - np.maximum(a[..., o[0]], a[..., o[1]]) > 80


def wedding():
    im = Image.open(f'{SRC}/wedding-stage-small.png').convert('RGB')
    a = np.asarray(im).copy()
    H, W, _ = a.shape
    key = keyed(a.astype(int), 'b')
    blue = np.array([0, 7, 255])
    top, bottom, x0, x1 = 625, 783, 60, W - 61
    a[top - 6:bottom, :x0] = blue
    a[top - 6:bottom, x1 + 1:] = blue
    # ink: the two sides, the floor's back edge where it meets the key, and the bottom
    a[top - 1:bottom, x0:x0 + 3] = INK
    a[top - 1:bottom, x1 - 2:x1 + 1] = INK
    for x in range(x0, x1 + 1):
        if key[top - 6, x]:
            a[top - 2:top + 1, x] = INK
    a[bottom - 3:bottom, x0:x1 + 1] = INK
    Image.fromarray(a).save('art/raw/wedding-stage-small.png')


def sangeet():
    im = Image.open(f'{SRC}/sangeet-stage-small.png').convert('RGB')
    src = np.asarray(im)
    H, W, _ = src.shape
    P = 56
    green = np.array([6, 245, 3])
    a = np.zeros((H + 34, W + 2 * P, 3), np.uint8)
    a[:] = green
    a[:H, P:P + W] = src
    # carry the floor out sideways: copy the outermost column outwards on the floor rows
    for y in range(760, H):
        a[y, :P] = src[y, 0]
        a[y, P + W:] = src[y, W - 1]
    # the floor's slanted sides, measured on the picture: (181, 682) to (1, 784) and (1073, 682) to (1255, 784)
    front = 806  # where the top of the floor meets its front face
    xl = lambda y: P + 181 + (1 - 181) * (y - 682) / (784 - 682)
    xr = lambda y: P + 1073 + (1255 - 1073) * (y - 682) / (784 - 682)
    end = H - 4  # the front face ends here
    for y in range(760, end):
        l = xl(min(y, front))
        r = xr(min(y, front))
        a[y, :int(l)] = green
        a[y, int(r) + 1:] = green
        a[y, int(l):int(l) + 3] = INK
        a[y, int(r) - 2:int(r) + 1] = INK
    a[end:] = green
    a[end - 3:end, int(xl(front)):int(xr(front)) + 1] = INK
    Image.fromarray(a).save('art/raw/sangeet-stage-small.png')


wedding()
sangeet()
print('closed both stages')
