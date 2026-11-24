import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLS } from '../hooks'
import { SONGS, Song } from '../data'
const Vinyl3D = lazy(() => import('../three/Vinyl3D'))
export default function Songs() {
  const [saved] = useLS<Song[]>('vf-songs', []); const list = [...SONGS, ...saved] // propositions visibles en démo, marquées "en validation"
  const [i, setI] = useState(0); const [playing, setPlaying] = useState(false); const a = useRef<HTMLAudioElement>(null); const cur = list[i]
  useEffect(() => { if (!a.current) return; if (playing && cur.src) a.current.play().catch(()=>setPlaying(false)); else a.current.pause() }, [playing, i])
  return (<div className="page"><div className="split" style={{alignItems:'center'}}>
    <div style={{height:'min(80vw,520px)'}} onClick={()=>setPlaying(!playing)} role="button" aria-label="Lecture / pause"><Suspense fallback={null}><Vinyl3D playing={playing} kick={i} color={cur.color}/></Suspense></div>
    <div>
      <h1 style={{fontSize:'clamp(48px,9vw,130px)'}}>VOS<br/>CHANSONS</h1>
      <AnimatePresence mode="wait"><motion.p key={cur.id} className="mono" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{margin:'16px 0',color:'var(--red)'}}>{String(i+1).padStart(2,'0')}. {cur.title}</motion.p></AnimatePresence>
      <audio ref={a} src={cur.src} onEnded={()=>setI((i+1)%list.length)}/>
      {cur.link && <a className="mono" href={cur.link} target="_blank" rel="noreferrer">Écouter sur la plateforme ↗</a>}
      {list.map((s,k)=><button key={s.id} className={'track'+(k===i?' on':'')} onClick={()=>{setI(k);setPlaying(true)}}>
        {k===i&&<motion.span layoutId="act" style={{position:'absolute',left:0,top:0,bottom:0,width:2,background:'var(--red)'}}/>}
        <span className="mono">{String(k+1).padStart(2,'0')}</span><div className="sq" style={{background:s.color}}/>
        <span><b style={{fontWeight:500}}>{s.title}</b><br/><span className="mono">{s.artist}{s.status==='pending'?' · en validation':''}</span></span><span className="mono">{s.dur}</span></button>)}
      <Link className="btn" style={{marginTop:24}} to="/ajouter">Proposer une chanson</Link>
    </div></div></div>)
}
