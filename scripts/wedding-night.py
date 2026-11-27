# The wedding's far side at night, as in the reference film: the terracotta palace and the white temple
# (src/art/wedding-palace.webp, the day picture keyed by `npm run art`) go blue-dark while their windows
# and the strings of lights keep their warm glow. Its red carpet is cut off into its own floor strip, and
# the hedges and trees at both ends are carried on sideways, so the strip can run the width of a laptop
# screen without the buildings growing huge.
# On a phone the palace stands higher, above the couple's heads, so the carpet in front of it is longer:
# carpet-tall keeps the carpet's top edge and its patterned border and stretches the plain red between.
# Writes src/art/wedding-night.webp, src/art/carpet.webp and src/art/carpet-tall.webp.
from PIL import Image, ImageFilter
import numpy as np


def crisp(arr):
    # the carpet runs far wider on screen than it was drawn: twice the size and sharpened keeps its border crisp
    im = Image.fromarray(arr.astype(np.uint8))
    return im.resize((im.width * 2, im.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2.2, 90, 1))


day =Image.open('src/art/wedding-palace.webp').convert('RGBA')
a = np.asarray(day).astype(float)
W, H = day.size

# where the carpet starts: the first row (from the middle down) that is mostly carpet red
rgb = a[..., :3]
red = ((rgb[..., 0] > 120) & (rgb[..., 1] < 70) & (rgb[..., 2] < 80)).mean(1)
top = next(y for y in range(int(H * 0.6), H) if red[y] > 0.45)
carpet = a[top:, :, :3]
crisp(carpet).save('src/art/carpet.webp', quality=86, method=6)
# the carpet's border is where the rows stop being plain red
plain = [y for y in range(carpet.shape[0]) if abs(carpet[y, :, 1].mean() - carpet[5, :, 1].mean()) < 6]
edge = max(y for y in plain if y < carpet.shape[0] * 0.8) + 1
band = carpet[6:edge - 4]
tall = np.concatenate([carpet[:6]] + [band if i % 2 == 0 else band[::-1] for i in range(int(np.ceil(190 / len(band))))] , 0)[:196]
tall = np.concatenate([tall, carpet[edge - 4:]], 0)
crisp(tall).save('src/art/carpet-tall.webp', quality=86, method=6)
print('carpet-tall', tall.shape[1], 'x', tall.shape[0], ' border from row', edge)

# night grade
c = a[:top, :, :3] / 255
al = a[:top, :, 3:]
lum = c @ [0.299, 0.587, 0.114]
warm = np.clip((c[..., 0] - c[..., 2]) * 1.6, 0, 1) * np.clip((lum - 0.62) * 3.2, 0, 1)  # lamps, lit windows
night = c * [0.58, 0.6, 0.86] + [0.03, 0.03, 0.09]
glow = np.clip(c * [1.08, 1.0, 0.82], 0, 1)
out = night * (1 - warm[..., None]) + glow * warm[..., None]
img = np.concatenate([np.clip(out * 255, 0, 255), al], -1)

# carry the ends on sideways with the garden between the two buildings (trees and lit hedge only),
# mirrored over and over
garden = img[:, int(W * 0.475):int(W * 0.625)]
pad = W // 2
def ext(edge):  # edge: band of columns, outermost column first
    reps = []
    n = 0
    while n < pad:
        reps.append(edge if len(reps) % 2 else edge[:, ::-1])
        n += edge.shape[1]
    return np.concatenate(reps, 1)[:, :pad]
left = ext(garden[:, ::-1])[:, ::-1]
right = ext(garden)
wide = np.concatenate([left, img, right], 1)
Image.fromarray(wide.astype(np.uint8), 'RGBA').save('src/art/wedding-night.webp', quality=86, method=6)
print('wedding-night', wide.shape[1], 'x', wide.shape[0], ' carpet from row', top)
