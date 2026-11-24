import { lazy, Suspense } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
const Particles = lazy(() => import('../three/Particles'))
const mobile = typeof window !== 'undefined' && window.innerWidth < 768 // pas de 3D sur mobile
export default function Home() {
  const { scrollY } = useScroll(); const y = useTransform(scrollY, [0, 600], [0, 120]); const s = useTransform(scrollY, [0, 600], [1, 1.15])
  return (<div className="page">
    <section className="hero">
      <motion.div style={{position:'absolute',inset:0,y,scale:s,background:'radial-gradient(circle at 50% 50%,#873B4344,#171717 60%)'}}/>
      {!mobile && <Suspense fallback={null}><Particles/></Suspense>}
      <p className="mono" style={{color:'#aaa'}}>Plateforme musicale personnelle & collaborative</p>
      <h1 aria-label="Vinyl Folio">{'VINYL FOLIO'.split('').map((c,i)=><motion.span key={i} style={{display:'inline-block',whiteSpace:'pre'}} initial={{y:'110%',opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.4+i*.04,duration:.8,ease:[.2,.8,.2,1]}}>{c}</motion.span>)}</h1>
      <div style={{display:'flex',gap:16,marginTop:32,marginBottom:48}}><Link className="btn" to="/mes-musiques">Mes Musiques</Link><Link className="btn" to="/ajouter">Ajouter une musique</Link></div>
    </section>
    <section className="split" style={{padding:'120px 0'}}>
      <motion.h2 initial={{opacity:0,x:-60}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.9}}>Un univers,<br/>des disques.</motion.h2>
      <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.9,delay:.15}} style={{alignSelf:'end'}}>
        <p className="mono">01 — À propos</p><p style={{maxWidth:420,margin:'12px 0 24px'}}>Un portfolio qui se parcourt comme une collection de disques. Ouvrez le livret, écoutez les morceaux partagés, rejoignez la conversation.</p><Link className="btn" to="/a-propos">Ouvrir le livret</Link>
      </motion.div>
    </section>
    <div className="marquee" aria-hidden><div>{Array(8).fill('Figma — Three.js — Vinyle — Swiss Design — Label — ').join('')}</div></div>
    <section style={{background:'var(--ink)',color:'var(--paper)',margin:'80px -4vw -60px',padding:'100px 4vw'}}>
      <motion.h2 initial={{opacity:0,y:80}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:1}}>Parlons.</motion.h2>
      <p className="mono" style={{marginTop:24}}>contact@exemple.fr</p>
    </section>
  </div>)
}
