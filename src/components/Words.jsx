import { useEffect, useState } from 'react'
import { EVENTS, WEDDING_AT, mapUrl } from '../content/events.js'
import { SHLOKAS } from '../content/shlokas.js'

// phone number and home addresses live outside git, see .gitignore
const contact = Object.values(import.meta.glob('../content/contact.js', { eager: true }))[0]?.CONTACT

const Shloka = ({ id, t }) => SHLOKAS[id]
  ? <p className="shloka" lang="sa" data-t={t}>{SHLOKAS[id].map((l) => <span key={l}>{l}</span>)}</p>
  : null

export function Hero({ c }) {
  return <>
    <p className="invocation" data-t="0">{c.hero.invocation}</p>
    <Shloka id="hero" t="0.9" />
    <h1 className="name" data-t="2">{c.hero.groom}</h1>
    <p className="amp" data-t="3.4">{c.hero.and}</p>
    <h1 className="name" data-t="4">{c.hero.bride}</h1>
  </>
}

export function Family({ c }) {
  const f = c.family
  const block = (rows, t) => rows.map(([k, v], i) => (
    <p className="kin" key={k} data-t={t + i}><em>{k}</em><span>{v}</span></p>
  ))
  return <>
    <Shloka id="family" t="0" />
    <p className="request" data-t="0.8">{f.request.map((l) => <span key={l}>{l}</span>)}</p>
    <h2 className="name sm" data-t="2">{f.groom}</h2>
    {block(f.groomLines, 3)}
    <p className="and" data-t="5">{f.and}</p>
    <h2 className="name sm" data-t="5.6">{f.bride}</h2>
    {block(f.brideLines, 6.6)}
  </>
}

export function EventWords({ c, id }) {
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
    {meta.map && <a className="pill" data-t="5.4" href={mapUrl(meta.map)} target="_blank" rel="noreferrer">{c.map}</a>}
    <Shloka id={id} t="6" />
  </>
}

function Countdown({ c, lang }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i) }, [])
  const left = Math.max(0, WEDDING_AT - now)
  if (!left) return null
  const n = [left / 864e5, (left / 36e5) % 24, (left / 6e4) % 60].map(Math.floor)
  const f = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-IN')
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
      <p className="kin" data-t="4.2"><em>{k.rsvp}</em><a href={`tel:${contact.phone.replace(/-/g, '')}`}>{k.call} {contact.phone}</a></p>
      {contact.homes[lang].map((h, i) => <p className="kin home" key={h} data-t={4.8 + i * 0.5}><em>{k.homes[i]}</em><span>{h}</span></p>)}
    </>}
    <Shloka id="closing" t="6" />
  </>
}
