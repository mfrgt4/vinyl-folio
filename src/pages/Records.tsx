import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VINYLS } from '../data'

export default function Records() {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const n = VINYLS.length
  const go = (d: number) => setI(x => Math.min(n - 1, Math.max(0, x + d)))

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])

  const cur = VINYLS[i]
  return (
    <div className="page" onWheel={e => Math.abs(e.deltaX) > 30 && go(Math.sign(e.deltaX))}>
      <p className="mono">02 — Collection</p>
      <div className="stage">
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
              animate={{
                x: o * 190 + Math.sign(o) * 70,
                scale: o === 0 ? 1.35 : 0.8,
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
          <h2 style={{ fontSize: 48 }}>{cur.title}</h2>
          <p className="mono" style={{ color: 'var(--red)' }}>{cur.cat} / {cur.year}</p>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
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
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} style={{ maxWidth: 560 }}>
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