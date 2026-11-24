import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLS } from '../hooks'
import { SONGS, Song } from '../data'
const Vinyl3D = lazy(() => import('../three/Vinyl3D'))
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function Songs() {
  const [saved] = useLS<Song[]>('vf-songs', [])
  const list = [...SONGS, ...saved] // propositions visibles en démo, marquées "en validation"
  const [i, setI] = useState(0); const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0); const [dur, setDur] = useState(0)
  const a = useRef<HTMLAudioElement>(null); const cur = list[i]
  const progress = dur ? Math.min(1, t / dur) : 0
  useEffect(() => { setT(0); setDur(0) }, [i])
  useEffect(() => { const el = a.current; if (!el) return; if (playing && cur.src) el.play().catch(() => setPlaying(false)); else el.pause() }, [playing, i])
  const go = (d: number) => { setI((i + d + list.length) % list.length); setPlaying(true) }
  return (
    <div className="page" style={{ overflow: 'hidden' }}>
      <style>{`.vw{position:relative;width:calc(100% + 18vw);margin-left:-18vw;aspect-ratio:1;cursor:pointer}
      @media(max-width:860px){.vw{width:calc(100% + 10vw);margin-left:-10vw}}
      .ctl{display:flex;align-items:center;gap:18px;margin:8px 0 20px}.ctl button{font-family:'JetBrains Mono';font-size:14px;transition:.3s}.ctl button:hover{color:var(--red);transform:scale(1.15)}
      .ctl input{flex:1;accent-color:var(--red)}`}</style>
      <div className="split" style={{ alignItems: 'center' }}>
        <div className="vw" onClick={() => setPlaying(!playing)} role="button" aria-label={playing ? 'Pause' : 'Lecture'}>
          <Suspense fallback={null}><Vinyl3D playing={playing} kick={i} color={cur.color} title={cur.title} num={i + 1} progress={progress} /></Suspense>
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(48px,9vw,130px)' }}>VOS<br />CHANSONS</h1>
          <AnimatePresence mode="wait">
            <motion.p key={cur.id} className="mono" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: '16px 0 4px', color: 'var(--red)' }}>
              {String(i + 1).padStart(2, '0')}. {cur.title} — {cur.artist}
            </motion.p>
          </AnimatePresence>
          <audio ref={a} src={cur.src} onTimeUpdate={e => setT(e.currentTarget.currentTime)} onLoadedMetadata={e => setDur(e.currentTarget.duration)} onEnded={() => go(1)} />
          <div className="ctl">
            <button aria-label="Précédent" onClick={() => go(-1)}>◀◀</button>
            <button aria-label={playing ? 'Pause' : 'Lecture'} onClick={() => setPlaying(!playing)}>{playing ? '❚❚' : '▶'}</button>
            <button aria-label="Suivant" onClick={() => go(1)}>▶▶</button>
            <input type="range" min={0} max={1} step={0.001} value={progress} aria-label="Position" onChange={e => { if (a.current && dur) a.current.currentTime = +e.target.value * dur }} />
            <span className="mono">{fmt(t)} / {dur ? fmt(dur) : cur.dur}</span>
          </div>
          {cur.link && <a className="mono" href={cur.link} target="_blank" rel="noreferrer">Écouter sur la plateforme ↗</a>}
          {list.map((s, k) => (
            <button key={s.id} className={'track' + (k === i ? ' on' : '')} onClick={() => { setI(k); setPlaying(true) }}>
              {k === i && <motion.span layoutId="act" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--red)' }} />}
              <span className="mono">{String(k + 1).padStart(2, '0')}</span><div className="sq" style={{ background: s.color }} />
              <span><b style={{ fontWeight: 500 }}>{s.title}</b><br /><span className="mono">{s.artist}{s.status === 'pending' ? ' · en validation' : ''}</span></span><span className="mono">{s.dur}</span>
            </button>
          ))}
          <Link className="btn" style={{ marginTop: 24 }} to="/ajouter">Proposer une chanson</Link>
        </div>
      </div>
    </div>
  )
}
