// npm run art
// Takes every picture in art/raw, removes the plain key colour around it, trims it
// and writes src/art/<name>.webp. Pictures that fill their frame are only resized.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAW = 'art/raw'
const OUT = 'src/art'
// wide strips keep their full width
const MAX = { default: 1400, wide: 2600 }
const WIDE = /(-ground|-courtyard|-veranda|-stage|-hall|-seat|-hanging|sunrise|clouds-horizon)/

const key = ([r, g, b]) => {
  if (g > 150 && g - Math.max(r, b) > 70) return 'green'
  if (b > 120 && b - Math.max(r, g) > 60) return 'blue'
  if (r > 150 && b > 150 && Math.min(r, b) - g > 90) return 'magenta'
  return null
}
const excess = {
  green: (r, g, b) => g - Math.max(r, b),
  blue: (r, g, b) => b - Math.max(r, g),
  magenta: (r, g, b) => Math.min(r, b) - g,
}

async function one(file) {
  const name = path.parse(file).name
  const { data, info } = await sharp(path.join(RAW, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  let note = 'kept as it is'

  const hasAlpha = data.some((v, i) => i % 4 === 3 && v < 250)
  if (!hasAlpha) {
    // the key is whatever flat colour sits along the top
    const px = (x, y) => [...data.subarray((y * W + x) * 4, (y * W + x) * 4 + 3)]
    const spots = [px(3, 3), px(W - 4, 3), px(W >> 1, 3), px(W >> 1, H >> 1)] // the window frame is keyed in the middle
    const found = spots.map(key).filter(Boolean)
    const k = found[0]
    if (!k) note = 'NO KEY COLOUR FOUND, check this one'
    else {
      const ref = spots.find((c) => key(c) === k)
      const full = excess[k](...ref)
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = data.subarray(i, i + 3)
        const e = excess[k](r, g, b)
        const a = Math.min(1, Math.max(0, 1 - (e - full * 0.22) / (full * 0.5)))
        if (a < 1) {
          if (a > 0) for (let c = 0; c < 3; c++) data[i + c] = Math.min(255, Math.max(0, (data[i + c] - ref[c] * (1 - a)) / a))
          data[i + 3] = Math.round(a * 255)
        }
        // take the leftover tint off the edges
        if (a < 1) {
          const [R, G, B] = data.subarray(i, i + 3)
          if (k === 'green') data[i + 1] = Math.min(G, Math.max(R, B) + 6)
          if (k === 'blue') data[i + 2] = Math.min(B, Math.max(R, G) + 6)
          if (k === 'magenta') { data[i] = Math.min(R, G + 40); data[i + 2] = Math.min(B, G + 40) }
        }
      }
      note = `${k} removed`
    }
  }

  // trim to what is painted
  let x0 = W, y0 = H, x1 = -1, y1 = -1
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 12) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
  }
  if (x1 < 0) return console.log(`${name}: empty after keying, skipped`)
  const box = WIDE.test(name)
    ? { left: 0, top: y0, width: W, height: y1 - y0 + 1 }
    : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract(box)
    .resize({ width: WIDE.test(name) ? MAX.wide : MAX.default, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90 })
    .toFile(path.join(OUT, `${name}.webp`))
  const kb = Math.round(fs.statSync(path.join(OUT, `${name}.webp`)).size / 1024)
  console.log(`${name}: ${note}, ${box.width}x${box.height}, ${kb} KB`)
}

const only = process.argv.slice(2)
const files = fs.readdirSync(RAW).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).filter((f) => !only.length || only.includes(path.parse(f).name))
if (!files.length) console.log('No pictures in art/raw yet.')
for (const f of files) await one(f)
