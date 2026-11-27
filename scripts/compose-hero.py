# Builds the first-page backdrop as one picture: hills, Howrah Bridge, the Tata Park diamond,
# a far-bank road with tram rails, then the river, the railing and the floor.
# python3 scripts/compose-hero.py   ->  art/raw/hero-wide.png, art/raw/hero-tall.png, plus the road lines in art/hero-lines.json
# Sources: art/raw/city-kolkata.png (keyed), art/raw/diamond-park.png (full painting, also the street lamp),
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


def lamp():
    """the street lamp from the Tata Park painting, cut along its own black outline"""
    d = np.asarray(Image.open('art/raw/diamond-park.png').convert('RGB')).astype(np.int32)
    x0, y0, x1, y1 = 60, 420, 210, 950
    c = d[y0:y1, x0:x1]
    ink = nd.binary_dilation(c.mean(2) < 75, iterations=1)
    lab, _ = nd.label(~ink)
    ids = set(np.unique(lab[:, 126 - x0 - 6:126 - x0 + 7])) - {0}
    ids -= set(np.unique(lab[0])) | set(np.unique(lab[:, 0])) | set(np.unique(lab[:, -1]))
    keep = np.zeros(lab.shape, bool)
    for i in ids:
        m = lab == i
        xs = np.nonzero(m)[1]
        if xs.max() - xs.min() < 95 and m.sum() > 20:
            keep |= m
    m = nd.binary_fill_holes(keep | (nd.binary_dilation(keep, iterations=6) & ink))
    ys, xs = np.nonzero(m)
    out = np.dstack([c, nd.gaussian_filter(m.astype(np.float32), 0.6) * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() - 8))


def tree_band(hl, seed_row):
    """only the row of round trees along the bottom of the hills layer (each tree is closed by its outline)"""
    a = np.asarray(hl).astype(np.float32)
    ink = (a[..., :3].mean(2) < 70) & (a[..., 3] > 0)
    lab, _ = nd.label(~ink & (a[..., 3] > 0))
    ids = set(np.unique(lab[seed_row])) - {0}
    m = np.isin(lab, list(ids))
    m = nd.binary_fill_holes(m | (nd.binary_dilation(m, iterations=5) & ink))
    out = a.copy()
    out[..., 3] *= nd.gaussian_filter(m.astype(np.float32), 0.6)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')


def hfade(im, x_end, px):
    """keep the picture up to x_end, melting away over px to its right"""
    a = arr(im)
    w = a.shape[1]
    x = np.arange(w)
    a[..., 3] *= np.clip((x_end - x) / px, 0, 1)[None, :]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


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
        # flat enough (about 1:2) to fit a laptop screen without cutting the tops off
        W = 2640
        gb = gb.resize((W, round(gb.height * W / gb.width)), Image.LANCZOS)
        gb = gb.crop((0, 60, W, 620))  # a little less river on top, a little less floor at the bottom
        gh = gb.height
        R = 130
        land = 640
        H = land + R + gh
        base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        yroad = land
        hs = 1.0
        hy = yroad - hills.height * hs + 40
        base.alpha_composite(sun(60), (int(W * 0.58), int(yroad - hills.height * 0.7)))
        hl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        left = hills.crop((0, 0, W - hills.width + 60, hills.height)).transpose(Image.FLIP_LEFT_RIGHT)
        paste(hl, left, 0, hy, 1)
        paste(hl, fade(hills, 'l', 60), W - hills.width, hy, 1)
        base.alpha_composite(hl)
        # Kolkata: a smaller bridge tower stands between the words and the couple, its span runs off to the left
        bs = 0.68
        right = W * 0.37
        paste(base, br, right - br.width * bs, yroad - br.height * bs + 22, bs, flip=True)
        # the bridge's own bushes end where its painting ended: the row of trees from the hills grows back
        # over its foot, so the cut never shows
        base.alpha_composite(hfade(tree_band(hl, yroad + 20), right + 260, 160))
        # Jamshedpur: the diamond on the right
        crop = dia.crop((int(dia.width * 0.2), 0, int(dia.width * 0.86), int(dia.height * 0.84)))
        crop = fade(crop, 'l', 70)
        ds = 0.64
        paste(base, crop, W - crop.width * ds + 20, yroad - crop.height * ds + 24, ds)
        lamps = [(0.405, 0.5), (0.52, 0.5)]
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
        # the steel works in the middle, between the couple: hills and mirrored hills side by side
        strip = Image.new('RGBA', (hills.width * 2, hills.height), (0, 0, 0, 0))
        strip.alpha_composite(hills, (0, 0))
        strip.alpha_composite(fade(hills.transpose(Image.FLIP_LEFT_RIGHT), 'l', 60), (hills.width - 60, 0))
        x0 = int(hills.width * 0.783 - W * 0.5 / hs)  # the works' middle chimney lands in the middle
        hc = strip.crop((x0, 0, x0 + int(W / hs), hills.height))
        base.alpha_composite(sun(58), (int(W * 0.5 - 116), int(yroad - hills.height * hs * 0.8)))
        hl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        paste(hl, hc, 0, yroad - hills.height * hs + 40, hs)
        base.alpha_composite(hl)
        # the tower at the left edge, beside the groom; its span is cut short behind him
        bs = 0.72
        span = fade(br.crop((0, 0, int(br.width * 0.62), br.height)), 'r', 120)
        paste(base, span, -30, yroad - br.height * bs + 26, bs)
        base.alpha_composite(hfade(tree_band(hl, yroad + 20), span.width * bs + 60, 140))
        crop = dia.crop((int(dia.width * 0.2), 0, int(dia.width * 0.86), int(dia.height * 0.84)))
        crop = fade(crop, 'l', 70)
        ds = 0.6
        paste(base, crop, W - crop.width * ds + 110, yroad - crop.height * ds + 30, ds)
        lamps = [(0.875, 0.56)]  # the bridge brings its own lamp on the left
    rd, lines = road(W, R)
    base.alpha_composite(rd, (0, yroad))
    # street lamps on the grass verge, where the couple and the words leave them in sight
    lp = lamp()
    for fx, sc in lamps:
        l = lp.resize((round(lp.width * sc), round(lp.height * sc)), Image.LANCZOS)
        base.alpha_composite(l, (round(W * fx - l.width / 2), round(yroad + R * 0.13 - l.height)))
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
