import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { PETALS, petals } from './petals.js'
import { EVENTS, WEDDING_AT } from '../content/events.js'
import { SHLOKAS } from '../content/shlokas.js'
import { artUrl } from '../art/index.js'
import ring from '../opening/ring.webp'
import sindoor from '../opening/sindoor.webp'

// phone number and home addresses live outside git, see .gitignore
const contact = Object.values(import.meta.glob('../content/contact.js', { eager: true }))[0]?.CONTACT


// every number in the reader's own digits
const DIGITS = { bn: '০১২৩৪৫৬৭৮৯', hi: '०१२३४५६७८९' }
const digits = (s, lang) => (DIGITS[lang] ? s.replace(/[0-9]/g, (d) => DIGITS[lang][d]) : s)

const Shloka = ({ id, t, lang }) => SHLOKAS[lang]?.[id]
  ? <p className="shloka" lang={lang} data-t={t}>{SHLOKAS[lang][id].map((l) => <span key={l}>{l}</span>)}</p>
  : null

export function Hero({ c, lang }) {
  return <>
    <p className="invocation" data-t="0">{c.hero.invocation}</p>
    <Shloka id="hero" t="0.9" lang={lang} />
    <h1 className="name" data-t="2">{c.hero.groom}</h1>
    <p className="amp" data-t="3.4">{c.hero.and}</p>
    <h1 className="name" data-t="4">{c.hero.bride}</h1>
  </>
}


// The invitation card, as in a real one (the same scene as the red-rose card site): the section pins
// while the guest scrolls; the seal comes off, the flap opens, the card slides out lying on its side,
// stands up and comes to face you, and every page turns with the scroll. Motion: scenes/invitation.js.
const isWide = () => window.innerWidth >= window.innerHeight

function useWide() {
  const [wide, setWide] = useState(isWide)
  useEffect(() => { const on = () => setWide(isWide()); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])
  return wide
}

// gold glints over the crimson: [left %, top %, size], each twinkles on its own beat (scenes/invitation.js)
const SPARKS = [[7, 30, 1], [17, 54, 0.7], [26, 21, 0.8], [11, 74, 0.9], [33, 41, 0.6], [44, 17, 1], [57, 27, 0.7], [67, 15, 0.9],
  [75, 45, 0.8], [87, 25, 1], [93, 57, 0.7], [81, 71, 0.9], [63, 79, 0.6], [23, 87, 0.8], [47, 89, 0.7], [71, 59, 0.6]]
const clamp1 = (v) => Math.max(-1, Math.min(1, v))

