// src/components/scene/SceneContainer.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { AnimatedCamera } from "./animated-camera";
import { ReactNode, useEffect, useState } from "react";
import { CameraHelper } from "./camera-helper";

interface SceneContainerProps {
  children: ReactNode;
  isSolved: boolean;
}

export default function SceneContainer({
  children,
  isSolved,
}: SceneContainerProps) {
  const [lightIntensity, setLightIntensity] = useState(0);
  useEffect(() => {
    const flickerSequence = [
      { intensity: 0, delay: 0 },
      { intensity: 200, delay: 200 }, // On
      { intensity: 0, delay: 300 }, // Off
      { intensity: 200, delay: 500 }, // On
      { intensity: 50, delay: 600 }, // Dim
      { intensity: 200, delay: 800 }, // On (final)
    ];

    const timeouts: NodeJS.Timeout[] = [];

    const runFlicker = () => {
      flickerSequence.forEach((step) => {
        timeouts.push(
          setTimeout(() => {
            setLightIntensity(step.intensity);
          }, step.delay)
        );
      });
    };

    runFlicker();
    const intervalId = setInterval(runFlicker, 10000);

    return () => {
      clearInterval(intervalId);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <Canvas shadows className="h-screen w-full">
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 15, 30]} />
      <ambientLight intensity={0.1} />
      <spotLight
        color="#FFFFE0"
        position={[0, 12, 5]}
        angle={0.8}
        penumbra={0.2}
        intensity={lightIntensity}
        castShadow
        target-position={[0, 0, 0]}
      />

      <AnimatedCamera isTopDown={isSolved} />
      {/* <CameraHelper /> */}

      {children}

      <mesh position={[0, -8, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </Canvas>
  );
}
