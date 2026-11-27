# The Sangeet garden (src/art/sangeet-garden.webp) was drawn with its two tree crowns running off the top edge,
# which shows on the site as a ruled line. This rounds those crowns off into leafy bumps with an ink edge,
# the same at both ends so the picture still repeats side by side. Run after `npm run art sangeet-garden`:
#   python3 scripts/crown-garden.py
from PIL import Image
import numpy as np

P = 'src/art/sangeet-garden.webp'
im = Image.open(P).convert('RGBA')
a = np.asarray(im).copy()
H, W = a.shape[:2]
k = W / 1913  # the numbers below are for the 1913 px wide picture

# leafy bumps along the crowns (left crown, and the right one mirrored so the two ends meet)
rng = np.random.default_rng(7)
left = []
x = -30
while x < 700:
    r = rng.uniform(42, 64)
    left.append((x, rng.uniform(62, 96), r))
    x += rng.uniform(52, 70)
bumps = [(cx * k, cy * k, r * k) for cx, cy, r in left] + [(W - cx * k, cy * k, r * k) for cx, cy, r in left]
top = np.zeros(W)
for xi in range(W):
    best = None
    for cx, cy, r in bumps:
        d = abs(xi - cx)
        if d < r:
            y = cy - np.sqrt(r * r - d * d)
            best = y if best is None else min(best, y)
    top[xi] = 0 if best is None or (700 * k < xi < W - 700 * k) else max(0, best)

ink = np.array([30, 44, 20])
for xi in range(W):
    t = int(round(top[xi]))
    if t <= 0:
        continue
    a[:t, xi, 3] = 0
    # a short ink line along the new edge, only where there is something painted
    for y in range(t, min(H, t + max(2, int(3 * k)))):
        if a[y, xi, 3] > 40:
            a[y, xi, :3] = ink
# close the edge where neighbouring columns step (the sides of each bump)
for xi in range(1, W):
    lo, hi = sorted((int(round(top[xi - 1])), int(round(top[xi]))))
    if hi - lo > 1:
        for y in range(lo, hi):
            if a[y, xi, 3] > 40: a[y, xi, :3] = ink
            if a[y, xi - 1, 3] > 40: a[y, xi - 1, :3] = ink

Image.fromarray(a).save(P, quality=84, method=6)
print('sangeet-garden: crowns rounded')