export function Family({ c, lang }) {
  const f = c.family
  const wide = useWide()
  const inv = useRef(null)
  // the couple's picture on the cover, once art/raw/couple-photo.png has been through `npm run art`
  const photo = artUrl('couple-photo')

  // the room answers the guest: the layers drift apart with the mouse (or the tilt of an Android phone),
  // and a touch sets the marigold strands and their bells swinging
  useEffect(() => {
    const el = inv.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const live = () => el.closest('.scene')?.classList.contains('is-live')
    const movers = [['.iv-far', 10], ['.iv-mid', 18], ['.iv-near', 26], ['.iv-glow', -12]].map(([s, d]) => {
      const t = el.querySelector(s)
      return [gsap.quickTo(t, 'x', { duration: 1, ease: 'power3' }), gsap.quickTo(t, 'y', { duration: 1, ease: 'power3' }), d]
    })
    const look = (px, py) => movers.forEach(([mx, my, d]) => { mx(-px * d); my(-py * d * 0.6) })
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      look(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
    }
    const onTilt = (e) => { if (e.gamma != null && live()) look(clamp1(e.gamma / 25), clamp1((e.beta - 40) / 25)) }
    // a strand swings away from the touch (its idle sway runs on the picture inside, this on its holder)
    const malas = [...el.querySelectorAll('.iv-mala')]
    let down = null
    const onDown = (e) => {
      down = { x: e.clientX, y: e.clientY, t: e.timeStamp }
      malas.forEach((m) => {
        const r = m.getBoundingClientRect()
        if (!r.width) return
        const mid = r.left + r.width / 2
        const k = (mid > e.clientX ? -1 : 1) * 6 * Math.max(0.3, 1 - Math.abs(e.clientX - mid) / window.innerWidth)
        gsap.killTweensOf(m)
        gsap.timeline().to(m, { rotation: k, duration: 0.2, ease: 'power2.out' })
          .to(m, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.25)' })
      })
    }
    // a plain tap (not a swipe) throws a few petals from where the finger was
    const onUp = (e) => {
      if (!down || e.timeStamp - down.t > 300 || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) return
      down = null
      const box = document.createElement('div')
      box.className = 'g-petals sc-petals'
      document.body.appendChild(box)
      petals(box, 7, { x: e.clientX, y: e.clientY })
      setTimeout(() => box.remove(), 5500)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [])
  const frame = <><i className="cp-frame" /><i className="cp-c cp-c-tl" /><i className="cp-c cp-c-tr" /><i className="cp-c cp-c-bl" /><i className="cp-c cp-c-br" /></>
  const kin = (rows) => rows.map(([k, v]) => <p className="kin" key={k}><em>{k}</em><span>{v}</span></p>)
  const family = (name, rows) => <div className="cp"><div className="cp-in"><i className="cp-orn" /><h3 className="nm">{name}</h3>{kin(rows)}<i className="cp-orn" /></div>{frame}</div>
  const pages = {
    cover: (
      <div className={`cp cp-cover${photo ? ' has-photo' : ''}`}>
        <div className="cp-in">
          {photo
            ? <div className="cv-photo"><img src={photo} alt={`${c.hero.groom} ${c.hero.and} ${c.hero.bride}`} /></div>
            : <img className="cv-ring" src={ring} alt="" />}
          <h2 className="cv-title">{c.gate.seal.join(' ')}</h2>
          <p className="cv-names"><span>{c.hero.groom}</span><small>{c.hero.and}</small><span>{c.hero.bride}</span></p>
          <p className="cv-date">{c.gate.date}</p>
        </div>
        {frame}
      </div>
    ),
    arch: (
      <div className="cp">
        <div className="cp-in">
          <p className="cp-word">{c.hero.invocation}</p>
          <div className="arch"><img className="arch-g" src={artUrl('hero-groom')} alt="" /><img className="arch-b" src={artUrl('hero-bride')} alt="" /></div>
          <p className="cp-pair">{c.hero.groom} <i>{c.hero.and}</i> {c.hero.bride}</p>
        </div>
        {frame}
      </div>
    ),
    request: (
      <div className="cp">
        <div className="cp-in">
          <Shloka id="family" lang={lang} />
          <i className="cp-orn" />
          <p className="req">{f.request.map((l) => <span key={l}>{l}</span>)}</p>
          <h3 className="nm">{f.groom}</h3>
          <p className="amp2">{f.and}</p>
          <h3 className="nm">{f.bride}</h3>
          <i className="cp-orn" />
        </div>
        {frame}
      </div>
    ),
    groom: family(f.groom, f.groomLines),
    bride: family(f.bride, f.brideLines),
  }
  // desktop: a leaf carries a right page on its front and the next left page on its back;
  // phone: one page per leaf with plain card on its back, so every page gets the whole screen
  const order = wide ? [['cover', 'arch'], ['request', 'groom']] : [['cover'], ['arch'], ['request'], ['groom']]
  return (
    <div className="inv" ref={inv}>
      {/* back to front: the warm light and the glints, the paisleys, the drapes and strands, the elephants */}
      <div className="inv-decor" data-l="iv-decor" aria-hidden="true">
        <div className="iv-glow"><i /></div>
        <div className="iv-sparks">
          {SPARKS.map(([x, y, s]) => <i key={`${x}-${y}`} className="iv-spark" style={{ left: `${x}%`, top: `${y}%`, '--s': s }} />)}
        </div>
        <div className="iv-far">
          <img className="iv-pais iv-pais-l" src={artUrl('gate-paisley')} alt="" />
          <img className="iv-pais iv-pais-r" src={artUrl('gate-paisley')} alt="" />
        </div>
        <div className="iv-mid">
          {['l', 'r'].map((s) => <div key={s} className={`iv-drape iv-drape-${s}`}><img src={artUrl('haldi-drape')} alt="" /></div>)}
          {['l', 'r'].flatMap((s) => [1, 2, 3].map((n) => <span key={s + n} className={`iv-mala iv-mala-${s} iv-m${n}`}><img src={artUrl('gate-mala')} alt="" /></span>))}
        </div>
        <div className="iv-near">
          {['l', 'r'].map((s) => <div key={s} className={`iv-ele iv-ele-${s}`}><img src={artUrl('gate-elephant')} alt="" /></div>)}
        </div>
        <div className="iv-toran" style={{ backgroundImage: `url(${artUrl('gate-toran')})` }} />
        <div className="iv-flowers" style={{ backgroundImage: `url(${artUrl('gate-flowers')})` }} />
      </div>
      <img className="inv-ring" src={ring} alt="" aria-hidden="true" />
      <div className="inv-petals" data-l="inv-petals" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <img key={i} src={PETALS[i % PETALS.length]} alt="" />)}
      </div>
      <h2 className="inv-head">{f.title}</h2>
      <div className="env-stage">
        <div className="env">
          <div className="env-back" />
          <div className={`book${wide ? ' book-wide' : ''}`}>
            <div className="leaves">
              {order.map(([front, back], i) => (
                <div className="leaf" key={front} style={{ zIndex: order.length - i + 1 }}>
                  <div className="leaf-face leaf-front">{pages[front]}</div>
                  <div className="leaf-face leaf-back">{back ? pages[back] : <div className="cp cp-blank">{frame}</div>}</div>
                </div>
              ))}
              <div className="leaf leaf-base" style={{ zIndex: 0 }}><div className="leaf-face leaf-front">{pages.bride}</div></div>
            </div>
          </div>
          <div className="env-front"><span className="env-edge" /></div>
          <div className="env-flap"><div className="env-flap-face" /><div className="env-flap-back" /></div>
          <div className="env-seal"><img src={sindoor} alt="" /><img className="seal-ring" src={ring} alt="" /></div>
        </div>
      </div>
      <p className="inv-hint">{c.hero.scroll}</p>
    </div>
  )
}

