import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VINYLS } from '../data'

/**
 * Disque : 3 états enchaînés de façon fluide
 *  - repos   : caché derrière la pochette
 *  - survol  : sort un peu (20 %), sans tourner
 *  - lecture : sort complètement (42 %) et tourne, avec accélération / ralentissement progressifs
 */
function Disc({ spinning, hover, color }: { spinning: boolean; hover: boolean; color: string }) {
  const el = useRef<HTMLDivElement>(null)
  const s = useRef({ a: 0, v: 0 })       // angle (deg) et vitesse (deg/s)
  const target = useRef(0)
  target.current = spinning ? 110 : 0

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      s.current.v += (target.current - s.current.v) * Math.min(1, dt * 2.2) // inertie
      s.current.a = (s.current.a + s.current.v * dt) % 360
      if (el.current) el.current.style.transform = `rotate(${s.current.a}deg)`
      if (target.current === 0 && s.current.v < 0.3) return // arrêt de la boucle
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spinning])

  const x = spinning ? 42 : hover ? 20 : 0
  return (
    <div
      style={{
        position: 'absolute',
        inset: '4%',
        transform: `translateX(${x}%)`,
        // même courbe pour survol -> lecture : le passage d'un état à l'autre est continu
        transition: 'transform .9s cubic-bezier(.22,1,.36,1)',
      }}
    >
      <div
        ref={el}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          background:
            'conic-gradient(from 0deg, transparent 0 18%, rgba(255,255,255,.14) 24%, transparent 30% 68%, rgba(255,255,255,.1) 74%, transparent 80%), repeating-radial-gradient(#111 0 2px, #1b1b1b 3px 4px)',
          boxShadow: '0 10px 24px -12px #000a',
        }}
      >
        {/* MILIEU DU VINYLE = couleur du vinyle, pas du rose en dur */}
        <div style={{ position: 'absolute', inset: '36%', borderRadius: '50%', background: color }}>
          <div style={{ position: 'absolute', top: '10%', left: '46%', width: '8%', height: '8%', borderRadius: '50%', background: '#E8E7E2' }} />
        </div>
      </div>
    </div>
  )
}

