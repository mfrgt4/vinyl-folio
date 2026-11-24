import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './styles.css'
// reducedMotion="user" => Framer Motion respecte prefers-reduced-motion
createRoot(document.getElementById('root')!).render(
  <BrowserRouter><MotionConfig reducedMotion="user"><App/></MotionConfig></BrowserRouter>)
