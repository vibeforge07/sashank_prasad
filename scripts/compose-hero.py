# Builds the first-page backdrop as one picture: hills, Howrah Bridge, the Tata Park diamond,
# a far-bank road with tram rails, then the river, the railing and the floor.
# python3 scripts/compose-hero.py   ->  art/raw/hero-wide.png, art/raw/hero-tall.png, plus the road lines in art/hero-lines.json
# Sources: art/raw/city-kolkata.png (keyed), art/raw/diamond-park.png (full painting),
#          src/art/jamshedpur-hills.webp, src/art/hero-ground.webp
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

INK = (28, 22, 20, 255)


def arr(im):
    return np.asarray(im.convert('RGBA')).astype(np.float32)


def fade(im, side, px):
    """soften one side so a cut edge melts into what is behind it"""
    a = arr(im)
    h, w = a.shape[:2]
    ramp = np.clip(np.arange(px) / px, 0, 1) ** 1.4
    if side == 'l':
        a[:, :px, 3] *= ramp[None, :]
    else:
        a[:, w - px:, 3] *= ramp[::-1][None, :]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def bridge():
    im = Image.open('art/raw/city-kolkata.png').convert('RGBA')
    a = np.asarray(im).copy()
    # the sun and the little hill behind the span go: clear everything above the top chord there
    chord = [(540, 552), (570, 596), (620, 624), (670, 668), (720, 704), (770, 727), (820, 739), (870, 737), (895, 720), (912, 700), (918, 560)]
    xs = np.arange(540, 919)
    ys = np.interp(xs, [p[0] for p in chord], [p[1] for p in chord])
    for x, y in zip(xs, ys):
        a[:int(y), x, 3] = 0
    a[:500, 540:1122, 3] = 0  # clouds and sun rays above it
    im = Image.fromarray(a).crop((0, 362, 1122, 968))
    return fade(im, 'r', 90)


