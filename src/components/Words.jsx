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
    const onDown = (e) => {
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
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
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
      <p className="date" data-t="3.2">{e.date}</p>
      {e.time && <p data-t="3.8">{e.time}</p>}
    </div>
    {e.venue.length > 0 && <p className="venue" data-t="4.6">{e.venue.map((v) => <span key={v}>{v}</span>)}</p>}
    <Shloka id={id} t="6" lang={lang} />
  </>
}

// The wedding date on its own page, right after the card (the client's reference): the day, the month
// and the year each under gold foil, as on a scratch card. One stroke rubs every tile it crosses; a tile
// that is half cleared drops its foil, and once all three are open January opens with the day ringed,
// with buttons that put the wedding in the guest's own calendar, a reminder the day before included.
// Motion: scenes/date.js. The scene's autoplay waits for the 'scratched' event (see App).
const LOCALE = { bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN' }
const AT = ['20270127T120000Z', '20270127T180000Z'] // 5:30 to 11:30 in the evening, Indian time

// gold foil with fine glitter, an inner line and a small star in the middle, the same every time
function foil(cv) {
  const r = cv.getBoundingClientRect()
  const d = Math.min(window.devicePixelRatio || 1, 2)
  const W = Math.round(r.width * d)
  const H = Math.round(r.height * d)
  if (!W || !H) return
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d')
  const m = Math.min(W, H)
  g.globalCompositeOperation = 'source-over'
  const f = g.createLinearGradient(0, 0, W, H)
  f.addColorStop(0, '#b4822c'); f.addColorStop(0.3, '#f5d98c'); f.addColorStop(0.5, '#c8963a'); f.addColorStop(0.72, '#f7df9c'); f.addColorStop(1, '#a8761f')
  g.fillStyle = f
  g.beginPath(); g.roundRect(0, 0, W, H, m * 0.14); g.fill()
  for (let i = 0; i < 150; i++) {
    g.fillStyle = i % 3 ? '#fff6d455' : '#7a4f1240'
    g.fillRect(((i * 97) % 1000) / 1000 * W, ((i * 61 + 17) % 1000) / 1000 * H, d * 1.4, d * 1.4)
  }
  g.strokeStyle = '#fff3cf99'; g.lineWidth = d * 1.5
  g.beginPath(); g.roundRect(d * 5, d * 5, W - d * 10, H - d * 10, m * 0.1); g.stroke()
  const x = W / 2
  const y = H / 2
  const k = m * 0.12
  g.fillStyle = '#fffbe8d9'
  g.beginPath(); g.moveTo(x, y - k)
  g.quadraticCurveTo(x, y, x + k, y); g.quadraticCurveTo(x, y, x, y + k); g.quadraticCurveTo(x, y, x - k, y); g.quadraticCurveTo(x, y, x, y - k)
  g.fill()
}

// flowers thrown out of the middle of a box on the screen
function burst(r, n) {
  const layer = document.createElement('div')
  layer.className = 'g-petals sc-petals'
  document.body.appendChild(layer)
  petals(layer, n, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
  setTimeout(() => layer.remove(), 6000)
}

// the wedding for Google Calendar, Apple Calendar (an .ics file, which Outlook on a computer opens too)
// and Outlook on the web, in the reader's own language
function calendars(c) {
  const e = c.events.wedding
  const title = `${e.title} · ${c.hero.groom} ${c.hero.and} ${c.hero.bride}`
  const about = [e.time, ...e.venue].join('\n')
  const place = c.date.place
  const q = (o) => new URLSearchParams(o).toString()
  const iso = (t) => t.replace(/(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z/, '$1-$2-$3T$4:$5:$6Z')
  const esc = (t) => t.replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n')
  // a calendar file's lines are folded at 75 bytes
  const fold = (line) => {
    const out = []
    let cur = ''
    let n = 0
    for (const ch of line) {
      const b = new TextEncoder().encode(ch).length
      if (n + b > 74) { out.push(cur); cur = ' '; n = 1 }
      cur += ch
      n += b
    }
    return [...out, cur].join('\r\n')
  }
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shashank and Debashruti//Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', 'UID:shashank-debashruti-wedding-20270127', 'DTSTAMP:20261127T000000Z', `DTSTART:${AT[0]}`, `DTEND:${AT[1]}`,
    `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(about)}`, `LOCATION:${esc(place)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n')
  return [
    [`https://calendar.google.com/calendar/render?${q({ action: 'TEMPLATE', text: title, dates: AT.join('/'), details: about, location: place })}`],
    [`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`, 'shashank-debashruti-wedding.ics'],
    [`https://outlook.live.com/calendar/0/deeplink/compose?${q({ path: '/calendar/action/compose', rru: 'addevent', subject: title, startdt: iso(AT[0]), enddt: iso(AT[1]), body: about, location: place })}`],
  ]
}

export function DatePage({ c, lang }) {
  const d = c.date
  const e = c.events.wedding
  const wide = useWide()
  const row = useRef(null)
  const cal = useRef(null)
  const shown = useRef([false, false, false])
  const [open, setOpen] = useState([false, false, false])
  const all = open.every(Boolean)

  // the foil on every tile still closed (painted again when its size changes); one stroke rubs every tile it crosses
  useEffect(() => {
    const el = row.current
    const cvs = [...el.querySelectorAll('canvas')]
    const gone = [...shown.current]
    let last = null
    let moves = 0
    const paint = () => cvs.forEach((cv, i) => {
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (!gone[i] && (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr))) foil(cv)
    })
    const rub = (ev) => {
      if (!(ev.buttons || ev.pointerType === 'touch')) return
      const p = [ev.clientX, ev.clientY]
      const a = last || p
      const check = ++moves % 5 === 0
      cvs.forEach((cv, i) => {
        if (gone[i]) return
        const r = cv.getBoundingClientRect()
        const k = cv.width / r.width
        const g = cv.getContext('2d')
        const w = Math.min(cv.width, cv.height) * 0.36
        g.globalCompositeOperation = 'destination-out'
        g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w
        g.beginPath(); g.moveTo((a[0] - r.left) * k, (a[1] - r.top) * k); g.lineTo((p[0] - r.left) * k, (p[1] - r.top) * k); g.stroke()
        const near = p[0] > r.left - w / k && p[0] < r.right + w / k && p[1] > r.top - w / k && p[1] < r.bottom + w / k
        if (!check || !near) return
        const px = g.getImageData(0, 0, cv.width, cv.height).data
        let clear = 0
        let n = 0
        for (let j = 3; j < px.length; j += 4 * 19) { n++; if (px[j] < 40) clear++ }
        if (clear / n > 0.45) { gone[i] = true; setOpen((o) => o.map((v, x) => v || x === i)) }
      })
      last = p
    }
    const down = (ev) => { last = null; el.setPointerCapture?.(ev.pointerId); rub(ev) }
    const up = () => { last = null }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(el)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', rub)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      ro.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', rub)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [])

  // a tile drops its foil in petals; when all three are open, January opens beside or under them
  useLayoutEffect(() => {
    const el = row.current
    open.forEach((o, i) => {
      if (!o || shown.current[i]) return
      shown.current[i] = true
      const tile = el.children[i].firstElementChild
      burst(tile.getBoundingClientRect(), 8)
      gsap.to(tile.querySelector('canvas'), { autoAlpha: 0, duration: 0.45 })
      gsap.fromTo(tile.querySelector('.dt-v'), { scale: 0.82 }, { scale: 1, duration: 0.6, ease: 'back.out(2.2)' })
    })
    if (!all) return
    burst(el.getBoundingClientRect(), 22)
    const box = cal.current
    const inner = box.firstElementChild
    const tl = gsap.timeline({ delay: 0.3 })
      .fromTo(box, wide ? { width: 0, autoAlpha: 0 } : { height: 0, autoAlpha: 0 },
        { ...(wide ? { width: inner.offsetLeft + inner.offsetWidth } : { height: inner.offsetTop + inner.offsetHeight }), autoAlpha: 1, duration: 0.9, ease: 'power2.inOut', clearProps: 'width,height' })
      .fromTo(box.querySelector('ellipse'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, 0.8)
      .fromTo(box.querySelectorAll('.dt-when, .dt-add > *'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 1)
    el.dispatchEvent(new CustomEvent('scratched', { bubbles: true }))
    return () => tl.kill()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // the month of the wedding, Sunday first, in the reader's own words and digits
  const [day, month, year] = e.date.split(' ')
  const first = new Date(2027, 0, 1).getDay()
  const names = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'narrow' }).format(new Date(2027, 0, 3 + i)))
  const cells = [...Array(first).fill(''), ...Array.from({ length: 31 }, (_, i) => String(i + 1))]
  const links = calendars(c)
  return (
    <div className={`dt${all ? ' is-open' : ''}`}>
      <div className="dt-decor" data-l="dt-decor" aria-hidden="true">
        <i className="dt-glow" />
        <div className="iv-sparks">
          {SPARKS.map(([x, y, s]) => <i key={`${x}-${y}`} className="iv-spark" style={{ left: `${x}%`, top: `${y}%`, '--s': s }} />)}
        </div>
        {['l', 'r'].map((s) => <div key={s} className={`dt-lamp dt-lamp-${s}`}><img src={artUrl('reception-lanterns')} alt="" /></div>)}
        {['l', 'r'].map((s) => <div key={s} className={`dt-stand dt-stand-${s}`}><img src={artUrl('sangeet-candles')} alt="" /></div>)}
        <div className="iv-toran" style={{ backgroundImage: `url(${artUrl('gate-toran')})` }} />
        <div className="iv-flowers" style={{ backgroundImage: `url(${artUrl('gate-flowers')})` }} />
      </div>
      <div className="dt-body">
        <div className="dt-main">
          <h2 className="dt-title">{d.title}</h2>
          <i className="dt-orn" />
          <p className="dt-hint"><i />{c.ui.scratch}<i /></p>
          <div className={`dt-tiles scratch${all ? ' done' : ''}`} ref={row}>
            {[day, month, year].map((v, i) => (
              <div className="dt-col" key={i}>
                <div className={`dt-tile${['', ' dt-month', ' dt-year'][i]}${open[i] ? ' open' : ''}`}>
                  <span className="dt-v">{v}</span>
                  <canvas aria-label={`${c.ui.scratch}: ${d.parts[i]}`} />
                </div>
                <span className="dt-part">{d.parts[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dt-cal" ref={cal} aria-hidden={!all}>
          <div className="dt-cal-in">
            <p className="dt-mh">{month} {year}</p>
            <div className="dt-g">
              {names.map((n, i) => <b key={'h' + i}>{n}</b>)}
              {cells.map((x, i) => x ? <i key={i} className={x === '27' ? 'on' : undefined}>{digits(x, lang)}{x === '27' && <svg viewBox="0 0 40 30"><ellipse cx="20" cy="15" rx="18" ry="13" pathLength="1" /></svg>}</i> : <i key={i} />)}
            </div>
            <p className="dt-when">{e.day} · {e.time}</p>
            <div className="dt-add">
              <p>{d.add}</p>
              <div>{links.map(([href, file], i) => <a key={d.apps[i]} href={href} target="_blank" rel="noopener" download={file}>{d.apps[i]}</a>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// days, hours, minutes and seconds left; while the lamp is being lit they roll up from nothing (k 0 to 1)
function Countdown({ c, lang, k }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i) }, [])
  const left = Math.max(0, WEDDING_AT - now)
  const n = [left / 864e5, (left / 36e5) % 24, (left / 6e4) % 60, (left / 1e3) % 60].map((v) => Math.floor(Math.floor(v) * k))
  const f = new Intl.NumberFormat({ bn: 'bn-IN-u-nu-beng', hi: 'hi-IN-u-nu-deva' }[lang] || 'en-IN', { minimumIntegerDigits: 2 })
  const box = useRef(null)
  const was = useRef(n)
  // a number that changes drops into its tile
  useLayoutEffect(() => {
    if (k < 1) { was.current = n; return }
    box.current.querySelectorAll('b').forEach((b, i) => {
      if (was.current[i] !== n[i]) gsap.fromTo(b, { yPercent: -45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.8)' })
    })
    was.current = n
  })
  if (!left) return null
  return (
    <div className="cl-count" data-r ref={box}>
      {n.map((v, i) => <p key={i}><span className="cl-tile"><b>{f.format(v)}</b></span><span className="cl-unit">{c.closing.units[i]}</span></p>)}
    </div>
  )
}

// The last page, after the client's reference film (saath.studio): a carved arch in the blue of the night and an
// unlit brass lamp on a marble ledge. A tap lights the lamp: the light spreads from the flame over the arch,
// which turns warm, the small lamps on its pillars come on one by one, and the words come in: the line,
// the countdown to the minute and second, and who awaits you. If nobody taps, the lamp lights itself.
// glints on the carving (per cent of the arch), as in the reference
const GLINTS = [[6, 30, 0.7], [94, 22, 0.8], [8, 58, 0.6], [92, 64, 0.7], [5, 86, 0.6], [95, 92, 0.5], [30, 6, 0.6], [70, 7, 0.7], [50, 2.5, 0.5], [16, 12, 0.5], [84, 13, 0.6]]
const NICHES = [24.5, 32, 39.6, 47.1, 54.7, 62.2, 69.8, 77.3, 84.9].flatMap((y) => [[9.2, y], [90.8, y]])

export function Closing({ c, lang }) {
  const k = c.closing
  const [lit, setLit] = useState(false)
  const [roll, setRoll] = useState(0)
  const root = useRef(null)
  const light = () => setLit(true)

  // nobody tapped: the lamp lights itself after a while on screen
  useEffect(() => {
    if (lit) return
    let t
    const io = new IntersectionObserver(([e]) => { clearTimeout(t); if (e.isIntersecting) t = setTimeout(light, 7000) }, { threshold: 0.6 })
    io.observe(root.current)
    return () => { clearTimeout(t); io.disconnect() }
  }, [lit])

  useLayoutEffect(() => {
    if (!lit) return
    const el = root.current
    const $ = (s) => el.querySelector(s)
    const $$ = (s) => [...el.querySelectorAll(s)]
    const r = $('.cl-lamp').getBoundingClientRect()
    burst({ left: r.left, top: r.top - r.height * 0.4, width: r.width, height: r.height * 0.5 }, 14)
    const count = { k: 0 }
    const tl = gsap.timeline()
      .to($('.cl-hint'), { autoAlpha: 0, duration: 0.3 }, 0)
      .fromTo($('.cl-flame'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.4)' }, 0)
      .fromTo($('.cl-glow'), { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0.1)
      .fromTo($$('.cl-night'), { '--r': '-25%' }, { '--r': '140%', duration: 2.4, ease: 'power1.inOut' }, 0.2)
      .fromTo($$('.cl-niche'), { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: { each: 0.07, from: 'end' } }, 0.5)
      .fromTo($$('.cl-lantern'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.6)
      .fromTo($$('.cl-body [data-r]'), { autoAlpha: 0, y: 14, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out', stagger: 0.28, clearProps: 'all' }, 1.2)
      .to(count, { k: 1, duration: 1.6, ease: 'power2.out', onUpdate: () => setRoll(count.k) }, 1.6)
      .add(() => el.dispatchEvent(new CustomEvent('scratched', { bubbles: true })), 2.4)
    // the flame never stands quite still
    const flick = gsap.to($('.cl-flame i'), { scaleY: 1.12, scaleX: 0.9, skewX: 3, duration: 0.18, repeat: -1, yoyo: true, ease: 'sine.inOut', repeatRefresh: true })
    return () => { tl.kill(); flick.kill() }
  }, [lit])

  const kin = (
    <div className="cl-kin" data-r>
      <p className="cl-head"><i />{k.awaiting}<i /></p>
      <div className="cl-names">
        {k.names.slice(0, -1).map((n) => <span key={n}>{n}</span>)}
        <span className="cl-last">{k.names[k.names.length - 1]}</span>
      </div>
    </div>
  )
  // the carved arch in its two lights, with its lanterns, the lamps on its pillars and the glints on its carving
  const face = <>
    <img className="cl-warm" src={artUrl('closing-arch-warm')} alt="" />
    <img className="cl-night" src={artUrl('closing-arch-night')} alt="" />
    {[3.6, 96.4].map((x) => <i key={x} className="cl-lantern" style={{ left: `${x}%` }} />)}
    {NICHES.map(([x, y]) => <i key={`${x}-${y}`} className="cl-niche" style={{ left: `${x}%`, top: `${y}%` }} />)}
    <div className="iv-sparks">{GLINTS.map(([x, y, sz]) => <i key={`${x}-${y}`} className="iv-spark" style={{ left: `${x}%`, top: `${y}%`, '--s': sz }} />)}</div>
  </>
  return (
    <div className={`cl${lit ? ' is-lit' : ''}`} ref={root}>
      {/* on a wide screen the arch is one of a row, like a palace colonnade */}
      <i className="cl-floor" />
      {[-2, -1, 1, 2].map((o) => <div key={o} className="cl-wing" style={{ '--o': o }} aria-hidden="true">{face}</div>)}
      <div className="cl-arch" data-l="cl-arch">
        <i className="cl-glow" />
        {face}
        <div className="cl-ledge" />
        <button type="button" className={`cl-lamp scratch${lit ? ' done' : ''}`} onClick={light} aria-label={c.ui.light} disabled={lit}>
          <span className="cl-flame"><i /></span>
          <svg viewBox="0 0 120 92" aria-hidden="true">
            <defs>
              <linearGradient id="cl-brass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe08a" /><stop offset=".45" stopColor="#d9a13d" /><stop offset="1" stopColor="#8a5418" />
              </linearGradient>
            </defs>
            <g stroke="#3a1c08" strokeWidth="2.4" strokeLinejoin="round" fill="url(#cl-brass)">
              <ellipse cx="60" cy="85" rx="27" ry="5.5" />
              <path d="M52 84 C54 74 55 68 56 62 L64 62 C65 68 66 74 68 84 Z" />
              <ellipse cx="60" cy="62" rx="12" ry="3.4" />
              <path d="M14 42 C22 62 44 66 60 66 C80 66 96 60 104 48 L114 38 C104 40 96 42 90 42 Z" />
              <ellipse cx="54" cy="43" rx="40" ry="7" fill="#5a2c0c" />
            </g>
            <path d="M104 41 L111 36" stroke="#2a1406" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
        <p className="cl-hint"><i />{c.ui.light}<i /></p>
      </div>
      <div className="cl-body" aria-hidden={!lit}>
        <p className="cl-line" data-r>{k.lines.map((l) => <span key={l}>{l}</span>)}</p>
        <Countdown c={c} lang={lang} k={roll} />
        <p className="cl-until" data-r>{k.until}</p>
        {kin}
        {/* on a phone these follow on under the names; on a wide screen they stand at the two sides of the arch */}
        {contact && <div className="cl-side cl-side-l" data-r>
          <p><em>{k.rsvp}</em><a href={`tel:${contact.phone.replace(/-/g, '')}`}>{k.call} {digits(contact.phone, lang)}</a></p>
          <p><em>{k.homes[0]}</em><span>{contact.homes[lang][0]}</span></p>
        </div>}
        <div className="cl-side cl-side-r" data-r>
          {contact && <p><em>{k.homes[1]}</em><span>{contact.homes[lang][1]}</span></p>}
          <Shloka id="closing" t="0" lang={lang} />
        </div>
      </div>
    </div>
  )
}
