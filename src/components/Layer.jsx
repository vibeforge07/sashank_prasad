import { artUrl } from '../art/index.js'

// All numbers are in stage units: the stage is 1080 wide, like the film.
//   x   distance of the layer's centre from the stage centre (ax: 'c')
//       or from the left / right edge of the screen (ax: 'l' / 'r')
//   y   distance from the bottom (ay: 'b') or the top (ay: 't')
//   w,h size of the picture
const u = (n) => `calc(${n} * var(--u))`

export default function Layer({ id, art, w, h, x = 0, y = 0, ax = 'c', ay = 'b', z = 1, flip, full, kind = 'prop', fit = 'contain' }) {
  const name = art || id
  const url = artUrl(name)
  const style = { zIndex: z, height: u(h), width: full ? `max(${u(w)}, 100cqw)` : u(w) }
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
  return (
    <div className={`layer k-${kind}${full ? ' strip' : ''} at-${ay}`} data-l={id} style={style}>
      <div className="layer-in">
        {url
          ? <img src={url} alt="" draggable="false" decoding="async" loading="lazy" style={{ transform: flip ? 'scaleX(-1)' : undefined, objectFit: fit, maxHeight: full && kind === 'ground' ? u(h * 1.25) : undefined, objectPosition: `${side} ${ay === 'b' ? 'bottom' : 'top'}` }} />
          : <span className="todo"><i>{name}</i></span>}
      </div>
    </div>
  )
}
