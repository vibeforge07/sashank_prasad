# python3 scripts/closing-lamp.py  (needs numpy + Pillow)
# The brass lamp of the last page, cut from the reception table painting (art/raw/reception-table.png):
#   src/art/closing-lamp.webp           the lamp unlit (its three wicks dark)
#   src/art/closing-flame-{l,c,r}.webp  each flame on its own, for lighting and flickering one by one
# Prints where each flame sits on the lamp (per cent), for .cl-flame in invitation.css.
from PIL import Image
import numpy as np

SRC = 'art/raw/reception-table.png'
BOX = (552, 22, 806, 422)  # the lamp, spire to foot, in the raw picture
im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W = im.shape[:2]

# key out the green, as scripts/process-art.mjs does
r, g, b = im[..., 0], im[..., 1], im[..., 2]
ex = g - np.maximum(r, b)
full = np.median(ex[ex > 70])
a = np.clip(1 - (ex - full * 0.22) / (full * 0.5), 0, 1)
ref = np.array([np.median(c[ex > 70]) for c in (r, g, b)])
out = im.copy()
part = (a > 0) & (a < 1)
for c in range(3):
    out[..., c][part] = np.clip((im[..., c][part] - ref[c] * (1 - a[part])) / a[part], 0, 255)
out[..., 1] = np.where(a < 1, np.minimum(out[..., 1], np.maximum(out[..., 0], out[..., 2]) + 6), out[..., 1])
alpha = a * 255

# the bowls and jasmine around the lamp's foot are not the lamp
yy, xx = np.mgrid[0:H, 0:W]
alpha[(yy > 338) & ((xx < 634) | (xx > 731))] = 0
alpha[yy >= BOX[3]] = 0

rgba = np.dstack([out, alpha]).astype(np.float32)

# the flames: two over the green at the ends of the bowl, one in front of the stem
FL = {'l': (564, 118, 606, 182), 'r': (756, 118, 798, 182), 'c': (668, 144, 695, 199)}
flames = {}
for k, (x0, y0, x1, y1) in FL.items():
    flames[k] = rgba[y0:y1, x0:x1].copy()

unlit = rgba.copy()
for k in ('l', 'r'):
    x0, y0, x1, y1 = FL[k]
    reg = unlit[y0:y1, x0:x1]
    # keep the dark wick, drop the flame
    dark = reg[..., :3].max(axis=2) < 150
    reg[..., 3] = np.where(dark, reg[..., 3], 0)
# the stem behind the middle flame: the flame (its pale core and the glow around it) is found row by row,
# and each row is filled in between the brass on its two sides
x0, y0, x1, y1 = FL['c']
pale = unlit[..., :3].min(axis=2) > 150
for y in range(y0, y1):
    xs = [x for x in range(x0, x1) if pale[y, x]]
    if not xs:
        continue
    a0, a1 = xs[0] - 3, xs[-1] + 4
    L, R = unlit[y, a0 - 1, :3].copy(), unlit[y, a1, :3].copy()
    for x in range(a0, a1):
        if y > 192 and unlit[y, x, :3].max() < 120:  # the wick stays
            continue
        t = (x - a0 + 0.5) / (a1 - a0)
        unlit[y, x, :3] = L * (1 - t) + R * t

# keep only the lamp itself: the largest connected piece (no specks of the bowls or flowers around it)
def biggest(al):
    h, w = al.shape
    seen = np.zeros((h, w), bool)
    best = None
    for sy in range(h):
        for sx in range(w):
            if al[sy, sx] > 20 and not seen[sy, sx]:
                stack, pts = [(sy, sx)], []
                seen[sy, sx] = True
                while stack:
                    y, x = stack.pop(); pts.append((y, x))
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and al[ny, nx] > 20:
                            seen[ny, nx] = True; stack.append((ny, nx))
                if best is None or len(pts) > len(best):
                    best = pts
    keep = np.zeros((h, w), bool)
    for y, x in best:
        keep[y, x] = True
    return keep

bx0, by0, bx1, by1 = BOX
lamp = unlit[by0:by1, bx0:bx1].copy()
keep = biggest(lamp[..., 3])
# soft edges next to the kept piece stay
lamp[..., 3] = np.where(keep | (lamp[..., 3] <= 20), lamp[..., 3], 0)
Image.fromarray(lamp.astype(np.uint8), 'RGBA').save('src/art/closing-lamp.webp', quality=90, alpha_quality=95)
bw, bh = bx1 - bx0, by1 - by0
for k, (x0, y0, x1, y1) in FL.items():
    f = flames[k]
    if k == 'c':
        # only the flame itself, not the stem around it: the bright, pale pixels
        lum = f[..., :3].min(axis=2)
        f[..., 3] = np.clip((lum - 120) / 80, 0, 1) * 255
    Image.fromarray(f.astype(np.uint8), 'RGBA').save(f'src/art/closing-flame-{k}.webp', quality=92, alpha_quality=95)
    print(f"{k}: left {(x0 - bx0) / bw * 100:.2f}% top {(y0 - by0) / bh * 100:.2f}% width {(x1 - x0) / bw * 100:.2f}% height {(y1 - y0) / bh * 100:.2f}%")
print('lamp', bw, 'x', bh)
