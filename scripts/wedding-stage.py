# The wedding backdrop (art/raw/wedding-stage.png) comes with its own sofa. The couple sits on the separate
# wedding-sofa picture, which moves with them, so the backdrop's sofa is painted out: the curtain and the
# gold pillars above it are carried down, and the floor and carpet are carried in from either side.
# Writes src/art/wedding-stage.webp.
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

src = Image.open('art/raw/wedding-stage.png').convert('RGB')
a = np.asarray(src).astype(float)
H, W = a.shape[:2]

# the sofa, generously: arms, back, seat and legs, and the carved crest on top
m = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(m)
d.rounded_rectangle((578, 548, 1102, 808), 30, fill=255)
d.polygon([(640, 560), (700, 528), (760, 505), (800, 482), (840, 478), (880, 482), (920, 505), (980, 528), (1040, 560)], fill=255)
mask = np.asarray(m) > 0

FLOOR = 738  # the floor starts here; above it is curtain and pillars
out = a.copy()
P = 70  # the band above the sofa that is repeated down
for x in range(W):
    col = np.where(mask[:, x])[0]
    if not len(col):
        continue
    top = col[0]
    for y in col:
        if y >= FLOOR:
            continue
        k = (y - top) % (2 * P)
        k = k if k < P else 2 * P - 1 - k  # mirror the band so it has no seam
        out[y, x] = a[top - 1 - k, x]
# the floor in front of the curtain: a plain blend between the clear floor on the left and on the right;
# the carpet: carried up from just below the sofa, mirrored, so its pattern runs on without a seam
CARPET = 781
bottom = max(np.where(mask.any(axis=1))[0]) + 1
for y in range(FLOOR, H):
    row = np.where(mask[y])[0]
    if not len(row):
        continue
    l, r = row[0] - 1, row[-1] + 1
    if y < CARPET:
        for x in row:
            t = (x - l) / (r - l)
            out[y, x] = a[y, l] * (1 - t) + a[y, r] * t
    else:
        for x in row:
            out[y, x] = a[min(H - 1, bottom + (bottom - y)), x]
img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
# soften the seams a little
soft = img.filter(ImageFilter.GaussianBlur(1.2))
edge = m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(3))
img = Image.composite(soft, img, Image.fromarray((np.asarray(edge) * (np.asarray(m.filter(ImageFilter.MaxFilter(9))) > 0) * 0.6).astype(np.uint8)))
img.save('src/art/wedding-stage.webp', quality=86, method=6)