export function EventWords({ c, id, lang }) {
  const e = c.events[id]
  const meta = EVENTS.find((x) => x.id === id)
  return <>
    <p className="side" data-t="0">{c.side[meta.side]}</p>
    <h2 className="title" data-t="0.2">{e.title}</h2>
    <p className="tag" data-t="1.4">{e.tag}</p>
    <div className="when">
      <p data-t="2.6">{e.day}</p>
      {id === 'wedding' ? <Scratch c={c} lang={lang} date={e.date} /> : <p className="date" data-t="3.2">{e.date}</p>}
      {e.time && <p data-t="3.8">{e.time}</p>}
    </div>
    {e.venue.length > 0 && <p className="venue" data-t="4.6">{e.venue.map((v) => <span key={v}>{v}</span>)}</p>}
    <Shloka id={id} t="6" lang={lang} />
  </>
}

// The wedding date sits under gold foil, as on a scratch card. Scratch half of it away and the foil
// falls off in petals, and a small January calendar opens with the day ringed.
// The scene's autoplay waits for this ('scratched' event, see App).
const LOCALE = { bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN' }

function Scratch({ c, lang, date }) {
  const box = useRef(null)
  const cv = useRef(null)
  const cal = useRef(null)
  const [done, setDone] = useState(false)

  // paint the foil (again when the size or the language changes, until it is scratched)
  useEffect(() => {
    if (done) return
    const el = box.current
    const canvas = cv.current
    let cleared = false
    let last = null
    let moves = 0
    const paint = () => {
      const r = el.getBoundingClientRect()
      const d = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(r.width * d)
      canvas.height = Math.round(r.height * d)
      const g = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height
      g.globalCompositeOperation = 'source-over'
      const f = g.createLinearGradient(0, 0, W, H)
      f.addColorStop(0, '#b4822c'); f.addColorStop(0.3, '#f5d98c'); f.addColorStop(0.5, '#c8963a'); f.addColorStop(0.72, '#f7df9c'); f.addColorStop(1, '#a8761f')
      g.fillStyle = f
      g.beginPath(); g.roundRect(0, 0, W, H, H * 0.18); g.fill()
      for (let i = 0; i < 260; i++) { // fine glitter, the same every time
        const x = ((i * 97) % 1000) / 1000 * W
        const y = ((i * 61 + 17) % 1000) / 1000 * H
        g.fillStyle = i % 3 ? '#fff6d455' : '#7a4f1240'
        g.fillRect(x, y, d * 1.4, d * 1.4)
      }
      g.strokeStyle = '#fff3cf99'; g.lineWidth = d * 1.5
      g.beginPath(); g.roundRect(d * 4, d * 4, W - d * 8, H - d * 8, H * 0.14); g.stroke()
      const font = getComputedStyle(el).fontFamily
      g.fillStyle = '#5b3608'
      g.textAlign = 'center'; g.textBaseline = 'middle'
      let size = H * 0.42
      g.font = `${size}px ${font}`
      while (g.measureText(c.ui.scratch).width > W * 0.9 && size > 8) { size -= 1; g.font = `${size}px ${font}` }
      g.fillText(c.ui.scratch, W / 2, H / 2)
    }
    const at = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height] }
    const rub = (e) => {
      if (cleared || !(e.buttons || e.pointerType === 'touch')) return
      const g = canvas.getContext('2d')
      const p = at(e)
      g.globalCompositeOperation = 'destination-out'
      g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = canvas.height * 0.42
      g.beginPath(); g.moveTo(...(last || p)); g.lineTo(...p); g.stroke()
      last = p
      if (++moves % 6) return
      const a = g.getImageData(0, 0, canvas.width, canvas.height).data
      let clear = 0
      let n = 0
      for (let i = 3; i < a.length; i += 4 * 23) { n++; if (a[i] < 40) clear++ }
      if (clear / n > 0.5) { cleared = true; setDone(true) }
    }
    const down = (e) => { last = null; canvas.setPointerCapture?.(e.pointerId); rub(e) }
    const up = () => { last = null }
    paint()
    document.fonts?.ready.then(() => !cleared && paint())
    const ro = new ResizeObserver(() => !cleared && paint())
    ro.observe(el)
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', rub)
    canvas.addEventListener('pointerup', up)
    return () => { ro.disconnect(); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', rub); canvas.removeEventListener('pointerup', up) }
  }, [done, lang, c.ui.scratch])

  // the foil falls away in petals and the calendar opens
  useLayoutEffect(() => {
    if (!done) return
    const r = box.current.getBoundingClientRect()
    const layer = document.createElement('div')
    layer.className = 'g-petals sc-petals'
    document.body.appendChild(layer)
    petals(layer, 26, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
    setTimeout(() => layer.remove(), 6000)
    const tl = gsap.timeline()
    tl.to(cv.current, { autoAlpha: 0, duration: 0.5 }, 0)
    tl.fromTo(box.current.querySelector('.sc-date'), { scale: 0.9 }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0.1)
    tl.fromTo(cal.current, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0.4)
    tl.fromTo(cal.current.querySelector('ellipse'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, 1.1)
    box.current.dispatchEvent(new CustomEvent('scratched', { bubbles: true }))
  }, [done])

  // the month of the wedding, Sunday first, in the reader's own words and digits
  const [, month, year] = date.split(' ')
  const first = new Date(2027, 0, 1).getDay()
  const names = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'narrow' }).format(new Date(2027, 0, 3 + i)))
  const cells = [...Array(first).fill(''), ...Array.from({ length: 31 }, (_, i) => String(i + 1))]
  const wed = digits('27', lang)
  return <>
    <p className="date" data-t="3.2">
      <span className={`scratch${done ? ' done' : ''}`} ref={box}>
        <span className="sc-date">{date}</span>
        <canvas ref={cv} aria-label={c.ui.scratch} />
      </span>
    </p>
    <div className="cal" ref={cal} aria-hidden={!done}>
      <p className="cal-h">{month} {year}</p>
      <div className="cal-g">
        {names.map((n, i) => <b key={'h' + i}>{n}</b>)}
        {cells.map((d, i) => d ? <i key={i} className={digits(d, lang) === wed ? 'on' : undefined}>{digits(d, lang)}{digits(d, lang) === wed && <svg viewBox="0 0 40 30"><ellipse cx="20" cy="15" rx="18" ry="13" pathLength="1" /></svg>}</i> : <i key={i} />)}
      </div>
    </div>
  </>
}

