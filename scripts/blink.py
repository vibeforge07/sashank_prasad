# Closed eyes for the blinking figures.
#   python3 scripts/blink.py            -> src/art/<figure>-blink.webp (and -blink2 for a second person)
# Each output is the figure's own size, transparent except for the eyelids, so it lays exactly over the
# figure (Layer.jsx draws it on top; Scene.jsx flashes it for a blink every few seconds). A picture with
# two people gets one file per person, so they do not blink together.
# EYES holds a rough centre for every eye, in the figure's own pixels (src/art/<figure>.webp). The script
# finds the white of the eye around it, covers it with a lid in the skin colour next to it, and draws the
# closed lid's lash line. When a figure's picture is replaced, its eye centres must be measured again.
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

EYES = {  # figure: one list of eye centres per person; (x, y, r) looks only r px around the centre (close-set eyes, glasses);
         # ('box', x0, y0, x1, y1) is an eye too small to find (behind a lens), given by hand
    'wedding-couple': [[(355, 232), (404, 221)], [(944, 252), (1010, 260)]],
    'sangeet-groom': [[(425, 200), (470, 185)]],
    'reception-groom': [[(242, 115), (292, 105)]],
    'reception-bride': [[(262, 112), (325, 125)]],
    'tilak-elder': [[(490, 190)]],
    'hero-groom': [[(238, 128), (288, 122, 18)]],
    'hero-bride': [[(247, 122), (320, 135)]],
    'briddhi-family': [[(236, 168, 20), ('box', 264, 155, 274, 165)], [(452, 196, 20), (494, 179, 20)], [(1095, 174, 22), (1145, 181, 22)]],
    'tilak-groom': [[(357, 120), (410, 130)]],
    'mehendi-couple': [[('box', 390, 146, 437, 166), ('box', 451, 136, 483, 154)], [(791, 167, 36), (852, 176, 36)]],
    'aibur-family': [[(383, 184, 18), (430, 178, 18)], [(650, 203, 24), (712, 210, 24)], [(964, 118, 18), (1016, 146, 18)], [(1113, 366, 16), (1155, 396, 16)]],
    'haldi-couple': [[(460, 158, 26), (520, 138, 24)], [(928, 203), (993, 215)]],
    'sangeet-bride': [[(458, 233), (522, 248)]],
}
SS = 4  # drawn this many times larger, then shrunk, for smooth edges
LASH = (44, 26, 20)


def find_eye(a, cx, cy, r=42):
    x0, y0 = max(0, cx - r), max(0, cy - r)
    win = a[y0:cy + r, x0:cx + r].astype(float)
    rgb, al = win[..., :3], win[..., 3]
    L = rgb @ [0.3, 0.59, 0.11]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    white = (L > 200) & (sat < 0.2) & (al > 200)
    lab, n = ndimage.label(white)
    if not n:
        raise SystemExit(f'no eye white near {cx},{cy}')
    idx = range(1, n + 1)
    sizes = ndimage.sum(white, lab, idx)
    cents = ndimage.center_of_mass(white, lab, idx)
    # the white can be split in two by the iris: take the biggest blob near the centre and any blob level with it
    near = [(i, s, c) for i, s, c in zip(idx, sizes, cents) if s > 12]
    main = min(near, key=lambda t: np.hypot(t[2][1] - (cx - x0), t[2][0] - (cy - y0)) - t[1] * 0.05)
    keep = [i for i, s, c in near if abs(c[0] - main[2][0]) < r * 0.35 and abs(c[1] - main[2][1]) < r * 1.1]
    m = np.isin(lab, keep)
    ys, xs = np.nonzero(m)
    h = ys.max() - ys.min() + 1
    # grow over the iris and the lid outlines (dark, touching the white), not far enough to reach the brow
    dark = (L < 120) & (al > 200)
    grown = m.copy()
    for _ in range(round(h * 0.3) + 2):
        grown |= ndimage.binary_dilation(grown) & dark
    grown[:, :max(0, xs.min() - 3)] = False
    grown[:, xs.max() + 4:] = False
    gy, gx = np.nonzero(grown)
    return x0 + gx.min(), y0 + gy.min(), x0 + gx.max(), y0 + gy.max()


def skin_near(a, box, pad):
    x0, y0, x1, y1 = box
    X0, Y0, X1, Y1 = x0 - pad * 3, y0 - pad * 3, x1 + pad * 3, y1 + pad * 2
    win = a[max(0, Y0):Y1, max(0, X0):X1].astype(float)
    rgb = win[..., :3]
    L = rgb @ [0.3, 0.59, 0.11]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    ok = (L > 120) & (L < 235) & (sat > 0.15) & (sat < 0.7) & (rgb[..., 0] > rgb[..., 1]) & (rgb[..., 1] > rgb[..., 2]) & (win[..., 3] > 240)
    return tuple(int(v) for v in np.median(rgb[ok], 0))


def build(name, centres, out_name):
    fig = Image.open(f'src/art/{name}.webp').convert('RGBA')
    a = np.asarray(fig)
    W, H = fig.size
    big = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    for c in centres:
        x0, y0, x1, y1 = c[1:] if c[0] == 'box' else find_eye(a, *c)
        w, h = x1 - x0, y1 - y0
        pad = max(2, round(h * 0.1))
        skin = skin_near(a, (x0, y0, x1, y1), pad)
        # the lid: skin over the whole open eye, its outline and iris included
        d.ellipse([(x0 - pad) * SS, (y0 - pad) * SS, (x1 + pad) * SS, (y1 + pad) * SS], fill=skin + (255,))
        # the closed lid: one ink line from corner to corner, bowing down, as thick as the drawing's lid line
        ym = y0 + h * 0.42
        pts = []
        for k in range(41):
            t = k / 40
            x = x0 + w * t
            y = ym + np.sin(np.pi * t) * h * 0.3
            pts.append((x * SS, y * SS))
        d.line(pts, fill=LASH + (255,), width=round(max(2.4, h * 0.12) * SS), joint='curve')
        print(f'  {name}: eye {w}x{h} at {x0},{y0}  skin {skin}')
    out = big.resize((W, H), Image.LANCZOS)
    out.save(f'src/art/{out_name}.webp', quality=90, method=6)
    return fig, out


if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    for n, people in EYES.items():
        if only and n not in only:
            continue
        for k, c in enumerate(people):
            build(n, c, f'{n}-blink' + (str(k + 1) if k else ''))
