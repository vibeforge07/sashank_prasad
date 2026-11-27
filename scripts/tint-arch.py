# The closing page's carved arch in its two lights, made once from src/art/mehendi-window.webp so the browser
# does not have to colour five big pictures live (Words.jsx Closing):
#   closing-arch-night: the carving in moon-blue, as in the client's reference before the lamp is lit
#   closing-arch-warm:  the same carving lamplit, warm saffron and gold
# Run: python3 scripts/tint-arch.py
from PIL import Image, ImageEnhance
import numpy as np

src = Image.open('src/art/mehendi-window.webp').convert('RGBA')
a = np.asarray(src).astype(np.float32)
rgb, alpha = a[..., :3], a[..., 3:]
lum = (rgb @ np.array([0.299, 0.587, 0.114], np.float32))[..., None] / 255

# night: dark ink-navy in the shadows up to pale moonlit steel-blue on the lights, with a little more contrast
lo, hi = np.array([14, 18, 52], np.float32), np.array([176, 192, 236], np.float32)
t = np.clip((lum - 0.12) / 0.86, 0, 1) ** 1.15
night = lo + (hi - lo) * t

# warm: the painting itself pushed towards saffron (a sepia tone mixed in), then a touch more colour
sep = np.concatenate([lum * 255 * 1.08, lum * 255 * 0.78, lum * 255 * 0.42], axis=-1)
warm = rgb * 0.62 + sep * 0.38

for name, px in (('night', night), ('warm', warm)):
    out = Image.fromarray(np.concatenate([np.clip(px, 0, 255), alpha], axis=-1).astype(np.uint8), 'RGBA')
    if name == 'warm':
        out = ImageEnhance.Color(out).enhance(1.35)
    out.save(f'src/art/closing-arch-{name}.webp', quality=84, method=6)
    print('closing-arch-' + name)
