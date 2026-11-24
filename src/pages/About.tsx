import { lazy, Suspense, useState } from 'react'
import { motion } from 'framer-motion'
const Booklet = lazy(() => import('../three/Booklet'))
export default function About() {
  const [open, setOpen] = useState(false)
  const lines = ['TRACK 01 — Présentation','Étudiant en design, passionné de musique et de typographie.','TRACK 02 — Vision','Créer des objets numériques qui se touchent comme des disques.']
  return (<div className="page"><p className="mono">03 — À propos</p>
    <div role="button" tabIndex={0} aria-expanded={open} aria-label={open?'Fermer le livret':'Ouvrir le livret'} onClick={()=>setOpen(!open)} onKeyDown={e=>e.key==='Enter'&&setOpen(!open)}
      style={{position:'relative',aspectRatio:'16/9',maxWidth:1100,margin:'20px auto',cursor:'pointer'}}>
      <Suspense fallback={null}><div style={{position:'absolute',inset:0}}><Booklet open={open}/></div></Suspense>
      <motion.div initial={false} animate={{opacity:open?1:0}} transition={{delay:open?.7:0,duration:.6}} style={{position:'absolute',left:'24.5%',top:'20.5%',width:'51%',height:'59%',display:'grid',gridTemplateColumns:'1fr 1fr',pointerEvents:'none'}}>
        <motion.div animate={{scale:open?1.04:1}} transition={{duration:6}} style={{background:'linear-gradient(135deg,#fff,#555 70%,#111)',filter:'grayscale(1) contrast(1.2)'}} aria-label="Portrait (à remplacer par votre photo)"/>
        <div style={{background:'#171717',color:'#ddd',padding:'6%',fontSize:'clamp(8px,1.2vw,14px)'}}>
          {lines.map((l,k)=><motion.p key={k} className={k%2?'':'mono'} initial={false} animate={{opacity:open?1:0,y:open?0:10}} transition={{delay:1+k*.2}} style={{marginBottom:10}}>{l}</motion.p>)}
        </div></motion.div>
    </div>
    <p className="mono" style={{textAlign:'center'}}>{open?'Cliquer pour refermer':'Cliquer pour ouvrir le livret'}</p></div>)
}
