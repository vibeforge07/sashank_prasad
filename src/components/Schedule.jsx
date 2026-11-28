import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './Scene.jsx'
import { useArches } from './ornaments.js'
import { SCENES } from '../scenes/scenes.js'
import roses from '../opening/roses-corner.webp'

gsap.registerPlugin(ScrollTrigger)

// The three ceremonies at home before the wedding, laid out like the red-rose card site: first a cream page
// of arched gold frames, each with that ceremony's own scenery living inside it (its entrance, idle motion
// and blinks), then a maroon page with the diya timeline that lights up as the guest scrolls down.
export const FRAMED = ['briddhi', 'tilak', 'aiburobhaat']

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const reelOf = (el) => el?.closest('.reel') || undefined

// gold, bevel and the small drawings both pages use (ids prefixed so nothing else on the site can clash)
function Defs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="sch-goldFrame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b4a17" />
          <stop offset=".12" stopColor="#e9cd88" />
          <stop offset=".24" stopColor="#a77c33" />
          <stop offset=".36" stopColor="#fff0c2" />
          <stop offset=".5" stopColor="#b4873c" />
          <stop offset=".64" stopColor="#f1d796" />
          <stop offset=".78" stopColor="#8f6a25" />
          <stop offset=".9" stopColor="#e2c27a" />
          <stop offset="1" stopColor="#5e4013" />
        </linearGradient>
        <radialGradient id="sch-goldBall" cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset=".35" stopColor="#e9c877" />
          <stop offset=".75" stopColor="#a87c34" />
          <stop offset="1" stopColor="#5e4013" />
        </radialGradient>
        <filter id="sch-bevel" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b" />
          <feSpecularLighting in="b" surfaceScale="2.6" specularConstant=".95" specularExponent="18" lightingColor="#fff4d2" result="s">
            <feDistantLight azimuth="235" elevation="40" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
          <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".8" k4="0" result="lit" />
          <feDropShadow in="lit" dx="0" dy="3" stdDeviation="2.5" floodColor="#1a0306" floodOpacity=".5" />
        </filter>
      </defs>
      <symbol id="sch-lotusline" viewBox="0 0 280 36">
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M2 24H104M176 24H278" strokeWidth="1" />
          <path d="M20 28H96M184 28H260" strokeWidth=".6" opacity=".6" />
          <path d="M140 4c6 7 7 15 0 22c-7-7-6-15 0-22z" strokeWidth="1.1" />
          <path d="M140 26c-9-1-17-7-19-15c9 1 15 7 19 15zM140 26c9-1 17-7 19-15c-9 1-15 7-19 15z" strokeWidth="1.1" />
          <path d="M140 26c-11 2-21-1-27-7c9-2 19 1 27 7zM140 26c11 2 21-1 27-7c-9-2-19 1-27 7z" strokeWidth="1.1" />
          <path d="M124 30q16 5 32 0" strokeWidth="1.1" />
        </g>
        <circle cx="108" cy="24" r="2" fill="currentColor" />
        <circle cx="172" cy="24" r="2" fill="currentColor" />
        <circle cx="140" cy="15" r="1.6" fill="currentColor" />
      </symbol>
      <symbol id="sch-corner" viewBox="0 0 90 90">
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M3 88V22Q3 3 22 3H88" strokeWidth="1.4" />
          <path d="M10 88V28Q10 10 28 10H88" strokeWidth=".7" opacity=".7" />
          <path d="M17 17c9 0 21 6 23 19c-12-1-22-9-23-19z" strokeWidth="1.2" />
          <path d="M17 17c3-8 12-12 21-9c-5 7-13 10-21 9zM17 17c-8 3-12 12-9 21c7-5 10-13 9-21z" strokeWidth="1" />
          <path d="M46 10c6-5 15-4 18 2c2 5-3 9-7 6c-3-2-1-6 2-5M10 46c-5 6-4 15 2 18c5 2 9-3 6-7c-2-3-6-1-5 2" strokeWidth="1" />
        </g>
        <circle cx="17" cy="17" r="2.6" fill="currentColor" />
        <circle cx="76" cy="3" r="1.8" fill="currentColor" />
        <circle cx="3" cy="76" r="1.8" fill="currentColor" />
      </symbol>
      <symbol id="sch-diya" viewBox="0 0 48 30">
        <path d="M4 14c3 9 11 13 20 13s17-4 20-13c-6 2-13 3-20 3S10 16 4 14z" fill="currentColor" />
        <path d="M4 14c6 2 13 3 20 3s14-1 20-3" fill="none" stroke="#1a0a06" strokeOpacity=".35" strokeWidth="1" />
        <path d="M37 13.5c2.5-1 5-2.6 7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>
    </svg>
  )
}

// the printed card's double gold border with a flourish in each corner
const Edge = () => (
  <div className="sch-edge" aria-hidden="true">
    {['tl', 'tr', 'bl', 'br'].map((k) => <svg key={k} className={`sch-edge__c sch-edge__c--${k}`}><use href="#sch-corner" /></svg>)}
  </div>
)

const Deco = ({ at }) => (
  <div className="sch-deco" data-deco={at} aria-hidden="true"><img src={roses} alt="" loading="lazy" decoding="async" /></div>
)

const Head = ({ kicker, title }) => (
  <header className="sch-head">
    <p className="sch-head__kicker"><span>{kicker}</span></p>
    <h2 className="sch-head__title">{title}</h2>
    <svg className="sch-lotusline" aria-hidden="true"><use href="#sch-lotusline" /></svg>
  </header>
)

