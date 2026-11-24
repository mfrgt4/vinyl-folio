import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VINYLS } from '../data'

export default function Records() {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const n = VINYLS.length
  const lock = useRef(false)
  const touchX = useRef(0)
  const a = useRef<HTMLAudioElement>(null)
  const go = (d: number) => setI(x => Math.min(n - 1, Math.max(0, x + d)))
  const cur = VINYLS[i]

  // Bloque le défilement de la page tant qu'on est sur "Mes Musiques"
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Quand on change de vinyle, la musique s'arrête
  useEffect(() => { a.current?.pause(); setPlaying(false) }, [i])

  // Flèches du clavier
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])

  // Molette / trackpad : un cran à la fois
  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (lock.current || Math.abs(d) < 30) return
    lock.current = true
    go(Math.sign(d))
    setTimeout(() => (lock.current = false), 450)
  }

  // Lecture / pause de la musique du vinyle sélectionné
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
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      style={{ height: '100dvh', minHeight: 0, overflow: 'hidden', padding: '90px 4vw 24px', display: 'flex', flexDirection: 'column' }}
    >
      <audio ref={a} src={cur.audio} onEnded={() => setPlaying(false)} />
      <p className="mono">02 — Collection</p>

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
              style={{ top: '50%', marginTop: -120 }}
              animate={{
                x: o * 190 + Math.sign(o) * 70,
                scale: o === 0 ? 1.25 : 0.8,
                rotateY: o * -32,
                zIndex: 10 - Math.abs(o),
                opacity: Math.abs(o) > 3 ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              {/* Pendant la lecture : le disque sort de la pochette et tourne */}
              <div
                className="disc"
                style={{
                  translate: spinning ? '30% 0' : undefined,
                  transition: 'translate .8s cubic-bezier(.2,.8,.2,1)',
                  animation: spinning ? 'spin 3s linear infinite' : undefined,
                }}
              />
              <div
                className="cover"
                style={{
                  backgroundColor: v.color,
                  backgroundImage: v.cover ? `url("${v.cover}")` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: spinning ? 'translateX(-14%)' : undefined,
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
        <motion.div key={cur.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vh, 48px)' }}>{cur.title}</h2>
          <p className="mono" style={{ color: 'var(--red)' }}>{cur.cat} / {cur.year}</p>
          <p className="mono" style={{ marginTop: 6 }}>
            {cur.audio ? (playing ? '❚❚ En lecture — cliquer la pochette pour mettre en pause' : '▶ Cliquer la pochette pour écouter') : 'Pas de fichier audio'}
          </p>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
        <button className="mono" onClick={() => go(-1)}>← Préc.</button>
        <button className="mono" onClick={() => setOpen(true)}>Détails</button>
        <button className="mono" onClick={() => go(1)}>Suiv. →</button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#171717ee', color: 'var(--paper)', display: 'grid', placeItems: 'center', padding: 24 }}
          >
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} style={{ maxWidth: 560, maxHeight: '90dvh', overflow: 'auto' }}>
              <p className="mono">{cur.cat} — {cur.year}</p>
              <h2>{cur.title}</h2>
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