export default function Records() {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const n = VINYLS.length
  const lock = useRef(false)
  const touchX = useRef(0)
  const a = useRef<HTMLAudioElement>(null)
  const go = (d: number) => setI(x => Math.min(n - 1, Math.max(0, x + d)))
  const cur = VINYLS[i]

  // Recherche : filtre sur titre + artiste
  const results = VINYLS.filter(v =>
    (v.title + ' ' + v.cat).toLowerCase().includes(query.toLowerCase())
  )
  const choose = (id: string) => {
    const k = VINYLS.findIndex(v => v.id === id)
    if (k >= 0) setI(k)
    setSearchOpen(false)
    setQuery('')
  }

  // Bloque le défilement de la page tant qu'on est sur "Mes Musiques"
  useEffect(() => {
    const b = document.body.style.overflow, h = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => { document.body.style.overflow = b; document.documentElement.style.overflow = h }
  }, [])

  // Changement de vinyle : la musique s'arrête et le disque rentre dans sa pochette
  useEffect(() => { a.current?.pause(); setPlaying(false) }, [i])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setOpen(false); return }
      // RECHERCHE OUVERTE : les flèches ne changent plus les vinyles derrière
      if (searchOpen || open) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [searchOpen, open])

  const onWheel = (e: React.WheelEvent) => {
    // RECHERCHE OUVERTE : on ne change plus de vinyle derrière
    if (searchOpen || open) return
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (lock.current || Math.abs(d) < 30) return
    lock.current = true
    go(Math.sign(d))
    setTimeout(() => (lock.current = false), 450)
  }

  const toggle = () => {
    const el = a.current
    if (!el || !cur.audio) { setOpen(true); return } // pas d'audio => on ouvre la fiche
    if (playing) { el.pause(); setPlaying(false) }
    else el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  return (
    <div
      className="page"
      onWheel={onWheel}
      onTouchStart={e => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        // RECHERCHE OUVERTE : le swipe ne change plus les vinyles derrière
        if (searchOpen || open) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      style={{ height: '100dvh', minHeight: 0, overflow: 'hidden', padding: '90px 4vw 24px', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      <audio ref={a} src={cur.audio} onEnded={() => setPlaying(false)} />

      {/* BOUTON RECHERCHE SOBRE - texte seul, pas de SVG, pas d'emoji */}
      <button
        className="mono"
        onClick={() => setSearchOpen(true)}
        aria-label="Rechercher une musique"
        style={{ position: 'absolute', top: 96, left: '4vw', zIndex: 20, background: 'none', border: 0, cursor: 'pointer', opacity: .7, padding: 0}}
      >
        Rechercher ⌕
      </button>

      <div className="stage" style={{ flex: 1, minHeight: 0, height: 'auto', marginTop: 0 }}>
        {VINYLS.map((v, k) => {
          const o = k - i
          const spinning = o === 0 && playing
          return (
            <motion.div
              key={v.id}
              className="rec"
              role="button"
              tabIndex={0}
              aria-label={o === 0 ? (playing ? `Pause ${v.title}` : `Lire ${v.title}`) : v.title}
              onClick={() => (o === 0 ? toggle() : setI(k))}
              onKeyDown={e => e.key === 'Enter' && (o === 0 ? toggle() : setI(k))}
              onMouseEnter={() => setHoverId(v.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{ top: '50%', marginTop: -120 }}
              animate={{
                x: o * 190 + Math.sign(o) * 70 + (playing && o > 0 ? 60 : 0),
                scale: o === 0 ? 1.25 : 0.8,
                rotateY: o * -32,
                zIndex: 10 - Math.abs(o),
                opacity: Math.abs(o) > 3 ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <Disc spinning={spinning} hover={hoverId === v.id} color={v.color} />
              <div
                className="cover"
                style={{
                  backgroundColor: v.color,
                  backgroundImage: v.cover ? `url("${v.cover}")` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: 'none', // la pochette ne bouge pas
                }}
              >
                {!v.cover && (
                  <span className="mono" style={{ color: '#fff', padding: 12, display: 'block' }}>
                    {String(k + 1).padStart(2, '0')}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={cur.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vh, 48px)', margin: 0 }}>{cur.title}</h2>
          <p className="mono" style={{ color: 'var(--pink)', margin: 0 }}>{cur.cat} / {cur.year}</p>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
        <button className="mono" onClick={() => go(-1)}>← Préc.</button>
        <button className="mono" onClick={() => setOpen(true)}>Détails</button>
        <button className="mono" onClick={() => go(1)}>Suiv. →</button>
      </div>

      {/* MENU RECHERCHE SOBRE - fond clair, lignes fines */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            // LE SCROLL DANS LA RECHERCHE NE TRAVERSE PLUS VERS LES VINYLES
            onWheel={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(23,23,23,.25)', display: 'grid', placeItems: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              onWheel={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 520, maxHeight: '80dvh', overflow: 'auto', background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--ink)', padding: '28px 28px 12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="mono" style={{ margin: 0 }}>Rechercher</p>
                <button className="mono" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>Fermer</button>
              </div>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Titre ou artiste…"
                style={{ width: '100%', margin: '20px 0 8px', padding: '10px 0', background: 'none', border: 0, borderBottom: '1px solid var(--ink)', color: 'var(--ink)', font: '300 18px Inter', outline: 0 }}
              />
              {results.length === 0 && <p className="mono" style={{ padding: '16px 0' }}>Aucun résultat.</p>}
              {results.map((v, k) => (
                <button
                  key={v.id}
                  onClick={() => choose(v.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'baseline', gap: 16, padding: '16px 0', background: 'none', border: 0, borderBottom: '1px solid #d8d7d2', color: 'var(--ink)', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span className="mono" style={{ opacity: .5 }}>{String(k + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 17 }}>{v.title}</span>
                    <span className="mono" style={{ opacity: .6 }}>{v.cat} — {v.year}</span>
                  </span>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#171717ee', color: 'var(--paper)', display: 'grid', placeItems: 'center', padding: 24 }}
          >
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} style={{ maxWidth: 560, maxHeight: '90dvh', overflow: 'auto' }}>
              <p className="mono" style={{ margin: '0 0 14px' }}>{cur.cat} — {cur.year}</p>
              <h2 style={{ margin: 0 }}>{cur.title}</h2>
              <p style={{ margin: '20px 0' }}>{cur.desc}</p>
              <p className="mono">Genres : {cur.tools.join(' · ')}</p>
              <p className="mono" style={{ marginTop: 24 }}>Cliquer pour fermer</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}