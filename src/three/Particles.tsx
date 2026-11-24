import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
function Dust() {
  const ref = useRef<THREE.Points>(null)
  const pos = useMemo(() => new Float32Array(Array.from({length:600},()=> (Math.random()-.5)*10)), [])
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * .02 })
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={200} itemSize={3}/></bufferGeometry><pointsMaterial size={.02} color="#F5F4F0" transparent opacity={.5}/></points>
}
export default function Particles() { return <Canvas dpr={[1,1.5]} camera={{position:[0,0,5]}}><Dust/></Canvas> }
