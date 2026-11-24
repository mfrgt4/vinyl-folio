import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VINYLS } from '../data'

export default function Records() {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const n = VINYLS.length
  const lock = useRef(false)
  const touchX = useRef(0)
  const go = (d: number) => setI(x => Math.min(n - 1, Math.max(0, x + d)))

  // Bloque le défilement de la page tant qu'on est sur "Mes Musiques"
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Flèches du clavier
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])

  // Molette / trackpad (horizontal ou vertical) : un cran à la fois
  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (lock.current || Math.abs(d) < 30) return
    lock.current = true
    go(Math.sign(d))
    setTimeout(() => (lock.current = false), 450)
  }

  const cur = VINYLS[i]
  return (
    <div
      className="page"
      onWheel={onWheel}
      onTouchStart={e => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      style={{
        height: '100dvh',
        minHeight: 0,
        overflow: 'hidden',
        padding: '90px 4vw 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <p className="mono">02 — Collection</p>

      {/* La scène prend tout l'espace restant ; les vinyles sont centrés dedans */}
      <div className="stage" style={{ flex: 1, minHeight: 0, height: 'auto', marginTop: 0 }}>
        {VINYLS.map((v, k) => {
          const o = k - i
          return (
            <motion.div
              key={v.id}
              className="rec"
              role="button"
              tabIndex={0}
              aria-label={v.title}
              onClick={() => (o === 0 ? setOpen(true) : setI(k))}
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
              <div className="disc" />
              <div
                className="cover"
                style={{
                  backgroundColor: v.color,
                  backgroundImage: v.cover ? `url("${v.cover}")` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
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
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
        <button className="mono" onClick={() => go(-1)}>← Préc.</button>
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