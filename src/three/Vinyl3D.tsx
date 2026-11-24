import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface P { playing: boolean; kick: number; color: string; title: string; num: number; progress: number }

const toTex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
const canvas = (S: number) => { const c = document.createElement('canvas'); c.width = c.height = S; return c }

/** Sillons fins + séparations de pistes, dessinés une seule fois sur une texture */
function grooveTexture() {
  const S = 1024, c = canvas(S), g = c.getContext('2d')!, R = S / 2
  g.fillStyle = '#0c0c0c'; g.fillRect(0, 0, S, S)
  for (let r = R * 0.32; r < R * 0.985; r += 2.2) {
    g.beginPath(); g.arc(R, R, r, 0, Math.PI * 2)
    g.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.05})`; g.lineWidth = 1; g.stroke()
  }
  for (const r of [0.5, 0.64, 0.78, 0.9]) {
    g.beginPath(); g.arc(R, R, R * r, 0, Math.PI * 2); g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 5; g.stroke()
  }
  return toTex(c)
}

/** Reflet conique (2 éclats opposés), non rotatif => effet "vrai vinyle" quand le disque tourne */
function sheenTexture() {
  const S = 512, c = canvas(S), g = c.getContext('2d')!
  const gr = g.createConicGradient(0, S / 2, S / 2)
  const st: [number, number][] = [[0, 0], [.07, .3], [.15, 0], [.5, 0], [.57, .22], [.65, 0], [1, 0]]
  st.forEach(([p, a]) => gr.addColorStop(p, `rgba(255,255,255,${a})`))
  g.fillStyle = gr; g.fillRect(0, 0, S, S)
  return toTex(c)
}

/** Label central : papier clair, liseré de couleur, n° + titre de la piste en cours */
function labelTexture(title: string, num: number, color: string) {
  const S = 512, c = canvas(S), g = c.getContext('2d')!, R = S / 2
  g.fillStyle = color; g.beginPath(); g.arc(R, R, R, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#F5F4F0'; g.beginPath(); g.arc(R, R, R * .88, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#873B43'; [0, 1, 2].forEach(i => g.fillRect(R - 24 + i * 18, R - 80 - (i === 1 ? 26 : 12), 10, (i === 1 ? 26 : 12)))
  g.fillStyle = '#171717'; g.textAlign = 'center'
  g.font = '500 26px monospace'; g.fillText(String(num).padStart(2, '0') + '.', R, R + 4)
  g.font = '600 32px sans-serif'
  const words = title.toUpperCase().split(' '); const lines: string[] = ['']
  words.forEach(w => { const l = lines[lines.length - 1]; if ((l + ' ' + w).length > 14 && l) lines.push(w); else lines[lines.length - 1] = (l + ' ' + w).trim() })
  lines.slice(0, 3).forEach((l, k) => g.fillText(l, R, R + 44 + k * 36))
  return toTex(c)
}

function Scene({ playing, kick, color, title, num, progress }: P) {
  const spin = useRef<THREE.Group>(null), sheen = useRef<THREE.Mesh>(null)
  const v = useRef(0)
  const grooves = useMemo(grooveTexture, []), shine = useMemo(sheenTexture, [])
  const label = useMemo(() => labelTexture(title, num, color), [title, num, color])
  const arc = useMemo(() => new THREE.RingGeometry(2.42, 2.44, 128, 1, 0, Math.max(.001, progress * Math.PI * 2)), [progress])
  useEffect(() => () => arc.dispose(), [arc])
  useEffect(() => { v.current = -14 }, [kick]) // scratch au changement de titre

  useFrame(({ clock }, d) => {
    v.current += ((playing ? 2.6 : 0) - v.current) * Math.min(1, d * 2.2) // inertie au démarrage / à l'arrêt
    if (spin.current) spin.current.rotation.z += v.current * d
    if (sheen.current) sheen.current.rotation.z = clock.elapsedTime * .15
  })

  const a = progress * Math.PI * 2
  return (
    <group>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[2.2, 2.2, .05, 96]} /><meshStandardMaterial color="#070707" roughness={.5} /></mesh>
        <mesh position={[0, 0, .026]}><circleGeometry args={[2.2, 128]} /><meshStandardMaterial map={grooves} metalness={.35} roughness={.45} /></mesh>
        <mesh position={[0, 0, .032]}><circleGeometry args={[.75, 64]} /><meshBasicMaterial map={label} /></mesh>
        <mesh position={[0, 0, .034]}><circleGeometry args={[.05, 24]} /><meshBasicMaterial color="#E8E7E2" /></mesh>
      </group>
      <mesh ref={sheen} position={[0, 0, .03]}><circleGeometry args={[2.2, 128]} /><meshBasicMaterial map={shine} transparent blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* Anneau de progression : fin trait gris + arc rouge + point (comme la maquette) */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh><ringGeometry args={[2.42, 2.435, 128]} /><meshBasicMaterial color="#D2D1CC" /></mesh>
        <mesh geometry={arc}><meshBasicMaterial color="#873B43" /></mesh>
        <mesh position={[Math.cos(a) * 2.43, Math.sin(a) * 2.43, .01]}><circleGeometry args={[.06, 24]} /><meshBasicMaterial color="#873B43" /></mesh>
      </group>
      <ambientLight intensity={.9} /><directionalLight position={[2, 3, 5]} intensity={1.4} />
    </group>
  )
}

export default function Vinyl3D(p: P) {
  return <Canvas flat dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 30 }}><Scene {...p} /></Canvas>
}
