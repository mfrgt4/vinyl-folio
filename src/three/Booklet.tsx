import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/** Livret 3D : la couverture pivote autour de la charnière x=0 pour révéler la double page. */
function Book({ open }: { open: boolean }) {
  const root = useRef<THREE.Group>(null); const cover = useRef<THREE.Group>(null); const t = useRef(0)

  // TEXTURE DE LA COUVERTURE - ton GIF
  const coverTexture = useLoader(THREE.TextureLoader, '/images/couverture.mp4')
  coverTexture.colorSpace = THREE.SRGBColorSpace

  useFrame(({ clock }, d) => {
    t.current += ((open ? 1 : 0) - t.current) * Math.min(1, d * 3.2)
    const e = t.current
    if (cover.current) cover.current.rotation.y = -Math.PI * .995 * e
    if (root.current) { root.current.position.x = -(1 - e); root.current.position.y = open ? 0 : Math.sin(clock.elapsedTime * 1.4) * .06
      root.current.rotation.x = -.25 * (1 - e); root.current.rotation.y = -.35 * (1 - e) }
  })

  const paper = new THREE.MeshStandardMaterial({ color: '#F5F4F0' })
  const dark = new THREE.MeshStandardMaterial({ color: '#171717', roughness: .6 })
  const coverMat = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: .6 })

  return (<group ref={root}>
    <mesh position={[1,0,0]} material={paper}><boxGeometry args={[2,2.6,.04]}/></mesh>
    <mesh position={[0,-1.45,-.3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,3]}/><shadowMaterial opacity={.15}/></mesh>
    <group ref={cover}>
      {/* Ordre des faces : [+x, -x, +y, -y, +z avant, -z] -> on met le GIF sur la face avant */}
      <mesh position={[1,0,.05]} material={[paper,paper,paper,paper,coverMat,paper]}><boxGeometry args={[2,2.6,.04]}/></mesh>
    </group>
    <ambientLight intensity={.9}/><directionalLight position={[3,4,5]} intensity={1.2}/>
  </group>)
}

export default function Booklet({ open }: { open: boolean }) {
  return <Canvas dpr={[1,1.5]} camera={{position:[0,0,7],fov:35}}><Book open={open}/></Canvas>
}