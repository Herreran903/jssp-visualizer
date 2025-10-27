// src/components/scene/CameraHelper.tsx
"use client";

import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3, Euler } from "three";

export function CameraHelper() {
  const { camera } = useThree();

  const logCameraPosition = () => {
    const pos = camera.position;
    const rot = camera.rotation;

    console.clear();
    console.log(
      `Posición: new Vector3(${pos.x.toFixed(2)}, ${pos.y.toFixed(
        2
      )}, ${pos.z.toFixed(2)})`
    );
    console.log(
      `Rotación: new Euler(${rot.x.toFixed(2)}, ${rot.y.toFixed(
        2
      )}, ${rot.z.toFixed(2)})`
    );
  };

  return <OrbitControls onChange={logCameraPosition} />;
}
