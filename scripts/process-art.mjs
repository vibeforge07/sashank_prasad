// npm run art
// Takes every picture in art/raw, removes the plain key colour around it, trims it
// and writes src/art/<name>.webp. Pictures that fill their frame are only resized.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAW = 'art/raw'
const OUT = 'src/art'
const PREVIEW = 'art/preview'
// wide strips keep their full width
const MAX = { default: 1400, wide: 2600 }
const EDGE = /^(foliage-corner|flowers-|haldi-drape|mehendi-window)/ // meant to run off the picture
const WIDE = /(-ground|-courtyard|-veranda|-stage|-hall|-seat|-hanging|-hills|sunrise|clouds-horizon)/
// backgrounds a phone shows larger than they were drawn (a wide strip shows only its middle there, at about
// 1.5 times its pixels): written at twice their size and sharpened, so the ink lines stay crisp on the phone
// instead of being stretched soft by the browser
const SHARP = /^(briddhi-courtyard|tilak-ground|tilak-madwa|aibur-veranda|river-ground|\w+-stage-art)$/

// a picture that is cut in two so one part can move: the part keeps the same frame as the rest
// (fractions of the raw picture: keep = the part's box, cut = what the rest loses)
const SPLIT = {
  'haldi-groom': { part: 'haldi-arm', keep: [0.564, 0, 1, 0.467], cut: [0.587, 0, 1, 0.467] },
}

const key = ([r, g, b]) => {
  if (g > 150 && g - Math.max(r, b) > 70) return 'green'
  if (g > 70 && r < 25 && b < 25) return 'green' // a dark flat green
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
  let note = 'already transparent'
  let bad = ''

  const hasAlpha = data.some((v, i) => i % 4 === 3 && v < 250)
  if (!hasAlpha) {
    // the key is the flat colour that covers most of the picture
    const count = { green: [], blue: [], magenta: [] }
    for (let i = 0; i < data.length; i += 4 * 13) {
      const c = [data[i], data[i + 1], data[i + 2]]
      const k = key(c)
      if (k) count[k].push(c)
    }
    const [k, hits] = Object.entries(count).sort((x, y) => y[1].length - x[1].length)
      .map(([name, list]) => [list.length > data.length / 52 * 0.04 ? name : null, list])[0]
    if (!k) bad = 'NO KEY COLOUR FOUND'
    else {
      const ref = [0, 1, 2].map((c) => hits.map((h) => h[c]).sort((x, y) => x - y)[hits.length >> 1])
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
  if (x1 < 0) return console.log(`${name}: CHECK, empty after keying, skipped`)
  if (!bad && WIDE.test(name)) {
    // a strip has to touch both sides; sample the columns at the two edges
    const touches = (x) => { for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 200) return true; return false }
    if (!touches(2) || !touches(W - 3)) bad = 'CHECK, does not reach both side edges'
  } else if (!bad && !EDGE.test(name)) {
    if (x0 < 2 || x1 > W - 3 || y0 < 2 || y1 > H - 3) bad = 'CHECK, touches the picture edge, probably cut off'
  }
  const box = WIDE.test(name)
    ? { left: 0, top: y0, width: W, height: y1 - y0 + 1 }
    : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
  const sharpOne = SHARP.test(name)
  const write = (buf, as) => (sharpOne
    ? sharp(buf, { raw: { width: W, height: H, channels: 4 } }).extract(box)
      .resize({ width: Math.min(box.width * 2, 3200), kernel: 'lanczos3' }).sharpen({ sigma: 1.4 })
    : sharp(buf, { raw: { width: W, height: H, channels: 4 } }).extract(box)
      .resize({ width: WIDE.test(name) ? MAX.wide : MAX.default, height: 1800, fit: 'inside', withoutEnlargement: true }))
    .webp({ quality: 84, alphaQuality: 90 })
    .toFile(path.join(OUT, `${as}.webp`))
  const split = SPLIT[name]
  if (split) {
    const inside = (x, y, [a, b, c, d]) => x >= a * W && x < c * W && y >= b * H && y < d * H
    const part = Buffer.from(data)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!inside(x, y, split.keep)) part[(y * W + x) * 4 + 3] = 0
      if (inside(x, y, split.cut)) data[(y * W + x) * 4 + 3] = 0
    }
    await write(part, split.part)
    console.log(`${split.part}: cut out of ${name}, same frame`)
  }
  await write(data, name)
  const kb = Math.round(fs.statSync(path.join(OUT, `${name}.webp`)).size / 1024)
  // on plain grey, to look for fringes and holes
  await sharp(path.join(OUT, `${name}.webp`)).resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#8a8a8a' }).png().toFile(path.join(PREVIEW, `${name}.png`))
  console.log(`${name}: ${bad || note}, ${box.width}x${box.height}, ${kb} KB`)
}

fs.mkdirSync(PREVIEW, { recursive: true })
const only = process.argv.slice(2)
const files = fs.readdirSync(RAW).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).filter((f) => !only.length || only.includes(path.parse(f).name))
if (!files.length) console.log('No pictures in art/raw yet.')
for (const f of files) await one(f)

if (fs.existsSync('art/LIST.txt')) {
  const want = fs.readFileSync('art/LIST.txt', 'utf8').split(/\s+/).filter(Boolean)
  const left = want.filter((n) => !fs.existsSync(path.join(OUT, `${n}.webp`)))
  console.log(`\n${want.length - left.length} of ${want.length} pictures ready.${left.length ? ' Still missing: ' + left.join(', ') : ''}`)
}