export function Events({ c, lang }) {
  const root = useRef(null)
  const minis = useRef([])
  useArches(root, [lang])

  // each frame's scenery plays while its card is on screen and rests when it leaves
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const s = minis.current.find((m) => m?.el === e.target)
      if (!s) return
      if (e.isIntersecting) s.enter()
      else s.exit()
    }), { root: reelOf(root.current), threshold: 0.3 })
    minis.current.forEach((m) => m && io.observe(m.el))
    return () => io.disconnect()
  }, [])

  // the cards are dealt toward you from deep behind, one after another, with the scroll
  useEffect(() => {
    if (still()) return
    const scroller = reelOf(root.current)
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.ev', root.current).forEach((ev, i) => {
        const k = i % 3
        gsap.fromTo(ev,
          { z: -760, rotateX: 38, y: 190, autoAlpha: 0, transformOrigin: '50% 100%' },
          { z: 0, rotateX: 0, y: 0, autoAlpha: 1, ease: 'power2.out',
            scrollTrigger: { trigger: ev.parentElement, scroller, start: `top ${102 - k * 5}%`, end: `top ${52 - k * 5}%`, scrub: 1 } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="sch sch-cream" id="ceremonies" ref={root}>
      <Defs />
      <Edge />
      <Deco at="tl" />
      <Deco at="tr" />
      <Head kicker={c.schedule.kicker} title={c.schedule.title} />
      <div className="sch-grid">
        {FRAMED.map((id, i) => {
          const e = c.events[id]
          const where = [e.time, e.venue[0]].filter(Boolean).join(' · ')
          return (
            <div className="ev-slot" key={id}>
              <article className="ev">
                <div className="sch-arch" data-arch data-lobes="2" data-spring=".46">
                  <div className="arch__inner">
                    <div className="ev__media">
                      <Scene scene={SCENES.find((s) => s.id === id)} lang={lang} mini ref={(r) => { minis.current[i] = r }} />
                    </div>
                    <div className="ev__body">
                      <h3 className="ev__title">{e.title}</h3>
                      <p className="ev__day">{e.day}</p>
                      <p className="ev__when">{e.date}</p>
                      {where && <p className="ev__where">{where}</p>}
                      <p className="ev__note">{e.tag}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function Timeline({ c, lang }) {
  const root = useRef(null)

  // the line runs down with the scroll and each diya lights as the line reaches it
  useEffect(() => {
    const items = gsap.utils.toArray('.tl__item', root.current)
    if (still()) { items.forEach((li) => li.classList.add('lit')); return }
    const scroller = reelOf(root.current)
    const tl = root.current.querySelector('.tl')
    // where an element sits in the reel, and the furthest the page can rest before the next screen snaps in:
    // the last diya has to be lit (and the line full) by then, even though it never reaches 62% of the screen
    const pos = (el) => el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
    const cap = () => pos(root.current) + root.current.offsetHeight - scroller.clientHeight - 2
    const line = (el) => pos(el) - scroller.clientHeight * 0.62
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: tl, scroller, start: () => line(tl), end: () => Math.min(line(tl) + tl.offsetHeight, cap()), scrub: true,
        onUpdate: (s) => tl.style.setProperty('--fill', s.progress.toFixed(3)),
      })
      const mm = gsap.matchMedia()
      items.forEach((li, i) => {
        ScrollTrigger.create({
          trigger: li, scroller, start: () => Math.min(line(li), cap() - 8 * (items.length - 1 - i)),
          onEnter: () => li.classList.add('lit'),
          onLeaveBack: () => li.classList.remove('lit'),
        })
        mm.add({ wide: '(min-width: 761px)', narrow: '(max-width: 760px)' }, (m) => {
          gsap.from(li.querySelector('.tl__card'), {
            autoAlpha: 0, x: m.conditions.wide ? (i % 2 ? -50 : 50) : 30, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: li, scroller, start: 'top 80%' },
          })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // a new language, a late font or a picture that arrives changes the heights, so every trigger measures again
  useEffect(() => {
    let t
    const again = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150) }
    const ro = new ResizeObserver(again)
    ro.observe(root.current)
    if (root.current.previousElementSibling) ro.observe(root.current.previousElementSibling)
    document.fonts?.ready.then(again)
    return () => { clearTimeout(t); ro.disconnect() }
  }, [lang])

  return (
    <section className="sch sch-maroon sch-night" id="before" ref={root}>
      <div className="sch-frieze" aria-hidden="true" />
      <Edge />
      <Deco at="bl" />
      <Deco at="br" />
      <div className="sch-strand sch-strand--l" aria-hidden="true" />
      <div className="sch-strand sch-strand--r" aria-hidden="true" />
      <Head kicker={c.schedule.beforeKicker} title={c.schedule.before} />
      <ol className="tl">
        <span className="tl__line" aria-hidden="true"><span className="tl__fill" /></span>
        {FRAMED.map((id) => {
          const e = c.events[id]
          return (
            <li className="tl__item" key={id}>
              <span className="tl__time">{[e.day, e.time].filter(Boolean).join(' · ')}</span>
              <span className="tl__node" aria-hidden="true">
                <span className="tl__glow" />
                <svg className="tl__diya"><use href="#sch-diya" /></svg>
                <span className="tl__flame" />
              </span>
              <div className="tl__card">
                <h3 className="foil">{e.title}</h3>
                <p className="tl__date">{e.date}</p>
                <p>{e.tag}</p>
                {e.venue.length > 0 && <p className="tl__venue">{e.venue.join(', ')}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
