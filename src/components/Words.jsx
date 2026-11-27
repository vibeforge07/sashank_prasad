import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { PETALS, petals } from './petals.js'
import { EVENTS, WEDDING_AT, mapUrl } from '../content/events.js'
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


// The invitation card, as in a real one: an envelope with a sindoor seal, the card slides out,
// its cover opens like a book on the couple, then a page turns to the two families.
// All motion is in scenes/invitation.js; this is only the paper.
export function Family({ c, lang }) {
  const f = c.family
  const kin = (rows) => rows.map(([k, v]) => <p className="kin" key={k}><em>{k}</em><span>{v}</span></p>)
  const fam = (name, rows) => <div className="pg-in"><i className="orn" /><h3 className="nm">{name}</h3>{kin(rows)}<i className="orn" /></div>
  return (
    <div className="inv">
      <div className="inv-decor" aria-hidden="true">
        <img className="iv-pais iv-pais-l" src={artUrl('gate-paisley')} alt="" />
        <img className="iv-pais iv-pais-r" src={artUrl('gate-paisley')} alt="" />
        {['l', 'r'].flatMap((s) => [1, 2, 3].map((n) => <img key={s + n} className={`iv-mala iv-mala-${s} iv-m${n}`} src={artUrl('gate-mala')} alt="" />))}
        <div className="iv-toran" style={{ backgroundImage: `url(${artUrl('gate-toran')})` }} />
        <div className="iv-flowers" style={{ backgroundImage: `url(${artUrl('gate-flowers')})` }} />
      </div>
      <div className="inv-petals" data-l="inv-petals" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => <img key={i} src={PETALS[i % PETALS.length]} alt="" />)}
      </div>
      <div className="inv-stage">
        <div className="env env-b"><i /></div>
        <div className="book">
          <div className="pg pg-base">{fam(f.bride, f.brideLines)}</div>
          <div className="leaf leaf-a">
            <div className="face front pg">
              <div className="pg-in">
                <Shloka id="family" lang={lang} />
                <p className="req">{f.request.map((l) => <span key={l}>{l}</span>)}</p>
                <h3 className="nm">{f.groom}</h3>
                <p className="amp2">{f.and}</p>
                <h3 className="nm">{f.bride}</h3>
              </div>
            </div>
            <div className="face back pg">{fam(f.groom, f.groomLines)}</div>
          </div>
          <div className="leaf leaf-cover">
            <div className="face front cover">
              <img className="cv-ring" src={ring} alt="" />
              <h2 className="cv-title">{c.gate.seal.join(' ')}</h2>
              <p className="cv-names"><span>{c.hero.groom}</span><small>{c.hero.and}</small><span>{c.hero.bride}</span></p>
              <p className="cv-date">{c.gate.date}</p>
            </div>
            <div className="face back pg">
              <div className="pg-in">
                <p className="inv-word">{c.hero.invocation}</p>
                <div className="arch">
                  <img className="arch-g" src={artUrl('hero-groom')} alt="" />
                  <img className="arch-b" src={artUrl('hero-bride')} alt="" />
                </div>
                <i className="orn" />
              </div>
            </div>
          </div>
        </div>
        <div className="env env-fl"><i className="flap" /></div>
        <div className="env env-f">
          <i className="pocket" />
          <svg className="folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100 L50 58 L100 100 M0 0 L50 58 L100 0" /></svg>
          <div className="seal"><img src={sindoor} alt="" /><img className="seal-ring" src={ring} alt="" /></div>
          <div className="burst">{Array.from({ length: 10 }, (_, i) => <img key={i} src={PETALS[(i * 3) % PETALS.length]} alt="" />)}</div>
        </div>
      </div>
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
    {meta.map && <a className="pill" data-t="5.4" href={mapUrl(meta.map)} target="_blank" rel="noreferrer">{c.map}</a>}
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
