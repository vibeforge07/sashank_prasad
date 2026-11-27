import { artUrl } from '../art/index.js'

// All numbers are in stage units: the stage is 1080 wide, like the film.
//   x   distance of the layer's centre from the stage centre (ax: 'c')
//       or from the left / right edge of the screen (ax: 'l' / 'r')
//   y   distance from the bottom (ay: 'b') or the top (ay: 't')
//   w,h size of the picture
const u = (n) => `calc(${n} * var(--u))`

export default function Layer({ id, art, w, h, x = 0, y = 0, ax = 'c', ay = 'b', z = 1, flip, full, kind = 'prop', fit = 'contain', road, tall, repeat }) {
  const name = art || id
  const url = artUrl(name)
  // a backdrop drawn so its two ends meet: it repeats across the whole width at its own height,
  // one copy centred on the picture (so the low middle stays behind the stage)
  if (url && repeat) {
    const style = { zIndex: z, left: 0, right: 0, bottom: u(y), height: u(h), background: `url(${url}) calc(50% + var(--dx)) 100% / auto 100% repeat-x` }
    return <div className={`layer k-${kind}`} data-l={id} style={style}><div className="layer-in" /></div>
  }
  // something that rides on a painted road: sized and placed as fractions of the backdrop strip's width,
  // so it stays on its lane whatever the screen size ({ base: strip width in units, at: lane height, rw: own width })
  if (road) {
    const sw = `max(${u(road.base)}, 100cqw${road.tall ? `, ${road.tall} * 100cqh` : ''})`
    const width = `calc(${sw} * ${road.rw})`
    const style = { zIndex: z, width, height: `calc(${width} * ${h / w})`, left: '50%', marginLeft: `calc(${width} / -2)`, bottom: `calc(${sw} * ${road.at})` }
    return <div className={`layer k-${kind}`} data-l={id} style={style}><div className="layer-in"><img src={url} alt="" draggable="false" decoding="async" style={{ objectFit: 'contain', objectPosition: 'center bottom' }} /></div></div>
  }
  // `tall`: a strip may also grow so it reaches this many screen heights, cropping its sides on boxier screens
  const style = { zIndex: z, height: u(h), width: full ? `max(${u(w)}, 100cqw${tall ? `, ${(tall * w / h).toFixed(4)} * 100cqh` : ''})` : u(w) }
  // a full-width strip keeps its proportions when a wide screen stretches it
  if (full) style.height = `calc(${style.width} * ${h / w})`
  if (kind === 'frame') { style.width = u(w); style.height = '100cqh' }
  // on wide screens the words get their own side and the picture moves over by --dx
  if (ax === 'c') { style.left = full || kind === 'wall' ? '50%' : `calc(50% + ${u(x)} + var(--dx))`; style.marginLeft = `calc(${style.width} / -2)` }
  if (ax === 'l') style.left = u(x)
  if (ax === 'r') style.right = u(x)
  style[ay === 'b' ? 'bottom' : 'top'] = u(y)
  // corner pictures hug their edge; a flipped one is mirrored inside its box, so it starts from the left too
  const side = ax === 'c' ? 'center' : ax === 'l' || flip ? 'left' : 'right'
  if (url && full && (ay === 't' || kind === 'wall')) {
    // garlands and walls repeat sideways instead of growing
    const tile = { background: `url(${url}) 50% 0 / ${kind === 'wall' ? 'auto 100%' : `${u(w)} auto`} repeat-x` }
    return <div className={`layer k-${kind}`} data-l={id} style={{ ...style, height: kind === 'wall' ? '100cqh' : u(h) }}><div className="layer-in" style={tile} /></div>
  }
  const look = { transform: flip ? 'scaleX(-1)' : undefined, objectFit: fit, maxHeight: full && kind === 'ground' ? u(h * 1.25) : undefined, objectPosition: `${side} ${ay === 'b' ? 'bottom' : 'top'}` }
  // closed eyes for a blink (scripts/blink.py), one picture per person, laid exactly over the figure
  const lids = kind === 'person' ? [artUrl(`${name}-blink`), artUrl(`${name}-blink2`)].filter(Boolean) : []
  return (
    <div className={`layer k-${kind}${full ? ' strip' : ''} at-${ay}`} data-l={id} style={style}>
      <div className="layer-in">
        {url
          ? <img src={url} alt="" draggable="false" decoding="async" loading="lazy" style={look} />
          : <span className="todo"><i>{name}</i></span>}
        {url && lids.map((l) => <img key={l} className="blink" src={l} alt="" draggable="false" decoding="async" loading="lazy" style={look} />)}
      </div>
    </div>
  )
}
