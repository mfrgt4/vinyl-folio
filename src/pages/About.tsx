import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
const Booklet = lazy(() => import('../three/Booklet'))

export default function About() {
  const [open, setOpen] = useState(false)
  const lines = [
    'TRACK 01 — Présentation',
    'Manon, 20 ans, créative et passionnée de musique.',
    'TRACK 02 — Vision',
    'Faire de la musique un lieu de rencontre, pas juste un fond sonore.',
  ]

  useEffect(() => {
    const b = document.body.style.overflow, h = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => { document.body.style.overflow = b; document.documentElement.style.overflow = h }
  }, [])

  return (
    <div
      className="page"
      style={{ height: '100dvh', minHeight: 0, overflow: 'hidden', padding: '80px 2vw 16px', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label={open ? 'Fermer le livret' : 'Ouvrir le livret'}
          onClick={() => setOpen(!open)}
          onKeyDown={e => e.key === 'Enter' && setOpen(!open)}
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            width: 'min(1400px, 98%, calc((100dvh - 160px) * 16 / 9))',
            cursor: 'pointer',
          }}
        >
          <Suspense fallback={null}>
            <div style={{ position: 'absolute', inset: 0 }}><Booklet open={open} /></div>
          </Suspense>

          <motion.div
            initial={false}
            animate={{
              opacity: open ? 1 : 0,
              y: open ? [0, -5, 0, 5, 0] : 0,
              rotate: open ? [0, 0.3, 0, -0.3, 0] : 0,
            }}
            transition={{
              opacity: { delay: open ? 0.7 : 0, duration: 0.6 },
              y: open ? { duration: 5.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
              rotate: open ? { duration: 6.9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
            }}
            className="about-overlay"
            style={{ position: 'absolute', left: '24.5%', top: '20.5%', width: '51%', height: '59%', display: 'grid', gridTemplateColumns: '1fr 1fr', pointerEvents: 'none', overflow: 'hidden' }}
          >
            <motion.div
              animate={{ scale: open ? 1.04 : 1 }}
              transition={{ duration: 6 }}
              style={{ position: 'relative', overflow: 'hidden', background: '#111' }}
            >
              <img
                src="/images/portrait.jpg"
                alt="Portrait"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.15)' }}
              />
            </motion.div>
            <div className="about-text" style={{ background: '#171717', color: '#ddd', padding: '8%', fontSize: 'clamp(11px,1.4vw,17px)', lineHeight: 1.6 }}>
              {lines.map((l, k) => (
                <motion.p
                  key={k}
                  className={k % 2 ? '' : 'mono'}
                  initial={false}
                  animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10 }}
                  transition={{ delay: 1 + k * 0.2 }}
                  style={{ marginBottom: 14 }}
                >
                  {l}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="mono" style={{ textAlign: 'center', marginTop: 12 }}>
          {open ? 'Cliquer pour refermer' : 'Cliquer pour ouvrir le livret'}
        </p>
      </div>
    </div>
  )
}