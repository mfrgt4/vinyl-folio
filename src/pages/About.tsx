import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
const Booklet = lazy(() => import('../three/Booklet'))

export default function About() {
  const [open, setOpen] = useState(false)
  const lines = [
    'TRACK 01 — Présentation',
    'Étudiant en design, passionné de musique et de typographie.',
    'TRACK 02 — Vision',
    'Créer des objets numériques qui se touchent comme des disques.',
  ]

  // Pas de défilement vertical sur cette page
  useEffect(() => {
    const b = document.body.style.overflow, h = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => { document.body.style.overflow = b; document.documentElement.style.overflow = h }
  }, [])

  return (
    <div
      className="page"
      style={{ height: '100dvh', minHeight: 0, overflow: 'hidden', padding: '70px 0 8px', display: 'flex', flexDirection: 'column' }}
    >
      <p className="mono" style={{ paddingLeft: '2vw' }}>03 — À propos</p>

      {/* Zone centrée : le livret s'adapte à la hauteur de l'écran pour tout tenir sans scroll */}
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
            // JOURNAL ENCORE PLUS GRAND : 1800px, 100% de largeur, presque toute la hauteur
            width: 'min(1800px, 100%, calc((100dvh - 110px) * 16 / 9))',
            cursor: 'pointer',
          }}
        >
          <Suspense fallback={null}>
            <div style={{ position: 'absolute', inset: 0 }}><Booklet open={open} /></div>
          </Suspense>

          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ delay: open ? 0.7 : 0, duration: 0.6 }}
            style={{ position: 'absolute', left: '24.5%', top: '20.5%', width: '51%', height: '59%', display: 'grid', gridTemplateColumns: '1fr 1fr', pointerEvents: 'none', overflow: 'hidden' }}
          >
            {/* IMAGE À GAUCHE */}
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
            <div style={{ background: '#171717', color: '#ddd', padding: '8%', fontSize: 'clamp(13px,1.6vw,20px)', lineHeight: 1.6 }}>
              {lines.map((l, k) => (
                <motion.p
                  key={k}
                  className={k % 2 ? '' : 'mono'}
                  initial={false}
                  animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10 }}
                  transition={{ delay: 1 + k * 0.2 }}
                  style={{ marginBottom: 16 }}
                >
                  {l}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="mono" style={{ textAlign: 'center', marginTop: 8 }}>
          {open ? 'Cliquer pour refermer' : 'Cliquer pour ouvrir le livret'}
        </p>
      </div>
    </div>
  )
}