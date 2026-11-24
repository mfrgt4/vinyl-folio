import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
interface P { playing:boolean; kick:number; color:string }
function Disc({ playing, kick, color }: P) {
  const g = useRef<THREE.Group>(null); const light = useRef<THREE.PointLight>(null); const v = useRef(0)
  useEffect(() => { v.current = -12 }, [kick]) // "scratch" à chaque changement de titre
  useFrame(({ clock }, d) => {
    v.current += ((playing ? 2.4 : 0) - v.current) * Math.min(1, d * 2.5) // inertie
    if (g.current) g.current.rotation.z += v.current * d
    if (light.current) light.current.position.set(Math.cos(clock.elapsedTime) * 3, Math.sin(clock.elapsedTime * .7) * 3, 2.5) // reflets mouvants
  })
  return (<group rotation={[0.15, -0.3, 0]}>
    <group ref={g}>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2.2,2.2,.05,96]}/><meshStandardMaterial color="#111" metalness={.8} roughness={.25}/></mesh>
      {Array.from({length:18},(_, i)=><mesh key={i} position={[0,0,.026]}><ringGeometry args={[.9+i*.07,.915+i*.07,96]}/><meshStandardMaterial color="#222" metalness={1} roughness={.15}/></mesh>)}
      <mesh position={[0,0,.03]}><circleGeometry args={[.7,64]}/><meshStandardMaterial color={color}/></mesh>
      <mesh position={[0,0,.035]}><circleGeometry args={[.06,16]}/><meshBasicMaterial color="#E8E7E2"/></mesh>
    </group>
    <ambientLight intensity={.4}/><pointLight ref={light} intensity={60} color="#fff"/>
  </group>)
}
export default function Vinyl3D(p: P) { return <Canvas dpr={[1,1.5]} camera={{position:[0,0,6],fov:35}}><Disc {...p}/></Canvas> }
