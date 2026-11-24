import { lazy, Suspense, useState } from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
// Les pages 3D sont chargées à la demande (lazy) pour la performance
const Records = lazy(() => import('./pages/Records'))
const About = lazy(() => import('./pages/About'))
const Songs = lazy(() => import('./pages/Songs'))
const Community = lazy(() => import('./pages/Community'))
const Submit = lazy(() => import('./pages/Submit'))
const LINKS: [string,string][] = [['/a-propos','A Propos'],['/mes-musiques','Mes Musiques'],['/a-decouvrir','A Découvrir'],['/communaute','Communauté'],['/ajouter','Ajouter une musique']]
export default function App() {
  const loc = useLocation(); const [open, setOpen] = useState(false)
  return (<>
    <header className="nav">
      <Link to="/" style={{font:'800 20px Archivo'}} onClick={()=>setOpen(false)}>VF●</Link>
      <button className="burger mono" style={{color:'#fff',zIndex:2}} aria-label="Menu" onClick={()=>setOpen(!open)}>{open?'Fermer':'Menu'}</button>
      <nav className={open?'open':''}>{LINKS.map(([to,l])=><NavLink key={to} to={to} className={({isActive})=>isActive?'on':''} onClick={()=>setOpen(false)}>{l}</NavLink>)}</nav>
    </header>
    <AnimatePresence mode="wait">
      <motion.main key={loc.pathname} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:.55,ease:[.7,0,.2,1]}}>
        <Suspense fallback={<div className="page mono">Chargement…</div>}>
          <Routes location={loc}>
            <Route path="/" element={<Home/>}/><Route path="/a-propos" element={<About/>}/><Route path="/mes-musiques" element={<Records/>}/>
            <Route path="/a-decouvrir" element={<Songs/>}/><Route path="/communaute" element={<Community/>}/><Route path="/ajouter" element={<Submit/>}/>
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  </>)
}
