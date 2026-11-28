import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { artUrl } from '../art/index.js'
import ring from '../opening/ring.webp'
import sindoor from '../opening/sindoor.webp'
import paper from '../opening/paper.webp'
import alpona from '../opening/alpona-gold.webp'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The cover: a sindoor seal on cream paper, the first page of the scroll. Nothing to tap: the guest picks a
// language if they like and scrolls on into the invitation.
export default function Gate({ c, lang, langs, names, setLang }) {
  const root = useRef(null)
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

  return (
    <section className="gate" id="cover" ref={root}>

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
