import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLS } from '../hooks'
import { Song } from '../data'
const Vinyl3D = lazy(() => import('../three/Vinyl3D'))

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const BARS = 72

function waveform(id: string) {
  let h = 7
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return Array.from({ length: BARS }, (_, i) => {
    h = (h * 1664525 + 1013904223) >>> 0
    const r = ((h >>> 8) % 100) / 100
    return 0.18 + 0.82 * Math.abs(Math.sin(i * 0.28 + r * 2)) * (0.45 + 0.55 * r)
  })
}

function Eq({ on }: { on: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 14, width: 13 }}>
      {[0, 1, 2].map(k => (
        <motion.i
          key={k}
          style={{ width: 3, background: 'var(--red)', display: 'block', height: '30%' }}
          animate={{ height: on ? ['30%', '100%', '45%', '85%', '30%'] : '30%' }}
          transition={on ? { duration: 1 + k * 0.25, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
        />
      ))}
    </span>
  )
}

function Wave({ id, progress, onSeek }: { id: string; progress: number; onSeek: (r: number) => void }) {
  const bars = useMemo(() => waveform(id), [id])
  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
  }
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="slider"
      tabIndex={0}
      aria-label="Position dans le morceau"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); seek(e) }}
      onPointerMove={e => { if (e.buttons === 1) seek(e) }}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.03))
        if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.03))
      }}
      style={{ display: 'flex', alignItems: 'center', gap: 2, height: 52, cursor: 'pointer', touchAction: 'none' }}
    >
      {bars.map((h, k) => (
        <span
          key={k}
          style={{
            flex: 1,
            height: `${h * 100}%`,
            borderRadius: 1,
            background: k / BARS < progress ? 'var(--red)' : 'var(--line)',
            transition: 'background .25s',
          }}
        />
      ))}
    </motion.div>
  )
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d={d} /></svg>
)
const PREV = 'M6 6h2v12H6zM20 6v12L9.5 12z'
const NEXT = 'M16 6h2v12h-2zM4 6l10.5 6L4 18z'
const PLAY = 'M8 5v14l11-7z'
const PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z'

