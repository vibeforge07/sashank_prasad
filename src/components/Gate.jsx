import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { artUrl } from '../art/index.js'
import ring from '../opening/ring.webp'
import sindoor from '../opening/sindoor.webp'
import paper from '../opening/paper.webp'
import alpona from '../opening/alpona-gold.webp'
import { drive } from './drive.js'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The cover: a sindoor seal on cream paper, the first page of the scroll. Nothing to tap: the guest's own
// scroll (swipe, wheel or keys, components/drive.js) spreads the sindoor over the screen; scrolling on, the red
// page lifts away on a pair of carved doors, which then swing open on the invitation.
// The doors live outside the reel (a portal), so they can open over the next page.
export default function Gate({ c, lang, langs, names, setLang }) {
  const root = useRef(null)
  const way = useRef(null)
  const q = (s) => root.current.querySelector(s)

  useLayoutEffect(() => {
    if (still()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from('.g-garland', { yPercent: -100, duration: 1, ease: 'power3.out' }, 0)
      tl.from('.g-mala', { yPercent: -100, duration: 1.2, ease: 'power3.out', stagger: 0.1 }, 0.3)
      tl.from('.g-pais', { autoAlpha: 0, duration: 1.4 }, 0.4)
      if (q('.g-motif')) tl.from('.g-motif', { autoAlpha: 0, duration: 1.4 }, 0.5)
      tl.from('.g-flowers', { yPercent: 100, duration: 1, ease: 'power3.out' }, 1)
      tl.from('.g-disc', { scale: 0.25, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, 0.3)
      tl.from('.g-ring', { scale: 0.7, autoAlpha: 0, duration: 1.3, ease: 'power3.out' }, 0.75)
      tl.from('.g-title span', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.18, ease: 'power2.out' }, 1.1)
      tl.from('.g-bed-l', { xPercent: -110, duration: 1.3, ease: 'power3.out' }, 1.1)
      tl.from('.g-bed-r', { xPercent: 110, duration: 1.3, ease: 'power3.out' }, 1.25)
      gsap.to('.g-mala', { rotation: 1.2, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6, stagger: 0.7 })
      tl.from(['.g-ganesh', '.g-inv', '.g-names', '.g-date'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' }, 1.4)
      tl.from('.g-langs', { autoAlpha: 0, duration: 0.8 }, 2)
      tl.from('.g-alp', { autoAlpha: 0, duration: 1.6 }, 0.8)
      gsap.to('.g-alp img', { rotation: 360, duration: 80, ease: 'none', repeat: -1 })
      gsap.to('.g-ring', { rotation: 360, duration: 120, ease: 'none', repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [])

  // the opening, scrubbed by the guest's scroll: the sindoor spreads (a resting point once the screen is red),
  // then the red page lifts and shows the closed doors. At the end the reel moves on to the next page under
  // the doors, and they swing open on it by themselves.
  useLayoutEffect(() => {
    if (still()) return
    const el = root.current
    const doors = way.current
    const $ = (s) => el.querySelector(s)
    const $$ = (s) => [...el.querySelectorAll(s)]
    const flood = $('.g-flood')
    const cover = () => {
      const s = $('.g-seal').getBoundingClientRect()
      const cx = s.left + s.width / 2
      const cy = s.top + s.height / 2
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(innerWidth - cx, cy), Math.hypot(cx, innerHeight - cy), Math.hypot(innerWidth - cx, innerHeight - cy))
      return (far * 2.15) / flood.offsetWidth
    }
    const t = gsap.timeline({ paused: true })
      .to($('.g-langs'), { autoAlpha: 0, duration: 0.3 }, 0)
      .fromTo(flood, { scale: 1 }, { scale: cover, duration: 1.6, ease: 'power1.in', immediateRender: false }, 0.1)
      .to($('.g-garland'), { yPercent: -110, duration: 1, ease: 'power2.in' }, 0.2)
      .to($$('.g-mala'), { yPercent: -110, duration: 1, ease: 'power2.in' }, 0.2)
      .to($('.g-bed-l'), { xPercent: -120, duration: 1, ease: 'power2.in' }, 0.25)
      .to($('.g-bed-r'), { xPercent: 120, duration: 1, ease: 'power2.in' }, 0.25)
      .to($('.g-flowers'), { yPercent: 110, duration: 1, ease: 'power2.in' }, 0.25)
      .to($$('.g-alp'), { autoAlpha: 0, duration: 0.8 }, 0.2)
      .to($$('.g-names, .g-weds'), { color: '#f1cf7c', duration: 0.5 }, 0.8)
      .to($$('.g-inv, .g-date'), { color: '#fff1d6', duration: 0.5 }, 0.8)
      // the maroon Ganesh mark and the scroll word turn gold on the red
      .fromTo($('.g-ganesh'), { filter: 'brightness(1) sepia(0) saturate(1)' }, { filter: 'brightness(2.6) sepia(1) saturate(1.6)', duration: 0.5, immediateRender: false }, 0.8)
      .to(document.querySelectorAll('.scroll-mark'), { color: '#f6d38a', duration: 0.5 }, 0.8)
      .to($('.g-seal'), { scale: 1.08, duration: 1.6, ease: 'power1.inOut' }, 0.2)
      .addLabel('rest-red', 1.9)
      // the red page lifts away; the doors show from below as it goes
      .set(doors, { autoAlpha: 1 }, 2)
      .fromTo($('.g-page'), { yPercent: 0 }, { yPercent: -100, duration: 1.15, ease: 'power2.inOut', immediateRender: false }, 2)
      .fromTo(doors, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power2.inOut', immediateRender: false }, 2)
      .to({}, { duration: 0.1 })
    gsap.set(doors, { autoAlpha: 0 })

    let opening = null
    const sc = el.closest('.reel')
    const open = () => {
      // the reel steps on to the next page behind the closed doors, then they swing open on it
      const next = el.nextElementSibling
      if (next) sc.scrollTo({ top: next.offsetTop, behavior: 'instant' })
      opening = gsap.timeline({ onComplete: () => { gsap.set(doors, { autoAlpha: 0 }); gsap.set(doors.querySelectorAll('.g-door'), { rotationY: 0 }); t.progress(0); opening = null } })
        .to(doors.querySelector('.g-door-l'), { rotationY: -104, duration: 1.5, ease: 'power2.inOut' }, 0.15)
        .to(doors.querySelector('.g-door-r'), { rotationY: 104, duration: 1.5, ease: 'power2.inOut' }, 0.15)
        .fromTo(doors.querySelector('.g-light'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.2)
        .to(doors, { autoAlpha: 0, duration: 0.4 }, 1.5)
    }
    t.eventCallback('onUpdate', () => {
      if (t.progress() > 0.999 && !opening) { gsap.killTweensOf(t); open() }
    })
    const d = drive(t, el)
    return () => { d.off(); opening?.kill(); t.kill(); gsap.set(doors, { clearProps: 'all' }) }
  }, [])

  return (
    <section className="gate" id="cover" ref={root}>
      {createPortal(
        <div className="g-doorway" ref={way} aria-hidden="true">
          <div className="g-doors">
            <div className="g-light" />
            <div className="g-door g-door-l"><i className="g-panel" /><i className="g-panel" /><b className="g-knock" /></div>
            <div className="g-door g-door-r"><i className="g-panel" /><i className="g-panel" /><b className="g-knock" /></div>
          </div>
        </div>,
        document.body,
      )}

      <div className="g-page" style={{ backgroundImage: `url(${paper})` }}>
        <img className="g-pais g-pais-l" src={artUrl('gate-paisley')} alt="" />
        <img className="g-pais g-pais-r" src={artUrl('gate-paisley')} alt="" />
        {artUrl('gate-motif-low') && <>
          <img className="g-motif g-motif-l" src={artUrl('gate-motif-low')} alt="" />
          <img className="g-motif g-motif-r" src={artUrl('gate-motif-low')} alt="" />
        </>}
        {/* a strand as long as it needs to be: repeating marigolds down to the last flowers and the bell */}
        {['l', 'r'].flatMap((s) => [1, 2, 3, 4, 5, 6].map((n) => <span key={s + n} className={`g-mala g-mala-${s} g-m${n}`}><i style={{ backgroundImage: `url(${artUrl('gate-mala-beads')})` }} /><img src={artUrl('gate-mala-end')} alt="" /></span>))}
        <div className="g-garland" style={{ backgroundImage: `url(${artUrl('gate-toran')})` }} />
        <div className="g-flowers" style={{ backgroundImage: `url(${artUrl('gate-flowers')})` }} />
        <img className="g-bed g-bed-l" src={artUrl('gate-elephant')} alt="" />
        <img className="g-bed g-bed-r" src={artUrl('gate-thali')} alt="" />
        {/* half an alpona peeping in from each side, turning slowly */}
        <div className="g-alp g-alp-l" aria-hidden="true"><img src={alpona} alt="" /></div>
        <div className="g-alp g-alp-r" aria-hidden="true"><img src={alpona} alt="" /></div>

        <div className="g-inner">
          {/* the Ganesh mark of a wedding card, above the blessing line */}
          {artUrl('gate-ganesh-logo') && <img className="g-ganesh" src={artUrl('gate-ganesh-logo')} alt="" />}
          <p className="g-inv">{c.hero.invocation}</p>
          <div className="g-seal">
            <span className="g-flood" />
            <img className="g-ring" src={ring} alt="" />
            <img className="g-disc" src={sindoor} alt="" />
            <span className="g-title" lang={lang}>{c.gate.seal.map((w) => <span key={w}>{w}</span>)}</span>
          </div>
          <h1 className="g-names">{names.map((n, i) => <span key={i} className={i === 1 ? 'g-weds' : undefined}>{n}</span>)}</h1>
          <p className="g-date">{c.gate.date}</p>
          <div className="g-langs" role="group" aria-label={c.gate.choose}>
            {langs.map(([l, label]) => <button key={l} lang={l} aria-pressed={l === lang} onClick={() => setLang(l)}>{label}</button>)}
          </div>
        </div>
      </div>
    </section>
  )
}