def sky_out(path):
    """remove a soft painted sky (gradient + clouds) from a full painting, keep the land.
    The sky is one smooth region bounded by black outlines: flood it from the top edge."""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    g = nd.gaussian_filter(a, (1.2, 1.2, 0))
    grad = np.zeros(a.shape[:2])
    for c in range(3):
        grad = np.maximum(grad, np.hypot(nd.sobel(g[..., c], 0), nd.sobel(g[..., c], 1)))
    lum = a.mean(2)
    smooth = (grad < 38) & (lum > 120)
    lab, _ = nd.label(smooth)
    ids = np.unique(lab[0])
    sky = np.isin(lab, ids[ids > 0])
    sky = nd.binary_dilation(sky, iterations=2) & (lum > 95)  # eat the soft rim, not the black outline
    fg = ~sky
    fl, n = nd.label(fg)
    keep = np.unique(fl[-1])
    keep = keep[keep > 0]
    land = np.isin(fl, keep)
    alpha = nd.gaussian_filter(land.astype(np.float32), 0.7)
    out = np.dstack([a, np.clip(alpha, 0, 1) * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def ndimage_soft(mask):
    return nd.gaussian_filter(mask.astype(np.float32), 0.8) * mask


def road(w, h, s=2):
    """the far-bank road in the site style: grass verge, tram lane with rails, car lane, kerb"""
    W, H = w * s, h * s
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    o = 5 * s
    verge, lane1, lane2, kerb = 0.17, 0.53, 0.86, 1.0
    d.rectangle([0, 0, W, H * verge], fill=(122, 168, 92, 255))
    for x in range(-40 * s, W, 34 * s):  # little grass tufts along the top of the verge
        d.ellipse([x, -8 * s, x + 44 * s, 14 * s], fill=(132, 178, 98, 255), outline=INK, width=3 * s)
    d.rectangle([0, 0, W, 4 * s], fill=(132, 178, 98, 255))
    d.rectangle([0, H * verge, W, H * lane2], fill=(176, 168, 156, 255))
    d.line([0, H * verge, W, H * verge], fill=INK, width=o)
    for r in (0.30, 0.44):  # two tram rails
        y = H * r
        d.line([0, y, W, y], fill=(110, 104, 98, 255), width=7 * s)
        d.line([0, y - 1 * s, W, y - 1 * s], fill=(226, 224, 220, 255), width=3 * s)
    for x in range(0, W, 26 * s):  # sleepers between the rails
        d.line([x, H * 0.31, x, H * 0.43], fill=(150, 142, 132, 255), width=3 * s)
    y = H * 0.70
    for x in range(0, W, 120 * s):  # dashed middle line of the car lane
        d.rounded_rectangle([x, y - 2.5 * s, x + 60 * s, y + 2.5 * s], 2 * s, fill=(245, 238, 222, 255))
    d.rectangle([0, H * lane2, W, H * kerb], fill=(240, 226, 192, 255))
    for x in range(0, W, 70 * s):
        d.line([x, H * lane2, x, H], fill=(196, 178, 140, 255), width=2 * s)
    d.line([0, H * lane2, W, H * lane2], fill=INK, width=o)
    d.line([0, H - 2 * s, W, H - 2 * s], fill=INK, width=o)
    return im.resize((w, h), Image.LANCZOS), {'tram': 0.47, 'car': 0.84}


def sun(r):
    s = 3
    R = r * s
    im = Image.new('RGBA', (R * 4, R * 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = R * 2
    for k in range(11):
        t = np.pi * (k / 10)  # rays on the upper half only, it is rising
        x1, y1 = c + np.cos(t) * R * 1.32, c - np.sin(t) * R * 1.32
        x2, y2 = c + np.cos(t) * R * 1.72, c - np.sin(t) * R * 1.72
        d.line([x1, y1, x2, y2], fill=(246, 190, 70, 255), width=int(R * 0.13))
    d.ellipse([c - R, c - R, c + R, c + R], fill=(250, 196, 72, 255), outline=(214, 140, 40, 255), width=int(R * 0.06))
    return im.resize((r * 4, r * 4), Image.LANCZOS)


def ground_block():
    g = Image.open('src/art/hero-ground.webp').convert('RGBA')
    a = np.asarray(g).astype(np.int32)
    water = (a[..., 2] - a[..., 0] > 70) & (a[..., 3] > 200)
    rows = water.mean(1)
    top = int(np.argmax(rows > 0.5))  # first row that is mostly river
    return g.crop((0, top + 4, g.width, g.height))


def paste(base, im, x, y, scale, flip=False):
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    base.alpha_composite(im, (round(x), round(y)))
    return im.size


def build(kind):
    hills = Image.open('src/art/jamshedpur-hills.webp').convert('RGBA')
    gb = ground_block()
    dia = sky_out('art/raw/diamond-park.png')
    br = bridge()
    if kind == 'wide':
        W = 2640
        ground_s = W / gb.width
        gh = round(gb.height * ground_s)
        R = 150
        land = 860
        H = land + R + gh
        base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        yroad = land
        hs = W / hills.width
        base.alpha_composite(fade(sun(70), 'l', 1), (int(W * 0.56), int(yroad - hills.height * hs * 0.62)))
        paste(base, hills, 0, yroad - hills.height * hs + 40, hs)
        # Kolkata: the bridge tower stands between the words and the couple, its span runs off the left edge
        bs = 1.2
        paste(base, fade(br, 'l', 60), W * 0.49 - br.width * bs, yroad - br.height * bs + 26, bs, flip=True)
        # Jamshedpur: the diamond on the right
        crop = dia.crop((int(dia.width * 0.2), 0, int(dia.width * 0.86), int(dia.height * 0.84)))
        crop = fade(crop, 'l', 80)
        ds = 0.82
        paste(base, crop, W - crop.width * ds + 30, yroad - crop.height * ds + 30, ds)
    else:
        W = 1296
        gs = 1.0
        gcrop = gb.crop(((gb.width - W) // 2, 0, (gb.width + W) // 2, gb.height))
        gb = gcrop
        gh = gb.height
        ground_s = 1
        R = 150
        land = 1130
        H = land + R + gh
        base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        yroad = land
        hs = 1.05
        hc = hills.crop((int(hills.width * 0.36), 0, int(hills.width * 0.36) + int(W / hs), hills.height))
        base.alpha_composite(sun(58), (int(W * 0.5 - 116), int(yroad - hills.height * hs * 0.8)))
        paste(base, hc, 0, yroad - hills.height * hs + 40, hs)
        bs = 1.02
        paste(base, br, -70, yroad - br.height * bs + 26, bs)
        crop = dia.crop((int(dia.width * 0.2), 0, int(dia.width * 0.86), int(dia.height * 0.84)))
        crop = fade(crop, 'l', 70)
        ds = 0.86
        paste(base, crop, W - crop.width * ds + 150, yroad - crop.height * ds + 30, ds)
    rd, lines = road(W, R)
    base.alpha_composite(rd, (0, yroad))
    g = gb.resize((W, gh), Image.LANCZOS) if gb.width != W else gb
    base.alpha_composite(g, (0, yroad + R - 6))
    base = base.crop((0, 0, W, min(H, yroad + R - 6 + gh)))
    base.save(f'art/raw/hero-{kind}.png')
    # road lines as fractions of the picture height, measured from the bottom
    Hh = base.height
    return {k: round((Hh - (yroad + R * v)) / Hh, 4) for k, v in lines.items()} | {'w': W, 'h': Hh}


if __name__ == '__main__':
    out = {k: build(k) for k in ('wide', 'tall')}
    json.dump(out, open('art/hero-lines.json', 'w'), indent=1)
    print(out)