function Countdown({ c, lang }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i) }, [])
  const left = Math.max(0, WEDDING_AT - now)
  if (!left) return null
  const n = [left / 864e5, (left / 36e5) % 24, (left / 6e4) % 60].map(Math.floor)
  const f = new Intl.NumberFormat({ bn: 'bn-IN-u-nu-beng', hi: 'hi-IN-u-nu-deva' }[lang] || 'en-IN')
  return (
    <div className="countdown" data-t="2.4">
      {n.map((v, i) => <p key={c.closing.units[i]}><b>{f.format(v)}</b><span>{c.closing.units[i]}</span></p>)}
      <small>{c.closing.until}</small>
    </div>
  )
}

export function Closing({ c, lang }) {
  const k = c.closing
  return <>
    <p className="closing-line" data-t="0">{k.lines.map((l) => <span key={l}>{l}</span>)}</p>
    <Countdown c={c} lang={lang} />
    <p className="kin" data-t="3.4"><em>{k.awaiting}</em><span>{k.names}</span></p>
    {contact && <>
      <p className="kin" data-t="4.2"><em>{k.rsvp}</em><a href={`tel:${contact.phone.replace(/-/g, '')}`}>{k.call} {digits(contact.phone, lang)}</a></p>
      {contact.homes[lang].map((h, i) => <p className="kin home" key={h} data-t={4.8 + i * 0.5}><em>{k.homes[i]}</em><span>{h}</span></p>)}
    </>}
    <Shloka id="closing" t="6" lang={lang} />
  </>
}
