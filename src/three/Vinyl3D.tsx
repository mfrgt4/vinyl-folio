import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

interface P {
  playing: boolean
  kick: number
  color: string
  title: string
  num: number
  progress: number
  cover?: string
}

const PINK = '#BF2158'

const toTex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

const makeCanvas = (S: number) => {
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  return c
}

/** Sillons fins + séparations de pistes */
function grooveTexture() {
  const S = 1024
  const c = makeCanvas(S)
  const g = c.getContext('2d')
  if (!g) return toTex(c)
  const R = S / 2
  g.fillStyle = '#0c0c0c'
  g.fillRect(0, 0, S, S)
  for (let r = R * 0.32; r < R * 0.985; r += 2.2) {
    g.beginPath()
    g.arc(R, R, r, 0, Math.PI * 2)
    g.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.05})`
    g.lineWidth = 1
    g.stroke()
  }
  for (const r of [0.5, 0.64, 0.78, 0.9]) {
    g.beginPath()
    g.arc(R, R, R * r, 0, Math.PI * 2)
    g.strokeStyle = 'rgba(0,0,0,.9)'
    g.lineWidth = 5
    g.stroke()
  }
  return toTex(c)
}

/** Reflet — version compatible partout, sans createConicGradient */
function sheenTexture() {
  const S = 512
  const c = makeCanvas(S)
  const g = c.getContext('2d')
  if (!g) return toTex(c)
  const R = S / 2
  // Deux éclats doux opposés, dessinés à la main
  g.clearRect(0, 0, S, S)
  for (const angle of [Math.PI * 0.25, Math.PI * 1.25]) {
    const grad = g.createLinearGradient(
      R + Math.cos(angle) * R,
      R + Math.sin(angle) * R,
      R,
      R
    )
    grad.addColorStop(0, 'rgba(255,255,255,0.28)')
    grad.addColorStop(0.5, 'rgba(255,255,255,0.06)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.beginPath()
    g.moveTo(R, R)
    g.arc(R, R, R, angle - 0.18, angle + 0.18)
    g.closePath()
    g.fill()
  }
  return toTex(c)
}

/** Label texte (secours quand il n'y a pas de pochette) */
function labelTexture(title: string, num: number, color: string) {
  const S = 512
  const c = makeCanvas(S)
  const g = c.getContext('2d')
  if (!g) return toTex(c)
  const R = S / 2
  g.fillStyle = color
  g.beginPath()
  g.arc(R, R, R, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#F5F4F0'
  g.beginPath()
  g.arc(R, R, R * 0.88, 0, Math.PI * 2)
  g.fill()
  // Petites barres roses
  g.fillStyle = PINK
  ;[0, 1, 2].forEach((i) => {
    g.fillRect(R - 24 + i * 18, R - 80 - (i === 1 ? 26 : 12), 10, i === 1 ? 26 : 12)
  })
  g.fillStyle = '#171717'
  g.textAlign = 'center'
  g.font = '500 26px monospace'
  g.fillText(String(num).padStart(2, '0') + '.', R, R + 4)
  g.font = '600 32px sans-serif'
  const words = title.toUpperCase().split(' ')
  const lines: string[] = ['']
  words.forEach((w) => {
    const l = lines[lines.length - 1]
    if ((l + ' ' + w).length > 14 && l) lines.push(w)
    else lines[lines.length - 1] = (l + ' ' + w).trim()
  })
  lines.slice(0, 3).forEach((l, k) => g.fillText(l, R, R + 44 + k * 36))
  return toTex(c)
}

/** Label = pochette recadrée en rond, avec liseré et trou central */
function coverTexture(img: HTMLImageElement, color: string) {
  const S = 512
  const c = makeCanvas(S)
  const g = c.getContext('2d')
  if (!g) return toTex(c)
  const R = S / 2
  g.save()
  g.beginPath()
  g.arc(R, R, R, 0, Math.PI * 2)
  g.clip()
  const s = Math.min(img.width, img.height)
  g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, S, S)
  g.restore()
  g.strokeStyle = color
  g.lineWidth = 8
  g.beginPath()
  g.arc(R, R, R - 4, 0, Math.PI * 2)
  g.stroke()
  // Trou central
  g.fillStyle = '#E8E7E2'
  g.beginPath()
  g.arc(R, R, 14, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#111'
  g.beginPath()
  g.arc(R, R, 4, 0, Math.PI * 2)
  g.fill()
  return toTex(c)
}

/** Charge la pochette ; sinon retombe sur le label texte */
function useLabel(title: string, num: number, color: string, cover?: string) {
  const [tex, setTex] = useState<THREE.CanvasTexture>(() => labelTexture(title, num, color))

  useEffect(() => {
    let dead = false
    let next: THREE.CanvasTexture | null = null

    if (!cover) {
      next = labelTexture(title, num, color)
      setTex((old) => {
        if (old) old.dispose()
        return next as THREE.CanvasTexture
      })
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (dead) return
      const t = coverTexture(img, color)
      setTex((old) => {
        if (old) old.dispose()
        return t
      })
    }
    img.onerror = () => {
      if (dead) return
      const t = labelTexture(title, num, color)
      setTex((old) => {
        if (old) old.dispose()
        return t
      })
    }
    img.src = cover

    return () => {
      dead = true
    }
  }, [title, num, color, cover])

  return tex
}

function Scene({ playing, kick, color, title, num, progress, cover }: P) {
  const spin = useRef<THREE.Group>(null)
  const sheen = useRef<THREE.Mesh>(null)
  const v = useRef(0)

  const grooves = useMemo(() => grooveTexture(), [])
  const shine = useMemo(() => sheenTexture(), [])
  const label = useLabel(title, num, color, cover)

  const arc = useMemo(() => {
    const len = Math.max(0.001, progress * Math.PI * 2)
    return new THREE.RingGeometry(2.42, 2.44, 128, 1, 0, len)
  }, [progress])

  useEffect(() => {
    return () => {
      arc.dispose()
    }
  }, [arc])

  useEffect(() => {
    return () => {
      grooves.dispose()
      shine.dispose()
    }
  }, [grooves, shine])

  // Scratch au changement de titre
  useEffect(() => {
    v.current = -14
  }, [kick])

  useFrame(({ clock }, d) => {
    const target = playing ? 2.6 : 0
    v.current += (target - v.current) * Math.min(1, d * 2.2)
    if (spin.current) spin.current.rotation.z += v.current * d
    if (sheen.current) sheen.current.rotation.z = clock.elapsedTime * 0.15
  })

  const a = progress * Math.PI * 2
  const labelR = cover ? 0.95 : 0.75

  return (
    <group>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.05, 96]} />
          <meshStandardMaterial color="#070707" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <circleGeometry args={[2.2, 128]} />
          <meshStandardMaterial map={grooves} metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <circleGeometry args={[labelR, 64]} />
          <meshBasicMaterial map={label} />
        </mesh>
        {/* Trou central */}
        <mesh position={[0, 0, 0.034]}>
          <circleGeometry args={[0.05, 24]} />
          <meshBasicMaterial color="#E8E7E2" />
        </mesh>
      </group>

      <mesh ref={sheen} position={[0, 0, 0.03]}>
        <circleGeometry args={[2.2, 128]} />
        <meshBasicMaterial map={shine} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <ringGeometry args={[2.42, 2.435, 128]} />
          <meshBasicMaterial color="#D2D1CC" />
        </mesh>
        <mesh geometry={arc}>
          <meshBasicMaterial color={PINK} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[Math.cos(a) * 2.43, Math.sin(a) * 2.43, 0.01]}>
          <circleGeometry args={[0.06, 24]} />
          <meshBasicMaterial color={PINK} />
        </mesh>
      </group>

      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 5]} intensity={1.4} />
    </group>
  )
}

export default function Vinyl3D(p: P) {
  return (
    <Canvas flat dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 30 }}>
      <Scene {...p} />
    </Canvas>
  )
}