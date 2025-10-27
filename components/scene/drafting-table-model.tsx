// src/components/scene/drafting-table-model.tsx
'use client'

import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

const MODEL_URL = "models/DraftingTable.glb"

export default function DraftingTableModel() {
  const { scene } = useGLTF(MODEL_URL)
  const modelRef = useRef<THREE.Group>(null)

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={3}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]}
    />
  )
}