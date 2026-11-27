# Splits the Haldi couple so the groom's hand can move: his forearm becomes its own layer,
# the place it covered (her hair, the dupatta, a little of her cheek) is painted in underneath,
# and his sleeve cuff is copied on top so the forearm can slide back into it.
# python3 -I scripts/split-haldi.py   (source: art/raw/haldi-couple-full.webp, the untouched picture)
#   -> src/art/haldi-couple.webp (base), src/art/haldi-arm.webp, src/art/haldi-cuff.webp, all 1400x948
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

src = Image.open('art/raw/haldi-couple-full.webp').convert('RGBA')
a = np.asarray(src).astype(np.float32)
H, W = a.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
rgb, al = a[..., :3], a[..., 3]
lum = rgb.mean(2)

# the forearm and hand: skin from the cuff to the fingertips (her face, also skin, starts past x 897)
box = (xx >= 748) & (xx <= 897) & (yy >= 200) & (yy <= 425)
skin = (np.abs(rgb - [252, 174, 106]).sum(2) < 70) & (al > 200) & box
lab, _ = nd.label(skin)
arm = lab == lab[320, 800]
near = nd.binary_dilation(arm, iterations=5) & box
ink = (lum < 120) & (al > 60)
haldi = (rgb[..., 0] > 200) & (rgb[..., 1] > 140) & (rgb[..., 2] < 90)
arm = arm | (near & (ink | haldi))
arm = nd.binary_fill_holes(nd.binary_closing(arm, iterations=2))
# the outline on the far side of the hand belongs to it too
arm = arm | (nd.binary_dilation(arm, iterations=3) & ink & box)
cuffzone = xx < 760
arm &= ~cuffzone | (xx >= 752)

# paint in what the arm covered: walk along the dupatta's own slant (it runs almost straight down)
# up and down to the nearest uncovered pixel and take the closer one
hole = nd.binary_dilation(arm, iterations=4)
out = a.copy()
dx = -0.27
ys, xs = np.nonzero(hole)
for y, x in zip(ys, xs):
    best = None
    for step in range(1, 260):
        for s in (-1, 1):
            yy2 = y + s * step
            xx2 = int(round(x + s * step * dx))
            if 0 <= yy2 < H and 0 <= xx2 < W and not hole[yy2, xx2]:
                best = (yy2, xx2)
                break
        if best:
            break
    if best:
        out[y, x] = a[best]
# a little haldi left on her cheek where the fingers were
cheek = ((xx - 905) / 13.0) ** 2 + ((yy - 246) / 17.0) ** 2 < 1
soft = nd.gaussian_filter(cheek.astype(np.float32), 2.5)[..., None]
out[..., :3] = out[..., :3] * (1 - soft * 0.75) + np.array([255, 196, 20]) * soft * 0.75

armimg = np.zeros_like(a)
armimg[arm] = a[arm]
# soft 1px edge on the cut
am = nd.gaussian_filter(arm.astype(np.float32), 0.6)
armimg[..., 3] = np.minimum(a[..., 3], am * 255) * (am > 0.02)

# the sleeve end, copied over the forearm's root so the arm slides into it
cuff = (xx >= 690) & (xx < 762) & (yy >= 290) & (yy <= 440) & (al > 10) & ~arm
cuffimg = np.zeros_like(a)
cuffimg[cuff] = a[cuff]

Image.fromarray(out.astype(np.uint8), 'RGBA').save('src/art/haldi-couple.webp', quality=90, method=6)
Image.fromarray(armimg.astype(np.uint8), 'RGBA').save('src/art/haldi-arm.webp', quality=92, method=6)
Image.fromarray(cuffimg.astype(np.uint8), 'RGBA').save('src/art/haldi-cuff.webp', quality=92, method=6)
if len(sys.argv) > 1:  # preview: base, arm pulled back, and the mask
    base = Image.fromarray(out.astype(np.uint8), 'RGBA')
    arm_im = Image.fromarray(armimg.astype(np.uint8), 'RGBA')
    cuff_im = Image.fromarray(cuffimg.astype(np.uint8), 'RGBA')
    tiles = []
    for back in (0, 1):
        t = Image.new('RGBA', (W, H), (120, 200, 120, 255))
        t.alpha_composite(base)
        mv = arm_im.rotate(-4 * back, center=(757, 362), translate=(-30 * back, 27 * back), resample=Image.BICUBIC)
        t.alpha_composite(mv)
        t.alpha_composite(cuff_im)
        tiles.append(t.crop((600, 150, 1000, 450)).resize((800, 600)))
    o = Image.new('RGB', (1604, 600))
    o.paste(tiles[0].convert('RGB'), (0, 0)); o.paste(tiles[1].convert('RGB'), (804, 0))
    o.save(sys.argv[1])