export default function Songs() {
  const [saved] = useLS<Song[]>('vf-songs', [])
  const list: Song[] = useMemo(
    () => [...(saved ?? [])].sort((a, b) => (b.date ?? 0) - (a.date ?? 0)),
    [saved]
  )
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [allOpen, setAllOpen] = useState(false)
  const [query, setQuery] = useState('')
  const a = useRef<HTMLAudioElement>(null)

  // On sécurise l'index : jamais hors de la liste
  const safeI = list.length ? Math.min(i, list.length - 1) : 0
  const cur: Song | undefined = list[safeI]
  const progress = dur ? Math.min(1, t / dur) : 0

  const last4 = list.slice(0, 4)

  const filtered = list.filter(s =>
    (s.title + ' ' + s.artist).toLowerCase().includes(query.toLowerCase())
  )
  const chooseFromAll = (id: string) => {
    const k = list.findIndex(s => s.id === id)
    if (k >= 0) { setI(k); setPlaying(true) }
    setAllOpen(false)
    setQuery('')
  }

  useEffect(() => { setT(0); setDur(0) }, [safeI])
  useEffect(() => {
    const el = a.current
    if (!el) return
    if (playing && cur?.src) el.play().catch(() => setPlaying(false))
    else el.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, safeI, cur?.src])

  const go = (d: number) => {
    if (!list.length) return
    setI((prev) => (prev + d + list.length) % list.length)
    setPlaying(true)
  }
  const seek = (r: number) => { if (a.current && dur) a.current.currentTime = r * dur }

  if (!list.length || !cur) {
    return (
      <div className="page">
        <h1 style={{ fontSize: 'clamp(40px,7vw,104px)' }}>VOS<br />CHANSONS</h1>
        <p className="mono" style={{ margin: '24px 0' }}>Aucune proposition pour l'instant.</p>
        <p style={{ opacity: .7, marginBottom: 24 }}>Sois la première à proposer une musique, elle apparaîtra ici.</p>
        <Link className="btn" to="/ajouter">Proposer une chanson</Link>
      </div>
    )
  }

  return (
    <div className="page" style={{ overflow: 'hidden' }}>
      <style>{`
        .vw{position:relative;width:calc(100% + 18vw);margin-left:-18vw;aspect-ratio:1;cursor:pointer}
        @media(max-width:860px){.vw{width:calc(100% + 10vw);margin-left:-10vw}}
        .pl-btn{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;transition:color .3s,transform .3s}
        .pl-btn:hover{color:var(--red);transform:scale(1.12)}
        .pl-play{width:64px;height:64px;background:var(--ink);color:var(--paper);transition:background .35s}
        .pl-play:hover{background:var(--red);color:#fff}
      `}</style>

      <div className="split" style={{ alignItems: 'center' }}>
        <div className="vw" onClick={() => setPlaying(!playing)} role="button" aria-label={playing ? 'Pause' : 'Lecture'}>
          <Suspense fallback={null}>
            <Vinyl3D playing={playing} kick={safeI} color={cur.color} title={cur.title} num={safeI + 1} progress={progress} cover={cur.cover} />
          </Suspense>
        </div>

        <div>
          <h1 style={{ fontSize: 'clamp(40px,7vw,104px)' }}>VOS<br />CHANSONS</h1>

          <div style={{ margin: '28px 0 8px' }}>
            <p className="mono" style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eq on={playing} /> {playing ? 'En lecture' : 'En pause'} · {String(safeI + 1).padStart(2, '0')}/{String(list.length).padStart(2, '0')}
            </p>
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div style={{ font: '700 clamp(24px,3vw,40px)/1.1 Archivo, sans-serif', letterSpacing: '-.02em', margin: '8px 0 4px' }}>{cur.title}</div>
                <p className="mono">{cur.artist}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <audio ref={a} src={cur.src} onTimeUpdate={e => setT(e.currentTarget.currentTime)} onLoadedMetadata={e => setDur(e.currentTarget.duration)} onEnded={() => go(1)} />

          <Wave id={cur.id} progress={progress} onSeek={seek} />
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 14px' }}>
            <span>{fmt(t)}</span><span>{dur ? fmt(dur) : cur.dur}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="pl-btn" aria-label="Précédent" onClick={() => go(-1)}><Icon d={PREV} /></button>
            <motion.button
              className="pl-btn pl-play"
              aria-label={playing ? 'Pause' : 'Lecture'}
              whileTap={{ scale: 0.94 }}
              onClick={() => setPlaying(!playing)}
            >
              <Icon d={playing ? PAUSE : PLAY} />
            </motion.button>
            <button className="pl-btn" aria-label="Suivant" onClick={() => go(1)}><Icon d={NEXT} /></button>
            {cur.link && <a className="mono" style={{ marginLeft: 'auto' }} href={cur.link} target="_blank" rel="noreferrer">Écouter sur la plateforme ↗</a>}
          </div>

          <p className="mono" style={{ color: 'var(--red)', margin: '36px 0 4px' }}>Les 4 dernières</p>
          {last4.map((s) => {
            const k = list.findIndex(x => x.id === s.id)
            return (
              <button key={s.id} className={'track' + (k === safeI ? ' on' : '')} onClick={() => { setI(k); setPlaying(true) }}>
                {k === safeI && <motion.span layoutId="act" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--red)' }} />}
                <span className="mono">{k === safeI ? <Eq on={playing} /> : String(k + 1).padStart(2, '0')}</span>
                <div className="sq" style={{ backgroundColor: s.color, backgroundImage: s.cover ? `url("${s.cover}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <span>
                  <b style={{ fontWeight: 500 }}>{s.title}</b><br />
                  <span className="mono">{s.artist}{s.status === 'pending' ? ' · en validation' : ''}</span>
                </span>
                <span className="mono">{s.dur}</span>
              </button>
            )
          })}

          <button className="btn" style={{ marginTop: 24, width: '100%' }} onClick={() => setAllOpen(true)}>
            Afficher toutes les propositions ({list.length})
          </button>

          <Link className="btn" style={{ marginTop: 12 }} to="/ajouter">Proposer une chanson</Link>
        </div>
      </div>

      <AnimatePresence>
        {allOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAllOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(23,23,23,.25)', display: 'grid', placeItems: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 520, maxHeight: '80dvh', overflow: 'auto', background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--ink)', padding: '28px 28px 12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="mono" style={{ margin: 0 }}>Toutes les propositions</p>
                <button className="mono" onClick={() => setAllOpen(false)} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>Fermer</button>
              </div>

              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Titre ou artiste…"
                style={{ width: '100%', margin: '20px 0 8px', padding: '10px 0', background: 'none', border: 0, borderBottom: '1px solid var(--ink)', color: 'var(--ink)', font: '300 18px Inter', outline: 0 }}
              />

              {filtered.length === 0 && <p className="mono" style={{ padding: '16px 0' }}>Aucune proposition pour l'instant.</p>}

              {filtered.map((s, k) => (
                <button
                  key={s.id}
                  onClick={() => chooseFromAll(s.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'baseline', gap: 16, padding: '16px 0', background: 'none', border: 0, borderBottom: '1px solid #d8d7d2', color: 'var(--ink)', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span className="mono" style={{ opacity: .5 }}>{String(k + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 17 }}>{s.title}</span>
                    <span className="mono" style={{ opacity: .6 }}>{s.artist} {s.by ? `· par ${s.by}` : ''} · en validation</span>
                  </span>
                  <span className="mono">→</span>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}